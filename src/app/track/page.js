import Shell from '@/components/Shell';
import TrackForm from '@/components/TrackForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Track your order' };
export default function TrackPage() {
  return <Shell><TrackForm /></Shell>;
}
