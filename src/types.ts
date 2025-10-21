export type Page =
  | 'home'
  | 'llm-comparison'
  | 'competitors'
  | 'convo-context'
  | 'settings'
  | 'account';

export interface BrandData {
  brandName: string;
  website: string;
  industry: string;
  targetAudience: string;
  competitors: string[];
  examplePrompt: string;
  email: string;
}
