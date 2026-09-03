import AdminNav from '@/components/admin/AdminNav';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Admin · Arcane Mart', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const session = await getSession();
  // The login page renders without the shell.
  if (!session) return <>{children}</>;
  return (
    <div className="min-h-screen bg-wash">
      <AdminNav user={{ name: session.name, email: session.email, role: session.role }} />
      <main className="wrap py-6">{children}</main>
    </div>
  );
}
