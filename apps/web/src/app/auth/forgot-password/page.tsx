import { ForgotPasswordForm } from '@/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-bold tracking-tight text-foreground">GEO Visibility</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold uppercase tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
          We&apos;ll send you a reset link
        </p>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
