'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.ok) {
        const next = params.get('next');
        // Only allow same-site redirects — an open redirect is a phishing vector.
        router.replace(next && next.startsWith('/admin') ? next : '/admin');
        router.refresh();
      } else setError(json.error);
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-wash px-4">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm">
        <h1 className="text-xl font-extrabold">Arcane Mart admin</h1>
        <p className="text-sm text-ink-soft mb-5">Sign in to manage products and orders.</p>
        <label className="label" htmlFor="e">Email</label>
        <input id="e" type="email" required autoComplete="username" className="field mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label" htmlFor="p">Password</label>
        <input id="p" type="password" required autoComplete="current-password" className="field mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>}
        <button disabled={busy} className="btn-leaf w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
