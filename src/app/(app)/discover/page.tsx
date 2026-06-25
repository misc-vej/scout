import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DiscoverClient from '@/components/discover/DiscoverClient';

export default async function DiscoverPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Discover</h1>
      <DiscoverClient />
    </div>
  );
}
