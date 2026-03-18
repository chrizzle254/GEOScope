'use client';

import { BrandForm } from '@/components/shared/BrandForm';

export default function NewBrandPage() {
  return (
    <main className="container mx-auto max-w-2xl py-10">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configure New Brand</h1>
        <p className="text-muted-foreground">
          Define the brand, industry, and competitors you want to track across LLMs.
        </p>
      </div>
      <BrandForm />
    </main>
  );
}
