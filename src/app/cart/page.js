import Shell from '@/components/Shell';
import CartView from '@/components/CartView';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Your cart' };
export default function CartPage() {
  return <Shell><CartView /></Shell>;
}
