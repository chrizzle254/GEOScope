'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBrands } from '@/services/brandService';
import { getAnalysisRuns, getMentions } from '@/services/analysisService';
import { AnalysisRun, Mention } from '@/types/analysis';

const PAGE_SIZE = 10;

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
};

export default function ConvoContextPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBrand, setHasBrand] = useState(false);
  const [latestRun, setLatestRun] = useState<AnalysisRun | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [page, setPage] = useState(0);

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

        const all = await getMentions(run.id);
        // Only show responses where the brand was mentioned
        setMentions(all.filter((m) => m.brand_mentioned));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const totalPages = Math.ceil(mentions.length / PAGE_SIZE);
  const paginated = mentions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Convo Context
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
        <MentionList
          mentions={paginated}
          totalMentions={mentions.length}
          run={latestRun}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </main>
  );
}

interface MentionListProps {
  mentions: Mention[];
  totalMentions: number;
  run: AnalysisRun;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function MentionList({
  mentions,
  totalMentions,
  run,
  page,
  totalPages,
  onPageChange,
}: MentionListProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Run info */}
      <div className="border-4 border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Analysis run
        </p>
        <p className="mt-1 font-mono text-sm text-foreground">#{run.id.slice(0, 8)}</p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {totalMentions === 0
            ? 'Your brand was not mentioned in any responses'
            : `${totalMentions} response${totalMentions === 1 ? '' : 's'} where your brand was mentioned`}
        </p>
      </div>

      {totalMentions === 0 ? (
        <div className="border-4 border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your brand did not appear in any LLM responses for this run.
          </p>
        </div>
      ) : (
        <>
          {/* Mention cards */}
          <div className="flex flex-col gap-4">
            {mentions.map((mention, i) => (
              <MentionCard
                key={mention.id}
                mention={mention}
                index={page * PAGE_SIZE + i + 1}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        </>
      )}
    </div>
  );
}

function MentionCard({ mention, index }: { mention: Mention; index: number }) {
  const providerLabel =
    PROVIDER_LABELS[mention.llm_provider ?? ''] ?? mention.llm_provider?.toUpperCase() ?? '—';

  const competitorExcerpts = Object.entries(mention.excerpt_competitors ?? {}).filter(
    ([, text]) => text,
  );

  return (
    <div className="border-4 border-border">
      {/* Card header */}
      <div className="flex items-center justify-between border-b-4 border-border px-5 py-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          #{index}
        </span>
        <div className="flex items-center gap-3">
          {mention.confidence && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {mention.confidence} confidence
            </span>
          )}
          <span className="border-4 border-border px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {providerLabel}
          </span>
        </div>
      </div>

      {/* Excerpts */}
      <div className="flex flex-col gap-4 p-5">
        {/* Brand excerpt */}
        {mention.excerpt_brand ? (
          <div className="border-l-4 border-foreground pl-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Your brand
            </p>
            <p className="text-sm leading-relaxed text-foreground">{mention.excerpt_brand}</p>
          </div>
        ) : (
          <div className="border-l-4 border-border pl-4">
            <p className="text-xs text-muted-foreground">No excerpt captured.</p>
          </div>
        )}

        {/* Competitor excerpts */}
        {competitorExcerpts.length > 0 && (
          <div className="flex flex-col gap-3 border-t-4 border-border pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Also mentioned
            </p>
            {competitorExcerpts.map(([name, text]) => (
              <div key={name} className="border-l-4 border-border pl-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {name}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-4 border-border px-5 py-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="border-4 border-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
      >
        ← Prev
      </button>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="border-4 border-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
      >
        Next →
      </button>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 animate-pulse border-4 border-border bg-muted" />
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
        No completed analysis runs yet. Run an analysis to see conversation context.
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
