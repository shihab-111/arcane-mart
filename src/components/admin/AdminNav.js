'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const links = [
  ['/admin', 'Dashboard'],
  ['/admin/orders', 'Orders'],
  ['/admin/products', 'Products'],
  ['/admin/categories', 'Categories'],
  ['/admin/banners', 'Banners'],
  ['/admin/settings', 'Settings'],
];

export default function AdminNav({ user }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <header className="bg-ink text-white sticky top-0 z-40">
      <div className="wrap flex items-center gap-4 py-3">
        <Link href="/admin" className="font-extrabold">ARCANE <span className="text-leaf">ADMIN</span></Link>
        <nav className="hidden md:flex gap-1 ml-4">
          {links.map(([href, label]) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${path === href ? 'bg-leaf text-white' : 'hover:bg-white/10'}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Link href="/" target="_blank" className="hidden sm:block hover:underline">View shop ↗</Link>
          <span className="hidden lg:block opacity-70">{user?.email}</span>
          <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">Log out</button>
          <button className="md:hidden px-3 py-1.5 rounded-lg bg-white/10" onClick={() => setOpen(!open)}>Menu</button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-white/10">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block px-5 py-3 border-b border-white/10">{label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
