
-- Clean up existing admin data
DELETE FROM public.profiles WHERE role = 'admin';

-- Create a new admin user with proper credentials
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'admin@kiki.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "KIKI Admin"}',
  false,
  'authenticated'
);

-- Insert corresponding profile record for the admin user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@kiki.com',
  'KIKI Admin',
  'admin',
  now(),
  now()
);

-- Ensure the is_admin function exists and works properly
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create admin dashboard specific policies
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Ensure admins can see all user data
DROP POLICY IF EXISTS "Admins can view all user data" ON public.profiles;
CREATE POLICY "Admins can view all user data" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()) OR auth.uid() = id);

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
