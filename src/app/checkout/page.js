import Shell from '@/components/Shell';
import CheckoutForm from '@/components/CheckoutForm';
import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <Shell><CheckoutForm settings={settings} /></Shell>;
}
