
-- Insert admin user into auth.users table
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'kiki@admin.com',
  crypt('kiki@123', gen_salt('bf')),
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
  (SELECT id FROM auth.users WHERE email = 'kiki@admin.com'),
  'kiki@admin.com',
  'KIKI Admin',
  'admin',
  now(),
  now()
);
