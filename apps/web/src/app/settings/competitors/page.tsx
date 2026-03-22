'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getBrands } from '@/services/brandService';
import { Competitor } from '@/types/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CompetitorsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBrands()
      .then((brands) => {
        const brand = brands[0] ?? null;
        if (brand) {
          setBrandId(brand.id);
          setCompetitors(brand.competitors);
        }
      })
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (competitors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Competitor already added.');
      return;
    }
    if (competitors.length >= 10) {
      toast.error('Maximum 10 competitors allowed.');
      return;
    }
    // Optimistic local add — will be persisted when brand is saved via settings page
    setCompetitors((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed }]);
    setNewName('');
    toast.success(`${trimmed} added.`);
  };

  const handleRemove = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse border-4 border-border bg-muted" />
        ))}
      </div>
    );
  }

  if (!brandId) {
    return (
      <p className="text-sm text-muted-foreground">
        Set up your brand first before adding competitors.
      </p>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Competitors ({competitors.length}/10)
      </p>

      {/* Existing competitors */}
      <div className="flex flex-col gap-2">
        {competitors.length === 0 && (
          <p className="text-sm text-muted-foreground">No competitors added yet.</p>
        )}
        {competitors.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-4 border-border px-4 py-3">
            <span className="text-sm text-foreground">{c.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(c.id)}
              aria-label={`Remove ${c.name}`}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-destructive"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      {competitors.length < 10 && (
        <div className="flex gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Competitor name"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd} className="w-20 shrink-0">
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
