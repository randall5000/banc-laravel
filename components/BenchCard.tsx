'use client';

import { useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Bench } from '@/lib/types';

interface BenchCardProps {
  bench: Bench;
  distance?: number;
}

export default function BenchCard({ bench, distance }: BenchCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(bench.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking || isLiked) return;
    setIsLiking(true);
    try {
      const response = await fetch(`/api/benches/${bench.id}/like`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to like bench:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Link href={`/benches/${bench.id}`} className="group cursor-pointer block">
      <div className="relative overflow-hidden rounded-xl mb-3">
        <img src={bench.image_url} alt={bench.location} className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105" />
        {distance !== undefined && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <p className="text-xs font-bold text-gray-900">{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</p>
            <p className="text-[10px] text-gray-600">{distance < 1 ? `${Math.round(distance * 1000 * 3.28084)}ft` : `${(distance * 0.621371).toFixed(1)}mi`}</p>
          </div>
        )}
        <button onClick={handleLike} disabled={isLiking || isLiked} className={`absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110 shadow-lg ${isLiked ? 'bg-rose-500' : 'bg-white/90 hover:bg-white'} disabled:opacity-50 disabled:cursor-not-allowed`}>
          <Heart size={20} className={isLiked ? 'fill-white stroke-white' : 'stroke-gray-700 hover:fill-red-500 hover:stroke-red-500'} />
        </button>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{bench.location}</h3>
          <p className="text-gray-600 text-sm flex items-center gap-1"><MapPin size={14} />{bench.country}</p>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Heart size={14} className={isLiked ? 'fill-red-500 stroke-red-500' : ''} />
          <span className="text-sm">{likes}</span>
        </div>
      </div>
    </Link>
  );
}
