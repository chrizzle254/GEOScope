'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getBrands } from '@/services/brandService';
import { getAnalysisRuns, getMentions, triggerAnalysis } from '@/services/analysisService';
import { AnalysisRun, LLMProviderStats, Mention } from '@/types/analysis';
import { Brand } from '@/types/brand';

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeProviderStats(mentions: Mention[]): LLMProviderStats[] {
  const map: Record<string, { total: number; mentioned: number }> = {};
  for (const m of mentions) {
    const p = m.llm_provider ?? 'unknown';
    if (!map[p]) map[p] = { total: 0, mentioned: 0 };
    map[p].total++;
    if (m.brand_mentioned) map[p].mentioned++;
  }
  return Object.entries(map).map(([provider, { total, mentioned }]) => ({
    provider,
    total,
    mentioned,
    mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
  }));
}

function getLatestCompletedRun(runs: AnalysisRun[]): AnalysisRun | null {
  return (
    runs
      .filter((r) => r.status === 'completed')
      .sort((a, b) => {
        const aTime = a.completed_at ?? a.started_at ?? '';
        const bTime = b.completed_at ?? b.started_at ?? '';
        return bTime.localeCompare(aTime);
      })[0] ?? null
  );
}

function getActiveRun(runs: AnalysisRun[]): AnalysisRun | null {
  return runs.find((r) => r.status === 'pending' || r.status === 'processing') ?? null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBrands()
      .then((brands) => setBrand(brands[0] ?? null))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Home
      </h1>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : brand ? (
        <BrandOverview brand={brand} />
      ) : (
        <EmptyState />
      )}
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DashboardSkeleton() {
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

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      <div className="border-4 border-dashed border-border p-10 text-center">
        <div className="mb-6 border-4 border-border p-4">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Your brand
          </span>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">Setup brand to see mentions of LLM</p>
        <Link
          href="/settings"
          className="inline-block border-4 border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Look up brand
        </Link>
      </div>
    </div>
  );
}

function BrandOverview({ brand }: { brand: Brand }) {
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [stats, setStats] = useState<LLMProviderStats[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStart = useRef<number>(0);

  // Fetch latest run results
  const fetchResults = useCallback(async (runId: string) => {
    try {
      const mentions = await getMentions(runId);
      const computed = computeProviderStats(mentions);
      setStats(computed);
    } catch {
      toast.error('Failed to load analysis results.');
    }
  }, []);

  // Poll until run completes or times out
  const pollRun = useCallback(
    async (runId: string) => {
      if (Date.now() - pollStart.current > POLL_TIMEOUT_MS) {
        setIsPolling(false);
        toast.error('Analysis timed out. Please try again.');
        return;
      }

      try {
        const freshRuns = await getAnalysisRuns();
        setRuns(freshRuns);
        const run = freshRuns.find((r) => r.id === runId);

        if (run?.status === 'completed') {
          setIsPolling(false);
          await fetchResults(runId);
          toast.success('Analysis complete!');
          return;
        }

        if (run?.status === 'failed') {
          setIsPolling(false);
          toast.error('Analysis failed. Check API logs.');
          return;
        }

        // Still running — schedule next poll
        pollTimer.current = setTimeout(() => pollRun(runId), POLL_INTERVAL_MS);
      } catch {
        setIsPolling(false);
        toast.error('Lost connection while polling. Refresh to check status.');
      }
    },
    [fetchResults],
  );

  // Load existing runs + results on mount
  useEffect(() => {
    getAnalysisRuns()
      .then(async (fetchedRuns) => {
        setRuns(fetchedRuns);

        const active = getActiveRun(fetchedRuns);
        if (active) {
          // Resume polling for an in-progress run
          setIsPolling(true);
          pollStart.current = Date.now();
          pollTimer.current = setTimeout(() => pollRun(active.id), POLL_INTERVAL_MS);
          return;
        }

        const latest = getLatestCompletedRun(fetchedRuns);
        if (latest) {
          await fetchResults(latest.id);
        }
      })
      .catch(() => {
        // Non-fatal — dashboard still usable without prior results
      });

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [fetchResults, pollRun]);

  async function handleRunAnalysis() {
    setIsRunning(true);
    try {
      const result = await triggerAnalysis({
        brand: brand.name,
        industry: brand.industry,
        competitors: brand.competitors.map((c) => c.name),
      });
      toast.success('Analysis started — results will appear when complete');
      setStats(null);
      setIsPolling(true);
      pollStart.current = Date.now();
      pollTimer.current = setTimeout(() => pollRun(result.analysisId), POLL_INTERVAL_MS);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start analysis.');
    } finally {
      setIsRunning(false);
    }
  }

  const activeRun = getActiveRun(runs);
  const latestRun = getLatestCompletedRun(runs);

  return (
    <div className="flex flex-col gap-8">
      {/* Brand header */}
      <div className="border-4 border-border p-6">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Your brand
        </p>
        <h2 className="text-2xl font-bold text-foreground">{brand.name}</h2>
        {brand.industry && <p className="mt-1 text-sm text-muted-foreground">{brand.industry}</p>}
        {brand.competitors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {brand.competitors.map((c) => (
              <span
                key={c.id}
                className="border-4 border-border px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}
        {latestRun?.completed_at && (
          <p className="mt-3 text-[10px] text-muted-foreground">
            Last analysed:{' '}
            {new Date(latestRun.completed_at).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        )}
      </div>

      {/* Results */}
      {isPolling || activeRun ? (
        <AnalysisInProgress />
      ) : stats && stats.length > 0 ? (
        <ResultsGrid stats={stats} />
      ) : (
        <PlaceholderGrid />
      )}

      {/* Analysis CTA */}
      <div className="border-4 border-dashed border-border p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          {stats
            ? 'Run a fresh analysis to update your visibility metrics.'
            : 'Run an analysis to populate your visibility metrics.'}
        </p>
        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={isRunning || isPolling}
          className="border-4 border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          {isRunning
            ? 'Starting...'
            : isPolling
              ? 'Running...'
              : stats
                ? 'Run again'
                : 'Run analysis'}
        </button>
      </div>
    </div>
  );
}

function AnalysisInProgress() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {['GPT', 'Claude', 'Gemini'].map((name) => (
        <div key={name} className="border-4 border-border p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {name}
          </p>
          <p className="mt-3 text-3xl font-bold text-muted-foreground/40">…</p>
          <p className="mt-2 text-xs text-muted-foreground">Analysis in progress</p>
        </div>
      ))}
    </div>
  );
}

function ResultsGrid({ stats }: { stats: LLMProviderStats[] }) {
  const providerLabel: Record<string, string> = {
    openai: 'GPT',
    anthropic: 'Claude',
    google: 'Gemini',
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.provider} className="border-4 border-border p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {providerLabel[s.provider] ?? s.provider}
          </p>
          <p className="mt-3 text-3xl font-bold text-foreground">{s.mentionRate}%</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {s.mentioned}/{s.total} responses
          </p>
        </div>
      ))}
    </div>
  );
}

function PlaceholderGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[
        { label: 'GPT', hint: 'Run analysis to see results' },
        { label: 'Claude', hint: 'Run analysis to see results' },
        { label: 'Gemini', hint: 'Run analysis to see results' },
      ].map(({ label, hint }) => (
        <div key={label} className="border-4 border-border p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-muted-foreground/40">—</p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
      ))}
    </div>
  );
}
