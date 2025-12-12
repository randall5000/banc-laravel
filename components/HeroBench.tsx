'use client';

import { useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import Link from 'next/link';
import type { Bench } from '@/lib/types';

interface HeroBenchProps {
  bench: Bench;
}

export default function HeroBench({ bench }: HeroBenchProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(bench.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking || isLiked) return;
    
    setIsLiking(true);
    
    try {
      const response = await fetch(`/api/benches/${bench.id}/like`, {
        method: 'POST',
      });
      
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
    <div className="w-full mb-12">
      <Link href={`/benches/${bench.id}`} className="block">
        <div className="relative h-[70vh] min-h-[500px] w-full">
          <img 
            src={bench.image_url} 
            alt={bench.location}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <div className="max-w-7xl mx-auto">
              <span className="inline-block px-3 py-1 bg-rose-500 rounded-full text-sm font-semibold mb-4">
                Featured
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {bench.location}
              </h1>
              <p className="text-xl md:text-2xl mb-4 flex items-center gap-2">
                <MapPin size={24} />
                {bench.country}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={isLiking || isLiked}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors ${
                    isLiked
                      ? 'bg-rose-500 text-white cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  <Heart 
                    size={20} 
                    className={isLiked ? 'fill-current' : ''}
                  />
                  {likes}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
