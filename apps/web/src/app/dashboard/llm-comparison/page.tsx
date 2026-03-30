'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { getBrands } from '@/services/brandService';
import { getAnalysisRuns, getMentions } from '@/services/analysisService';
import { AnalysisRun, Mention, LLMProviderStats } from '@/types/analysis';

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  openai: { label: 'OpenAI', color: '#1E1E1E' },
  anthropic: { label: 'Anthropic', color: '#757575' },
  google: { label: 'Google', color: '#D9D9D9' },
};

interface ChartDataPoint extends LLMProviderStats {
  label: string;
  fill: string;
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

export default function LLMComparisonPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBrand, setHasBrand] = useState(false);
  const [latestRun, setLatestRun] = useState<AnalysisRun | null>(null);
  const [stats, setStats] = useState<LLMProviderStats[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const brands = await getBrands();
        if (brands.length === 0) {
          setHasBrand(false);
          return;
        }
        setHasBrand(true);

        const runs = await getAnalysisRuns();
        const completed = runs.filter((r) => r.status === 'completed');
        if (completed.length === 0) {
          setLatestRun(null);
          return;
        }

        const run = completed.sort((a, b) =>
          (b.completed_at ?? '').localeCompare(a.completed_at ?? ''),
        )[0];
        setLatestRun(run);

        const mentions = await getMentions(run.id);
        setStats(computeStats(mentions));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        LLM Comparison
      </h1>

      {isLoading ? (
        <PageSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : !hasBrand ? (
        <NoBrandState />
      ) : !latestRun ? (
        <NoDataState />
      ) : (
        <ComparisonChart stats={stats} run={latestRun} />
      )}
    </main>
  );
}

function ComparisonChart({ stats, run }: { stats: LLMProviderStats[]; run: AnalysisRun }) {
  const chartData: ChartDataPoint[] = stats.map((s) => ({
    ...s,
    label: (PROVIDER_META[s.provider]?.label ?? s.provider).toUpperCase(),
    fill: PROVIDER_META[s.provider]?.color ?? '#1E1E1E',
  }));

  const totalMentions = stats.reduce((sum, s) => sum + s.mentioned, 0);
  const totalQueries = stats.reduce((sum, s) => sum + s.total, 0);
  const overallRate =
    totalQueries > 0 ? `${Math.round((totalMentions / totalQueries) * 100)}%` : '—';

  return (
    <div className="flex flex-col gap-8">
      {/* Run info */}
      <div className="border-4 border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Analysis run
        </p>
        <p className="mt-1 font-mono text-sm text-foreground">#{run.id.slice(0, 8)}</p>
        <div className="mt-4 flex flex-wrap gap-8">
          <Stat label="Total queries" value={String(totalQueries)} />
          <Stat label="Total mentions" value={String(totalMentions)} />
          <Stat label="Overall rate" value={overallRate} />
        </div>
      </div>

      {/* Bar chart */}
      {chartData.length > 0 ? (
        <div className="border-4 border-border p-6">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Mention rate by provider (%)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  fill: '#757575',
                }}
                axisLine={{ stroke: '#757575', strokeWidth: 2 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontFamily: 'Roboto Mono, monospace', fontSize: 10, fill: '#757575' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="mentionRate" radius={0}>
                {chartData.map((entry) => (
                  <Cell key={entry.provider} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="border-4 border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No mention data found for this run.</p>
        </div>
      )}

      {/* Summary table */}
      {chartData.length > 0 && (
        <div className="border-4 border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-border">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Provider
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Queries
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mentions
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr
                  key={row.provider}
                  className={i < chartData.length - 1 ? 'border-b-4 border-border' : ''}
                >
                  <td className="px-4 py-4 text-sm font-bold text-foreground">{row.label}</td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                    {row.total}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                    {row.mentioned}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm font-bold text-foreground">
                    {row.mentionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="border-4 border-foreground bg-background p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {data.label}
      </p>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">{data.mentionRate}%</p>
      <p className="text-xs text-muted-foreground">
        {data.mentioned} / {data.total} queries
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse border-4 border-border bg-muted" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border-4 border-destructive p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-destructive">Error</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function NoBrandState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      <div className="border-4 border-dashed border-border p-10 text-center">
        <p className="mb-4 text-sm text-muted-foreground">No brand configured yet.</p>
        <Link
          href="/settings"
          className="inline-block border-4 border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Set up brand
        </Link>
      </div>
    </div>
  );
}

function NoDataState() {
  return (
    <div className="border-4 border-dashed border-border p-10 text-center">
      <p className="mb-4 text-sm text-muted-foreground">
        No completed analysis runs yet. Run an analysis to see LLM comparison data.
      </p>
      <Link
        href="/dashboard"
        className="inline-block border-4 border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
