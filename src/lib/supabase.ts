import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpopgwvdyfvexeakcvvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb3Bnd3ZkeWZ2ZXhlYWtjdnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDU5NDAsImV4cCI6MjA4NzYyMTk0MH0.MH_YAr2GYQygVn3jUIPiMc-tHVEEGuPlPl_Scw7YegQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: sessionStorage,
        persistSession: true,
    },
});
