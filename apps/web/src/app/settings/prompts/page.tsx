'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function PromptsPage() {
  const [prompt, setPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.');
      return;
    }
    setIsSaving(true);
    // TODO: persist example prompt via API when endpoint is available
    await new Promise((r) => setTimeout(r, 400));
    toast.success('Prompt saved.');
    setIsSaving(false);
  };

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="example-prompt"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Example prompt
        </label>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Enter a prompt that you would expect your brand to be mentioned for
        </p>
        <textarea
          id="example-prompt"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Your example prompt..."
          className="mt-2 w-full border-4 border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground disabled:opacity-50"
        />
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-32">
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
