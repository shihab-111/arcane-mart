import './globals.css';
import { CartProvider } from '@/components/CartContext';

export const metadata = {
  title: { default: 'Arcane Mart — Daily essentials, spices & collectibles', template: '%s · Arcane Mart' },
  description:
    'Arcane Mart delivers daily necessities, authentic spices, anime figures, showpieces and tech accessories across Bangladesh. Cash on delivery available.',
  openGraph: { type: 'website', siteName: 'Arcane Mart' },
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: '#2F7D1F' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
