
-- First, let's clean up the corrupted admin users completely
DELETE FROM public.profiles WHERE email IN ('admin@kiki.com', 'kiki@admin.com');

-- We need to manually clean up the auth.users table (this might need to be done via Supabase dashboard)
-- But let's create a fresh admin user with proper data

-- Create a new admin user with all required fields
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@kiki.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "KIKI Admin"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
) ON CONFLICT (id) DO UPDATE SET
  aud = 'authenticated',
  email = 'admin@kiki.com',
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
  raw_user_meta_data = '{"full_name": "KIKI Admin"}',
  updated_at = NOW();

-- Now create the corresponding profile
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
) ON CONFLICT (id) DO UPDATE SET
  email = 'admin@kiki.com',
  full_name = 'KIKI Admin',
  role = 'admin',
  updated_at = NOW();
