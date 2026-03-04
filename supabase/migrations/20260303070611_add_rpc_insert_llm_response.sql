-- Add RPC function to insert LLM responses into internal schema
-- This allows the API to write to internal.llm_responses without exposing the schema via PostgREST

CREATE OR REPLACE FUNCTION public.insert_llm_response(
  p_analysis_run_id uuid,
  p_provider text,
  p_raw_content text,
  p_prompt_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_id uuid;
BEGIN
  INSERT INTO internal.llm_responses (analysis_run_id, provider_id, response_text, prompt_id)
  VALUES (p_analysis_run_id, p_provider, p_raw_content, p_prompt_id)
  RETURNING id INTO v_response_id;
  
  RETURN v_response_id;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.insert_llm_response(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_llm_response(uuid, text, text, uuid) TO service_role;

COMMENT ON FUNCTION public.insert_llm_response IS 'Inserts a new LLM response into the internal schema and returns the ID';
