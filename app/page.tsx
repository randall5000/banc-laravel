import { Suspense } from 'react';
import BenchCard from '@/components/BenchCard';
import Header from '@/components/Header';
import pool from '@/lib/db';
import type { Bench } from '@/lib/types';
import { RowDataPacket } from 'mysql2/promise';
import HeroBench from '@/components/HeroBench';
import BenchGridClient from '@/components/BenchGridClient';
import HeroSection from '@/components/HeroSection';

async function getBenches(): Promise<Bench[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM benches ORDER BY likes DESC, created_at DESC');
    return rows as Bench[];
  } catch (error) {
    console.error('Failed to fetch benches:', error);
    return [];
  }
}

export default async function Home() {
  const benches = await getBenches();
  const heroBench = benches[0];
  const headerBenches = benches.map(b => ({ id: b.id, location: b.location, town: b.town, province: b.province, country: b.country, image_url: b.image_url }));

  return (
    <div className="min-h-screen bg-white">
      <Header benches={headerBenches} />
      <Suspense fallback={null}>
        <HeroSection heroBench={heroBench} />
      </Suspense>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Suspense fallback={<div className="text-center py-12"><p className="text-gray-500">Loading benches...</p></div>}>
          <BenchGridClient benches={benches} />
        </Suspense>
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-sm text-gray-600">© 2024 Banconaut. Find your perfect bench.</div>
        </div>
      </footer>
    </div>
  );
}
