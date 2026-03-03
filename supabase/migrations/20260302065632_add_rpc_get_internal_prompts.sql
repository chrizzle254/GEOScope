-- Add RPC function to fetch internal prompts
-- This allows the API to access internal.prompts without exposing the schema via PostgREST

CREATE OR REPLACE FUNCTION public.get_internal_prompts()
RETURNS SETOF internal.prompts
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM internal.prompts;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_internal_prompts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_internal_prompts() TO service_role;
