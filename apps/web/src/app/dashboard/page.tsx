'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBrands } from '@/services/brandService';
import { Brand } from '@/types/brand';

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
  return (
    <div className="flex flex-col gap-8">
      {/* Brand header */}
      <div className="border-4 border-border p-6">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Your brand
        </p>
        <h2 className="text-2xl font-bold text-foreground">{brand.name}</h2>
        {brand.industry && (
          <p className="mt-1 text-sm text-muted-foreground">{brand.industry}</p>
        )}
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
      </div>

      {/* Metric placeholders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Visibility Score', hint: 'Mention rate across all LLMs' },
          { label: 'Share of Voice', hint: 'Brand vs. competitors' },
          { label: 'Sentiment', hint: 'How your brand is described' },
        ].map(({ label, hint }) => (
          <MetricCard key={label} label={label} hint={hint} />
        ))}
      </div>

      {/* Analysis CTA */}
      <div className="border-4 border-dashed border-border p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Run an analysis to populate your visibility metrics.
        </p>
        <button
          type="button"
          className="border-4 border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Run analysis
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="border-4 border-border p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-muted-foreground/40">—</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
