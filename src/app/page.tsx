import Header from '../../components/Header';
import HeroBench from '../../components/HeroBench';
import BenchGridClient from '../../components/BenchGridClient';
import type { Bench } from '../../lib/types';
import { Suspense } from 'react';

async function getBenches(): Promise<Bench[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  try {
    const res = await fetch(`${apiUrl}/api/benches`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      console.error('Failed to fetch benches:', res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching benches:', error);
    return [];
  }
}

export default async function Home() {
  const benches = await getBenches();

  // Logic from BenchController to find Hero Bench
  // orderBy('likes', 'desc')->orderBy('created_at', 'desc')->first()
  const heroBench = [...benches].sort((a, b) => {
    if (b.likes !== a.likes) {
      return b.likes - a.likes; 
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })[0];

  return (
    <main className="min-h-screen bg-zinc-50">
      <Header benches={benches} />
      
      {heroBench && (
        <HeroBench bench={heroBench} />
      )}

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <Suspense fallback={<div>Loading benches...</div>}>
          <BenchGridClient benches={benches} />
        </Suspense>
      </div>
    </main>
  );
}
