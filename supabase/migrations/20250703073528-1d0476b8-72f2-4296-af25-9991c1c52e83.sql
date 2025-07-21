
-- First, let's clean up any existing admin data
DELETE FROM public.profiles WHERE email = 'admin@kiki.com';

-- Create the admin user in the auth.users table with proper password hashing
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'admin@kiki.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "KIKI Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
);

-- Now create the corresponding profile with admin role
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
  NOW(),
  NOW()
);

-- Make sure the admin can bypass RLS policies
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

-- Update RLS policies to ensure admin access works properly
DROP POLICY IF EXISTS "Admins can view all user data" ON public.profiles;
CREATE POLICY "Admins can view all user data" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()) OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));
