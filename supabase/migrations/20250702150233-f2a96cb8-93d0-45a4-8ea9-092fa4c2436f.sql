
-- Check if admin user already exists and insert if not
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'kiki@admin.com';
    
    -- If admin user doesn't exist, create it
    IF admin_user_id IS NULL THEN
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
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
    
    -- Check if profile exists for admin user
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'kiki@admin.com') THEN
        -- Insert corresponding profile record for the admin user
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'kiki@admin.com',
            'KIKI Admin',
            'admin',
            now(),
            now()
        );
        
        RAISE NOTICE 'Created admin profile';
    ELSE
        RAISE NOTICE 'Admin profile already exists';
    END IF;
END
$$;
