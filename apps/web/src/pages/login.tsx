import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[24px]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[rgba(0,0,0,0.1)] px-[42px] py-[10px] flex items-center gap-4">
        <span className="text-[40px] leading-[1.5] tracking-[-0.76px]">🤖</span>
        <span
          className="text-[24px] leading-[1.5] tracking-[-0.456px] font-medium"
          style={{ fontFamily: 'Roboto Mono, monospace' }}
        >
          GEO Scope
        </span>
      </header>
      <AuthForm />
    </div>
  );
}
