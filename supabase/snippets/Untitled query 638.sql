-- Replace 'YOUR_AUTH_ID' with the 'sub' from your JWT
DO $$ 
DECLARE
    target_auth_id uuid := '99f674df-d389-412e-820c-d90950b405a7';
    new_user_id uuid;
    new_org_id uuid;
BEGIN
    -- 1. Create the public profile
    INSERT INTO public.users (auth_id, full_name)
    VALUES (target_auth_id, 'Test User')
    RETURNING id INTO new_user_id;

    -- 2. Create the org
    INSERT INTO public.organizations (name, created_by)
    VALUES ('Default Org', new_user_id)
    RETURNING id INTO new_org_id;

    -- 3. Link them
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, new_user_id, 'owner');
END $$;