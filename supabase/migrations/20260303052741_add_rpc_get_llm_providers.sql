-- Add RPC function to fetch LLM providers from internal schema
-- This allows the API to access internal.llm_providers without exposing the schema via PostgREST

CREATE OR REPLACE FUNCTION public.get_llm_providers()
RETURNS SETOF internal.llm_providers
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM internal.llm_providers WHERE is_active = true;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.get_llm_providers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_llm_providers() TO service_role;

COMMENT ON FUNCTION public.get_llm_providers() IS 'Returns all active LLM providers from the internal schema';
