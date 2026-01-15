-- Seed File: 02_users.sql
-- Description: Creates test user and assigns roles
-- Auto-runs on `supabase db reset` when db.seed.enabled = true in config.toml

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. Create Test User (test@test.com / password / John Doe)
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_superadmin_role_id UUID;
BEGIN
    -- Insert test user into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
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
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'test@test.com',
        crypt('password', gen_salt('bf')),  -- Bcrypt hash of 'password'
        now(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"first_name":"John", "last_name":"Doe"}'::jsonb,
        NULL,
        now(),
        now(),
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
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE '✓ Test user created: test@test.com (password: password)';
    RAISE NOTICE '  User ID: %', v_user_id;
    RAISE NOTICE '  Full Name: John Doe';

    -- Get SuperAdmin role ID
    SELECT id INTO v_superadmin_role_id
    FROM public.roles
    WHERE level = 100
    LIMIT 1;

    -- Update the auto-created Guest role to SuperAdmin
    -- (The trigger on_auth_user_created automatically creates a Guest role)
    UPDATE public.user_roles
    SET role_id = v_superadmin_role_id,
        updated_at = now(),
        updated_by = v_user_id
    WHERE user_id = v_user_id;

    RAISE NOTICE '✓ SuperAdmin role assigned to test@test.com';

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE '⚠ Test user test@test.com already exists - skipping creation';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating test user: %', SQLERRM;
END $$;

