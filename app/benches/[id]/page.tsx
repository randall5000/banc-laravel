import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import type { Bench } from '@/lib/types';
import { RowDataPacket } from 'mysql2/promise';
import { MapPin, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import PhotoGallery from '@/components/PhotoGallery';
import BenchDetails from '@/components/BenchDetails';
import BenchComments from '@/components/BenchComments';
import BenchActionButtons from '@/components/BenchActionButtons';

async function getBench(id: string): Promise<Bench | null> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM benches WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Bench;
  } catch (error) {
    console.error('Failed to fetch bench:', error);
    return null;
  }
}

async function getBenchPhotos(benchId: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bench_photos WHERE bench_id = ? ORDER BY display_order ASC',
      [benchId]
    );
    return rows;
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return [];
  }
}

export default async function BenchDetailPage({ params }: { params: { id: string } }) {
  const bench = await getBench(params.id);

  if (!bench) {
    notFound();
  }

  const photos = await getBenchPhotos(params.id);
  const photoUrls = photos.length > 0 ? photos.map(p => p.photo_url) : [bench.image_url];

  const formattedDate = new Date(bench.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const locationParts = [];
  if (bench.town) locationParts.push(bench.town);
  if (bench.province) locationParts.push(bench.province);
  if (bench.country) locationParts.push(bench.country);
  const fullLocation = locationParts.join(', ');

  const postedByUsername = 'explorer123';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to all benches</span>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="relative">
              <PhotoGallery photos={photoUrls} location={bench.location} />
              <BenchActionButtons bench={bench} position="overlay" />
            </div>
            {bench.latitude && bench.longitude && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Location on Map</h2>
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Interactive map will go here</p>
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{bench.location}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={20} />
                    <span className="text-lg">{fullLocation}</span>
                  </div>
                  {bench.latitude && bench.longitude && (
                    <div className="text-sm text-gray-500 font-mono">
                      {Number(bench.latitude).toFixed(6)}, {Number(bench.longitude).toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
              <BenchActionButtons bench={bench} position="share" />
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About this bench</h2>
              <p className="text-gray-700 leading-relaxed">
                {bench.description || 'No description available for this bench yet.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-8">
              <Calendar size={16} />
              <span>Added on {formattedDate} by <span className="font-semibold text-gray-700">{postedByUsername}</span></span>
            </div>
            <BenchActionButtons bench={bench} position="buttons" />
            <div className="mt-8">
              <BenchDetails bench={bench} photoCount={photoUrls.length} postedBy={postedByUsername} />
            </div>
            <BenchComments benchId={bench.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
