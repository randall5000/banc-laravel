'use client';

import { useState } from 'react';
import { Heart, CheckCircle } from 'lucide-react';
import type { Bench } from '@/lib/types';

interface BenchActionButtonsProps {
  bench: Bench;
  position: 'overlay' | 'share' | 'buttons';
}

export default function BenchActionButtons({ bench, position }: BenchActionButtonsProps) {
  const [likes, setLikes] = useState(bench.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
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

  const handleCheckIn = () => {
    alert('Check-in feature coming soon! This will log your visit to this bench.');
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: bench.location,
          text: `Check out this bench at ${bench.location}!`,
          url: url,
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  if (position === 'overlay') {
    return (
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
          <Heart size={20} className="fill-white stroke-white" />
          <span className="font-semibold text-white">{likes}</span>
        </div>
        
        <button 
          onClick={handleLike}
          disabled={isLiking || isLiked}
          className={`p-3 rounded-full transition-all hover:scale-110 shadow-lg ${
            isLiked 
              ? 'bg-rose-500' 
              : 'bg-white/90 hover:bg-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Heart 
            size={24} 
            className={isLiked 
              ? 'fill-white stroke-white' 
              : 'stroke-gray-700 hover:fill-red-500 hover:stroke-red-500'
            }
          />
        </button>
      </div>
    );
  }

  if (position === 'share') {
    return (
      <button 
        onClick={handleShare}
        className="p-3 hover:bg-gray-100 rounded-full transition-colors ml-4"
        title="Share this bench"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-gray-700"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </button>
    );
  }

  if (position === 'buttons') {
    return (
      <div className="flex gap-4">
        <button 
          onClick={handleLike}
          disabled={isLiking || isLiked}
          className={`px-8 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            isLiked
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-rose-500 text-white hover:bg-rose-600'
          }`}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          {isLiked ? 'Liked!' : 'Like this bench'}
        </button>
        <button 
          onClick={handleCheckIn}
          className="px-8 py-3 border-2 border-gray-300 rounded-full font-semibold hover:border-gray-400 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <CheckCircle size={20} />
          Check In
        </button>
      </div>
    );
  }

  return null;
}
