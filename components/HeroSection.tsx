'use client';

import { useSearchParams } from 'next/navigation';
import HeroBench from './HeroBench';
import type { Bench } from '@/lib/types';

interface HeroSectionProps {
  heroBench: Bench | undefined;
}

export default function HeroSection({ heroBench }: HeroSectionProps) {
  const searchParams = useSearchParams();
  const hasSearch = searchParams.get('search');
  const hasLocation = searchParams.get('lat') && searchParams.get('lng');

  // Hide hero if there's an active search or location-based filtering
  if (hasSearch || hasLocation || !heroBench) {
    return null;
  }

  return <HeroBench bench={heroBench} />;
}