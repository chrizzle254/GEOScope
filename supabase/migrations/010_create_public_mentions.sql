create table public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
  response_id UUID,
  brand_mentioned BOOLEAN NOT NULL,
  competitors_mentioned TEXT[],
  excerpt_brand TEXT,
  excerpt_competitors JSONB,
  confidence TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

