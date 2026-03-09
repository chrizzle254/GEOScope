-- Function to automatically create user profile and organization membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
  new_org_id UUID;
BEGIN
  -- Create user profile in public.users with auth_id referencing auth.users.id
  INSERT INTO public.users (auth_id, full_name)
  VALUES (
    NEW.id,  -- This is the auth.users.id
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  RETURNING id INTO new_user_id;

  -- Create a default organization for the user
  INSERT INTO public.organizations (name, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Organization',
    new_user_id
  )
  RETURNING id INTO new_org_id;

  -- Add user as owner of the organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, new_user_id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
