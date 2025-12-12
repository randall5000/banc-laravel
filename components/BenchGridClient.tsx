'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BenchCard from './BenchCard';
import SearchFilters from './SearchFilters';
import type { Bench } from '@/lib/types';
import { calculateDistance } from '@/lib/utils';

interface BenchGridClientProps {
  benches: Bench[];
}

interface BenchWithDistance extends Bench {
  distance?: number;
}

export default function BenchGridClient({ benches: initialBenches }: BenchGridClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const urlLat = searchParams.get('lat');
  const urlLng = searchParams.get('lng');
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (urlLat && urlLng) {
      setUserLocation({ lat: parseFloat(urlLat), lng: parseFloat(urlLng) });
      setSortBy('nearest');
    }
  }, [urlLat, urlLng]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const benchesWithDistance: BenchWithDistance[] = useMemo(() => {
    if (!userLocation) return initialBenches;
    return initialBenches.map(bench => {
      if (bench.latitude && bench.longitude) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, bench.latitude, bench.longitude);
        return { ...bench, distance };
      }
      return bench;
    });
  }, [initialBenches, userLocation]);

  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(initialBenches.map(b => b.country))];
    return uniqueCountries.sort();
  }, [initialBenches]);

  const filteredBenches = useMemo(() => {
    let filtered = [...benchesWithDistance];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bench => {
        const locationMatch = bench.location.toLowerCase().includes(query);
        const countryMatch = bench.country.toLowerCase().includes(query);
        const townMatch = bench.town?.toLowerCase().includes(query);
        const provinceMatch = bench.province?.toLowerCase().includes(query);
        
        // Also check if query matches full location string (e.g. "Manhattan, USA")
        const fullLocation = [bench.town, bench.province, bench.country]
          .filter(Boolean)
          .join(', ')
          .toLowerCase();
        const fullLocationMatch = fullLocation.includes(query);
        
        return locationMatch || countryMatch || townMatch || provinceMatch || fullLocationMatch;
      });
    }
    
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(bench => bench.country === selectedCountry);
    }
    
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'least-liked':
        filtered.sort((a, b) => a.likes - b.likes);
        break;
      case 'nearest':
        // Sort by distance, putting benches WITH coordinates first
        filtered.sort((a, b) => {
          // Both have distance - sort by distance
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          // Only a has distance - a comes first
          if (a.distance !== undefined) return -1;
          // Only b has distance - b comes first
          if (b.distance !== undefined) return 1;
          // Neither has distance - maintain original order
          return 0;
        });
        break;
    }
    
    return filtered;
  }, [benchesWithDistance, searchQuery, selectedCountry, sortBy]);

  // Count benches with and without coordinates when location search is active
  const benchStats = useMemo(() => {
    if (!userLocation) return null;
    
    const withCoords = filteredBenches.filter(b => b.distance !== undefined).length;
    const withoutCoords = filteredBenches.length - withCoords;
    
    return { withCoords, withoutCoords, total: filteredBenches.length };
  }, [filteredBenches, userLocation]);

  return (
    <div>
      {userLocation ? (
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Benches near you</h2>
      ) : (
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore Benches</h2>
      )}
      <div className="flex items-start gap-6">
        <div className="w-1/6 flex-shrink-0">
          <SearchFilters onSearch={setSearchQuery} onCountryFilter={setSelectedCountry} onSort={setSortBy} countries={countries} benches={initialBenches} hasLocation={!!userLocation} />
        </div>
        <div className="flex-1">
          {userLocation && sortBy === 'nearest' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">📍 Showing results sorted by distance from your location</p>
              {benchStats && benchStats.withoutCoords > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  Note: {benchStats.withoutCoords} {benchStats.withoutCoords === 1 ? 'bench' : 'benches'} shown at the end {benchStats.withoutCoords === 1 ? 'has' : 'have'} no GPS coordinates
                </p>
              )}
            </div>
          )}
          {filteredBenches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No benches found matching "{searchQuery}"</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term or clear your filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Showing {filteredBenches.length} {filteredBenches.length === 1 ? 'bench' : 'benches'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBenches.map((bench) => (
                  <BenchCard key={bench.id} bench={bench} distance={bench.distance} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}