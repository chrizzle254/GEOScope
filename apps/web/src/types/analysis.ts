export interface AnalysisRun {
  id: string;
  reporting_subject_id: string;
  status: 'pending' | 'running' | 'processing' | 'completed' | 'failed';
  selected_models: string[] | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface Mention {
  id: string;
  run_id: string;
  response_id: string | null;
  brand_mentioned: boolean;
  competitors_mentioned: string[] | null;
  excerpt_brand: string | null;
  excerpt_competitors: Record<string, string> | null;
  confidence: string | null;
  created_at: string;
  llm_provider: string | null;
}

export interface LLMProviderStats {
  provider: string;
  total: number;
  mentioned: number;
  mentionRate: number;
}
