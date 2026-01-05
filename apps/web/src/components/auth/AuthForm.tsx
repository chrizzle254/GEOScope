import { useState } from 'react';
import { createSupabaseBrowser } from '../../lib/supabase/browser';

type AuthMode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        // Create user record in public.users table
        if (data.user) {
          const { error: userError } = await supabase.from('users').insert({
            auth_id: data.user.id,
            full_name: fullName,
          });
          if (userError) console.error('Error creating user record:', userError);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border-2 border-[#1e1e1e] rounded-lg">
      <h2
        className="text-[32px] tracking-[-0.608px] mb-6"
        style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
      >
        {mode === 'login' ? 'Login' : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label
              className="block text-[12px] tracking-[-0.132px] mb-2"
              style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
            >
              FULL NAME
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded"
              required
            />
          </div>
        )}

        <div>
          <label
            className="block text-[12px] tracking-[-0.132px] mb-2"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded"
            required
          />
        </div>

        <div>
          <label
            className="block text-[12px] tracking-[-0.132px] mb-2"
            style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 700 }}
          >
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded"
            minLength={6}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#1e1e1e] text-white rounded hover:bg-[#000] disabled:opacity-50"
          style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="w-full mt-4 text-[#757575] hover:text-[#1e1e1e]"
        style={{ fontFamily: 'Roboto Mono, monospace' }}
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
      </button>
    </div>
  );
}
