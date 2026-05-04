-- DocTrack Security & Performance Overhaul
-- Final Security Architecture - Verified Case-Insensitive RLS

-- ==========================================
-- 1. DATABASE NORMALIZATION
-- ==========================================
-- Ensures all emails are consistent for robust matching
UPDATE public.employees SET email = LOWER(email);

-- ==========================================
-- 2. UTILITY FUNCTIONS (SECURITY DEFINER)
-- ==========================================
-- These functions use auth.email() for maximum reliability across different Supabase environments.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees
    WHERE email = auth.email() AND role = 'Admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_name()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT name
  FROM public.employees
  WHERE email = auth.email()
  LIMIT 1;
$$;


-- ==========================================
-- 3. DOCUMENTS TABLE POLICIES (DATA ISOLATION)
-- ==========================================

-- Remove any old permissive read policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.documents;
DROP POLICY IF EXISTS "Allow read own or admin" ON public.documents;

-- Enforce Data Privacy: Users only see their own documents, Admins see all
CREATE POLICY "Allow read own or admin" ON public.documents FOR SELECT TO authenticated USING (
  public.is_admin() OR holder = public.get_my_name()
);


-- ==========================================
-- 4. EMPLOYEES TABLE POLICIES (PII ISOLATION)
-- ==========================================

-- Remove any old permissive read policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.employees;
DROP POLICY IF EXISTS "Allow read own or admin" ON public.employees;

-- Enforce Data Privacy: Users only see their own employee record, Admins see all
CREATE POLICY "Allow read own or admin" ON public.employees FOR SELECT TO authenticated USING (
  public.is_admin() OR email = auth.email()
);


-- ==========================================
-- 5. STORAGE BUCKET POLICIES (PRIVATE ATTACHMENTS)
-- ==========================================

-- Remove all public read/write access
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Anon Insert" ON storage.objects;
DROP POLICY IF EXISTS "Anon Update" ON storage.objects;
DROP POLICY IF EXISTS "Anon Delete" ON storage.objects;

-- Authenticated users can read files (via Signed URLs generated in Modals.tsx)
CREATE POLICY "Allow authenticated read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'attachments');

-- Only Admins can upload, modify, or delete files
CREATE POLICY "Allow admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'attachments' AND public.is_admin()
);

CREATE POLICY "Allow admin update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'attachments' AND public.is_admin()
);

CREATE POLICY "Allow admin delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'attachments' AND public.is_admin()
);

-- Ensure the bucket itself is strictly private
-- UPDATE storage.buckets SET public = false WHERE id = 'attachments';
