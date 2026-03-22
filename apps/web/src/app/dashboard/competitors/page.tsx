'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { getBrands } from '@/services/brandService';
import { getAnalysisRuns, getMentions } from '@/services/analysisService';
import { AnalysisRun, Mention } from '@/types/analysis';

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

export default function CompetitorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBrand, setHasBrand] = useState(false);
  const [latestRun, setLatestRun] = useState<AnalysisRun | null>(null);
  const [sovData, setSovData] = useState<SoVDataPoint[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);

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
        setTotalResponses(mentions.length);
        setSovData(computeSoV(mentions, brands[0].name));
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
        Competitors
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
        <SoVChart data={sovData} run={latestRun} totalResponses={totalResponses} />
      )}
    </main>
  );
}

function SoVChart({
  data,
  run,
  totalResponses,
}: {
  data: SoVDataPoint[];
  run: AnalysisRun;
  totalResponses: number;
}) {
  const brand = data.find((d) => d.isBrand);
  const brandShare = brand?.share ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Run info */}
      <div className="border-4 border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Analysis run
        </p>
        <p className="mt-1 font-mono text-sm text-foreground">#{run.id.slice(0, 8)}</p>
        <div className="mt-4 flex flex-wrap gap-8">
          <Stat label="Total responses" value={String(totalResponses)} />
          <Stat label="Brand share" value={`${brandShare}%`} />
          <Stat label="Entities tracked" value={String(data.length)} />
        </div>
      </div>

      {/* Bar chart */}
      {data.length > 0 ? (
        <div className="border-4 border-border p-6">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Share of voice (% of responses mentioned in)
          </p>
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 52)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
            >
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  fill: '#757575',
                }}
                axisLine={false}
                tickLine={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontFamily: 'Roboto Mono, monospace', fontSize: 10, fill: '#757575' }}
                axisLine={{ stroke: '#757575', strokeWidth: 2 }}
                tickLine={false}
              />
              <Tooltip content={<SoVTooltip totalResponses={totalResponses} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="share" radius={0} label={<BarLabel />}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.isBrand ? '#1E1E1E' : '#757575'} />
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

      {/* Legend */}
      {data.length > 0 && (
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Your brand
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Competitors
            </span>
          </div>
        </div>
      )}

      {/* Summary table */}
      {data.length > 0 && (
        <div className="border-4 border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-border">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Entity
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mentions
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.name}
                  className={i < data.length - 1 ? 'border-b-4 border-border' : ''}
                >
                  <td className="px-4 py-4 text-sm font-bold text-foreground">
                    {row.name}
                    {row.isBrand && (
                      <span className="ml-2 text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                    {row.mentions}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm font-bold text-foreground">
                    {row.share}%
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

interface SoVTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SoVDataPoint }>;
  totalResponses: number;
}

function SoVTooltip({ active, payload, totalResponses }: SoVTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="border-4 border-foreground bg-background p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {data.name}
      </p>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">{data.share}%</p>
      <p className="text-xs text-muted-foreground">
        {data.mentions} / {totalResponses} responses
      </p>
    </div>
  );
}

interface BarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}

function BarLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: BarLabelProps) {
  if (value === 0) return null;
  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dy={4}
      fontFamily="Roboto Mono, monospace"
      fontSize={10}
      fontWeight={700}
      fill="#1E1E1E"
    >
      {value}%
    </text>
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
        No completed analysis runs yet. Run an analysis to see competitor data.
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
