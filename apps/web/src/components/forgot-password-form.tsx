'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="border-4 border-border p-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-foreground">
          Check your email
        </p>
        <p className="text-xs text-muted-foreground">
          If an account exists for that address, you will receive a reset link shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleForgotPassword} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      {error && <p className="border-4 border-destructive p-3 text-xs text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send reset email'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Remember it?{' '}
        <Link href="/auth/login" className="text-foreground underline underline-offset-4">
          Login
        </Link>
      </p>
    </form>
  );
}
