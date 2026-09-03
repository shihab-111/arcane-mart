import Link from 'next/link';

export default function Footer({ settings = {}, categories = [] }) {
  return (
    <footer className="bg-ink text-line mt-10 pt-9 pb-24 lg:pb-9">
      <div className="wrap grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          {settings.logo
            ? <span className="inline-block bg-white rounded-xl p-2"><img src={settings.logo} alt="" className="h-10" /></span>
            : <span className="text-xl font-extrabold text-white">ARCANE MART</span>}
          <p className="mt-3">{settings.address || 'Dhaka, Bangladesh'}</p>
          <p className="text-sm">
            {settings.phone && <a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a>}
            {settings.email && <> · <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></>}
          </p>
          <div className="flex gap-2 mt-4">
            {settings.facebook && <a href={settings.facebook} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-leaf text-sm">Facebook</a>}
            {settings.instagram && <a href={settings.instagram} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-leaf text-sm">Instagram</a>}
            {settings.whatsapp && <a href={settings.whatsapp} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-leaf text-sm">WhatsApp</a>}
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Shop</h4>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
            {categories.slice(0, 5).map((c) => (
              <li key={c._id}><Link href={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Customer care</h4>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/track" className="hover:text-white">Track your order</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-white">Shipping policy</Link></li>
            <li><Link href="/policies/returns" className="hover:text-white">Refund &amp; return policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-white">Privacy policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap border-t border-white/15 mt-7 pt-4 text-center text-xs">
        © {new Date().getFullYear()} {settings.siteName || 'Arcane Mart'}. All rights reserved. · bKash · Nagad · Cash on delivery
      </div>
    </footer>
  );
}
