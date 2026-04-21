import { describe, it, expect } from 'vitest';

// Mirrors pure logic from dashboard pages.
// Tested here because the API package already has vitest configured.

interface Mention {
  llm_provider: string | null;
  brand_mentioned: boolean;
  competitors_mentioned?: string[] | null;
}

interface LLMProviderStats {
  provider: string;
  total: number;
  mentioned: number;
  mentionRate: number;
}

function computeStats(mentions: Mention[]): LLMProviderStats[] {
  const map = new Map<string, { total: number; mentioned: number }>();

  for (const mention of mentions) {
    const provider = mention.llm_provider ?? 'unknown';
    const existing = map.get(provider) ?? { total: 0, mentioned: 0 };
    map.set(provider, {
      total: existing.total + 1,
      mentioned: existing.mentioned + (mention.brand_mentioned ? 1 : 0),
    });
  }

  return Array.from(map.entries()).map(([provider, { total, mentioned }]) => ({
    provider,
    total,
    mentioned,
    mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
  }));
}

describe('computeStats', () => {
  it('returns empty array for no mentions', () => {
    expect(computeStats([])).toEqual([]);
  });

  it('groups mentions by provider', () => {
    const mentions: Mention[] = [
      { llm_provider: 'openai', brand_mentioned: true },
      { llm_provider: 'openai', brand_mentioned: false },
      { llm_provider: 'anthropic', brand_mentioned: true },
    ];

    const stats = computeStats(mentions);

    const openai = stats.find((s) => s.provider === 'openai')!;
    expect(openai.total).toBe(2);
    expect(openai.mentioned).toBe(1);
    expect(openai.mentionRate).toBe(50);

    const anthropic = stats.find((s) => s.provider === 'anthropic')!;
    expect(anthropic.total).toBe(1);
    expect(anthropic.mentioned).toBe(1);
    expect(anthropic.mentionRate).toBe(100);
  });

  it('uses "unknown" for null provider', () => {
    const mentions: Mention[] = [{ llm_provider: null, brand_mentioned: true }];
    const stats = computeStats(mentions);
    expect(stats[0].provider).toBe('unknown');
  });

  it('rounds mention rate to nearest integer', () => {
    const mentions: Mention[] = [
      { llm_provider: 'google', brand_mentioned: true },
      { llm_provider: 'google', brand_mentioned: true },
      { llm_provider: 'google', brand_mentioned: false },
    ];
    const stats = computeStats(mentions);
    expect(stats[0].mentionRate).toBe(67);
  });

  it('returns 0% rate when no brand mentions', () => {
    const mentions: Mention[] = [
      { llm_provider: 'openai', brand_mentioned: false },
      { llm_provider: 'openai', brand_mentioned: false },
    ];
    const stats = computeStats(mentions);
    expect(stats[0].mentionRate).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeSoV — mirrors apps/web/src/app/dashboard/competitors/page.tsx
// ---------------------------------------------------------------------------

interface SoVDataPoint {
  name: string;
  mentions: number;
  share: number;
  isBrand: boolean;
}

function computeSoV(mentions: Mention[], brandName: string): SoVDataPoint[] {
  const totalRows = mentions.length;
  if (totalRows === 0) return [];

  const brandMentions = mentions.filter((m) => m.brand_mentioned).length;

  const competitorCounts = new Map<string, number>();
  for (const mention of mentions) {
    for (const comp of mention.competitors_mentioned ?? []) {
      competitorCounts.set(comp, (competitorCounts.get(comp) ?? 0) + 1);
    }
  }

  return [
    {
      name: brandName,
      mentions: brandMentions,
      share: Math.round((brandMentions / totalRows) * 100),
      isBrand: true,
    },
    ...Array.from(competitorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        mentions: count,
        share: Math.round((count / totalRows) * 100),
        isBrand: false,
      })),
  ];
}

describe('computeSoV', () => {
  it('returns empty array for no mentions', () => {
    expect(computeSoV([], 'Acme')).toEqual([]);
  });

  it('brand is always first entry with isBrand=true', () => {
    const mentions: Mention[] = [
      { llm_provider: 'openai', brand_mentioned: true, competitors_mentioned: ['Rival'] },
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: ['Rival'] },
    ];
    const result = computeSoV(mentions, 'Acme');
    expect(result[0].name).toBe('Acme');
    expect(result[0].isBrand).toBe(true);
  });

  it('computes brand share correctly', () => {
    const mentions: Mention[] = [
      { llm_provider: 'openai', brand_mentioned: true, competitors_mentioned: [] },
      { llm_provider: 'openai', brand_mentioned: true, competitors_mentioned: [] },
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: [] },
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: [] },
    ];
    const result = computeSoV(mentions, 'Acme');
    expect(result[0].mentions).toBe(2);
    expect(result[0].share).toBe(50);
  });

  it('aggregates competitor mentions across responses', () => {
    const mentions: Mention[] = [
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: ['Rival', 'Other'] },
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: ['Rival'] },
    ];
    const result = computeSoV(mentions, 'Acme');
    const rival = result.find((r) => r.name === 'Rival')!;
    expect(rival.mentions).toBe(2);
    expect(rival.share).toBe(100);

    const other = result.find((r) => r.name === 'Other')!;
    expect(other.mentions).toBe(1);
    expect(other.share).toBe(50);
  });

  it('sorts competitors by mention count descending', () => {
    const mentions: Mention[] = [
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: ['B', 'A', 'A'] },
      { llm_provider: 'openai', brand_mentioned: false, competitors_mentioned: ['A'] },
    ];
    const result = computeSoV(mentions, 'Acme');
    // A has 3 mentions, B has 1 — A should come first (after brand)
    expect(result[1].name).toBe('A');
    expect(result[2].name).toBe('B');
  });
});
