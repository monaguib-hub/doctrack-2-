import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpopgwvdyfvexeakcvvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb3Bnd3ZkeWZ2ZXhlYWtjdnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDU5NDAsImV4cCI6MjA4NzYyMTk0MH0.MH_YAr2GYQygVn3jUIPiMc-tHVEEGuPlPl_Scw7YegQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Fetching document IDs...');
  const { data: docsData, error: docsError } = await supabase.from('documents')
    .select('id, attachment_name')
    .not('attachment_url', 'is', null);
  
  if (docsError) {
    console.error('Error fetching documents', docsError);
    return;
  }

  console.log(`Found ${docsData.length} records. Processing one by one to avoid timeout...`);
  
  for (const doc of docsData) {
    try {
      const { data: docWithUrl, error } = await supabase.from('documents')
        .select('attachment_url')
        .eq('id', doc.id)
        .single();
        
      const attachment_url = docWithUrl?.attachment_url;
      if (!attachment_url || !attachment_url.startsWith('data:')) continue;

      const head = attachment_url.split(';base64,')[0];
      const mimeType = head.replace('data:', '');
      const base64Data = attachment_url.split(';base64,')[1];
      if (!base64Data) continue;
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = doc.attachment_name || `attachment.bin`;
      const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${doc.id}_${safeName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true
        });
        
      if (uploadError) {
        console.error(`Failed to upload ${storagePath}:`, uploadError);
        continue;
      }
      
      const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(storagePath);
      const publicUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase.from('documents')
        .update({ attachment_url: publicUrl })
        .eq('id', doc.id);
        
      if (updateError) {
        console.error(`Failed to update doc ${doc.id}:`, updateError);
      } else {
        console.log(`Successfully migrated ${doc.id}`);
      }
    } catch (e) {
      console.error(`Exception on doc ${doc.id}:`, e);
    }
  }
}

run();
