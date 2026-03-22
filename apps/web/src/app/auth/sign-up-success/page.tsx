import Link from 'next/link';

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-bold tracking-tight text-foreground">GEO Visibility</span>
        </div>

        <div className="border-4 border-border p-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-foreground">
            Check your email
          </p>
          <p className="mb-6 text-xs text-muted-foreground">
            You&apos;ve successfully signed up. Please confirm your email address before signing in.
          </p>
          <Link
            href="/auth/login"
            className="text-xs uppercase tracking-widest text-foreground underline underline-offset-4"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
