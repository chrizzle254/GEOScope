import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome to GEOScope</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        Basic App Router setup for API and Supabase testing.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Dashboard
        </Link>

        <Link
          href="/auth/login"
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
