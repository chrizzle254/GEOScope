-- CHR-22: Update insert_llm_response RPC to accept nullable prompt_id
-- Now that prompts are LLM-generated at runtime (not seeded), there is no DB UUID for them.

CREATE OR REPLACE FUNCTION public.insert_llm_response(
  p_analysis_run_id uuid,
  p_provider text,
  p_response_text text,
  p_prompt_id uuid DEFAULT NULL,
  p_is_error boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_id uuid;
BEGIN
  INSERT INTO internal.llm_responses (analysis_run_id, provider_id, response_text, prompt_id)
  VALUES (p_analysis_run_id, p_provider, p_response_text, p_prompt_id)
  RETURNING id INTO v_response_id;

  RETURN v_response_id;
END;
$$;

-- Re-grant (required after OR REPLACE with changed signature)
GRANT EXECUTE ON FUNCTION public.insert_llm_response(uuid, text, text, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_llm_response(uuid, text, text, uuid, boolean) TO service_role;

COMMENT ON FUNCTION public.insert_llm_response IS
  'Inserts a new LLM response into the internal schema and returns the ID. prompt_id is nullable for LLM-generated (ephemeral) prompts.';
