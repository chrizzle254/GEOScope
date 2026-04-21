-- Add RPC function to get mentions enriched with provider info by joining internal.llm_responses.
-- Needed for the LLM comparison dashboard page.

CREATE OR REPLACE FUNCTION public.get_mentions_with_provider(p_run_id uuid)
RETURNS TABLE (
  id uuid,
  run_id uuid,
  response_id uuid,
  brand_mentioned boolean,
  competitors_mentioned text[],
  excerpt_brand text,
  excerpt_competitors jsonb,
  confidence text,
  created_at timestamptz,
  llm_provider text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    m.id,
    m.run_id,
    m.response_id,
    m.brand_mentioned,
    m.competitors_mentioned,
    m.excerpt_brand,
    m.excerpt_competitors,
    m.confidence,
    m.created_at,
    r.provider_id AS llm_provider
  FROM public.mentions m
  LEFT JOIN internal.llm_responses r ON m.response_id = r.id
  WHERE m.run_id = p_run_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_mentions_with_provider(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mentions_with_provider(uuid) TO service_role;

COMMENT ON FUNCTION public.get_mentions_with_provider IS
  'Returns all mentions for an analysis run, enriched with llm_provider from internal.llm_responses.';
