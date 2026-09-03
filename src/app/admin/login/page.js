import { Suspense } from 'react';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-ink-soft">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
