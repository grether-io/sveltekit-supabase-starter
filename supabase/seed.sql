-- Database Seed File
-- Description: Seeds roles and assigns superadmin to example@acme.com
-- Auto-runs on `supabase db reset` when db.seed.enabled = true in config.toml

-- ============================================================================
-- 1. Clear existing data (for idempotent seeding)
-- ============================================================================

TRUNCATE public.user_roles_audit CASCADE;
TRUNCATE public.user_roles CASCADE;
TRUNCATE public.roles CASCADE;

-- ============================================================================
-- 2. Insert Role Definitions
-- ============================================================================

INSERT INTO public.roles (name, description, level) VALUES
    ('Guest', 'Read-only access to backend', 10),
    ('Contributor', 'Submit content for review', 30),
    ('Author', 'Create and publish own content', 50),
    ('Editor', 'Manage all content and media', 70),
    ('Admin', 'User management and settings', 90),
    ('SuperAdmin', 'Full system access', 100);

-- ============================================================================
-- 3. Assign SuperAdmin role to example@acme.com (silent skip if not exists)
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_superadmin_role_id UUID;
BEGIN
    -- Find user with email example@acme.com
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'example@acme.com'
    LIMIT 1;

    -- Only proceed if user exists
    IF v_user_id IS NOT NULL THEN
        -- Get SuperAdmin role ID
        SELECT id INTO v_superadmin_role_id
        FROM public.roles
        WHERE level = 100
        LIMIT 1;

        -- Check if user already has a role assigned
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_user_id) THEN
            -- Assign SuperAdmin role
            INSERT INTO public.user_roles (user_id, role_id, created_by)
            VALUES (v_user_id, v_superadmin_role_id, v_user_id);

            -- Sync to JWT claims
            PERFORM public.sync_user_role_to_jwt(v_user_id, v_superadmin_role_id);

            RAISE NOTICE 'SuperAdmin role assigned to example@acme.com';
        ELSE
            -- Update existing role to SuperAdmin
            UPDATE public.user_roles
            SET role_id = v_superadmin_role_id,
                updated_at = now(),
                updated_by = v_user_id
            WHERE user_id = v_user_id;

            RAISE NOTICE 'Updated existing role to SuperAdmin for example@acme.com';
        END IF;
    ELSE
        RAISE NOTICE 'User example@acme.com not found - skipping SuperAdmin assignment';
    END IF;
END $$;

