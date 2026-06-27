import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DiscoverClient from '@/components/discover/DiscoverClient';

export default async function DiscoverPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return (
    <div
      style={{
        background: '#f5f0e4',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 390,
        margin: '0 auto',
      }}
    >
      <DiscoverClient />
    </div>
  );
}
