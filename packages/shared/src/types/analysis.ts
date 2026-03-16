
export interface MentionResult {
  brandMentioned: boolean;
  competitorsMentioned: string[];
  excerpts: {
    brand?: string;
    competitors: Record<string, string>;
  };
  confidence: 'high' | 'low';
}

export interface ParseOptions {
  brandName: string;
  brandAliases: string[];
  competitorMap: Record<string, string[]>;
  responseText: string;
}
