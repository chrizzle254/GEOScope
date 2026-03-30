'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getBrands, createBrand, updateBrand } from '@/services/brandService';
import { Brand } from '@/types/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormState {
  name: string;
  website: string;
  industry: string;
}

export default function BrandConfigPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', website: '', industry: '' });

  useEffect(() => {
    getBrands()
      .then((brands) => {
        const existing = brands[0] ?? null;
        setBrand(existing);
        if (existing) {
          setForm({
            name: existing.name,
            website: existing.website ?? '',
            industry: existing.industry,
          });
        } else {
          // No brand yet — start in edit/create mode
          setIsEditing(true);
        }
      })
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.industry.trim()) {
      toast.error('Brand name and industry are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (brand) {
        const updated = await updateBrand(brand.id, { name: form.name, industry: form.industry });
        setBrand(updated);
        toast.success('Brand updated.');
      } else {
        const created = await createBrand({
          name: form.name,
          industry: form.industry,
          competitors: [],
        });
        setBrand(created);
        toast.success('Brand created.');
      }
      setIsEditing(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (brand) {
      setForm({ name: brand.name, website: brand.website ?? '', industry: brand.industry });
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse border-4 border-border bg-muted" />
        ))}
      </div>
    );
  }

  if (isEditing || !brand) {
    return (
      <EditForm
        form={form}
        setForm={setForm}
        brand={brand}
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    );
  }

  return <ViewMode brand={brand} form={form} onEdit={() => setIsEditing(true)} />;
}

/* ─── View mode ──────────────────────────────────────────────────── */

interface ViewModeProps {
  brand: Brand;
  form: FormState;
  onEdit: () => void;
}

function ViewMode({ brand, form, onEdit }: ViewModeProps) {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Brand config
      </p>

      {[
        { label: 'Brand name', value: brand.name },
        { label: 'Website', value: form.website || '—' },
        { label: 'Industry', value: brand.industry },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between border-4 border-border p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            <span className="text-sm text-foreground">{value}</span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            className="text-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            ✎
          </button>
        </div>
      ))}

      <Button onClick={onEdit} className="w-40">
        Edit
      </Button>
    </div>
  );
}

/* ─── Edit / create form ─────────────────────────────────────────── */

interface EditFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  brand: Brand | null;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

function EditForm({ form, setForm, brand, isSaving, onSave, onDiscard }: EditFormProps) {
  const fields: { key: keyof FormState; label: string; placeholder: string }[] = [
    { key: 'name', label: 'Brand name', placeholder: 'Brand name' },
    { key: 'website', label: 'Website', placeholder: 'brand.com' },
    { key: 'industry', label: 'Industry', placeholder: 'Industry' },
  ];

  return (
    <div className="flex max-w-xl flex-col gap-6">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          <label
            htmlFor={key}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {label}
          </label>
          <Input
            id={key}
            value={form[key]}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
          />
        </div>
      ))}

      <div className="flex gap-4">
        <Button onClick={onSave} disabled={isSaving} className="w-32">
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        {brand && (
          <Button variant="outline" onClick={onDiscard} disabled={isSaving} className="w-40">
            Discard changes
          </Button>
        )}
      </div>
    </div>
  );
}
