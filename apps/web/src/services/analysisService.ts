import { apiGet, apiPost } from '@/lib/apiClient';
import { AnalysisRun, Mention } from '@/types/analysis';

export interface TriggerAnalysisInput {
  brand: string;
  industry: string;
  competitors: string[];
  models?: string[];
}

export async function triggerAnalysis(input: TriggerAnalysisInput): Promise<{ analysisId: string }> {
  return apiPost<{ analysisId: string }>('/api/v1/analyses', input);
}

export async function getAnalysisRuns(): Promise<AnalysisRun[]> {
  return apiGet<AnalysisRun[]>('/api/v1/analyses');
}

export async function getMentions(runId: string): Promise<Mention[]> {
  return apiGet<Mention[]>(`/api/v1/analyses/${runId}/mentions`);
}
