import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Login Page</h1>
      <p className="text-lg mb-8">This is a placeholder for Supabase auth.</p>
      <Link href="/" className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
        Go Home
      </Link>
    </div>
  );
}
