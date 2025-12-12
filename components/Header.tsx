'use client';

import { Search, Menu, Globe, User, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface SuggestionItem {
  text: string;
  image_url: string;
}

interface HeaderProps {
  benches?: Array<{
    id: number;
    location: string;
    town?: string;
    province?: string;
    country: string;
    image_url: string;
  }>;
}

export default function Header({ benches = [] }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const matchedSuggestions: SuggestionItem[] = [];
    const seenTexts = new Set<string>();
    
    for (const bench of benches) {
      if (matchedSuggestions.length >= 5) break;
      
      if (bench.location.toLowerCase().includes(query) && !seenTexts.has(bench.location)) {
        matchedSuggestions.push({ text: bench.location, image_url: bench.image_url });
        seenTexts.add(bench.location);
        continue;
      }
      
      if (bench.town) {
        const townText = `${bench.town}, ${bench.country}`;
        if (bench.town.toLowerCase().includes(query) && !seenTexts.has(townText)) {
          matchedSuggestions.push({ text: townText, image_url: bench.image_url });
          seenTexts.add(townText);
          continue;
        }
      }
      
      if (bench.province) {
        const provinceText = `${bench.province}, ${bench.country}`;
        if (bench.province.toLowerCase().includes(query) && !seenTexts.has(provinceText)) {
          matchedSuggestions.push({ text: provinceText, image_url: bench.image_url });
          seenTexts.add(provinceText);
          continue;
        }
      }
      
      if (bench.country.toLowerCase().includes(query) && !seenTexts.has(bench.country)) {
        matchedSuggestions.push({ text: bench.country, image_url: bench.image_url });
        seenTexts.add(bench.country);
      }
    }
    
    setSuggestions(matchedSuggestions);
    setShowSuggestions(matchedSuggestions.length > 0);
  }, [searchQuery]);

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          router.push(`/?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    router.push(`/?search=${encodeURIComponent(suggestion.text)}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image 
              src="/banconauts_logo.jpg" 
              alt="Banconaut" 
              width={420}
              height={120}
              priority
              className="h-30 w-auto"
            />
          </Link>

          <div ref={searchRef} className="hidden md:block relative">
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} placeholder="Find a bench" className="text-sm text-gray-600 outline-none bg-transparent w-40" />
              <div className="flex items-center gap-2">
                <button type="submit" className="bg-rose-500 p-2 rounded-full hover:bg-rose-600 transition-colors">
                  <Search size={16} className="text-white" />
                </button>
                <button type="button" onClick={handleLocationSearch} className="bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors" title="Find benches near me">
                  <MapPin size={16} className="text-white" />
                </button>
              </div>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[300px]">
                {suggestions.map((suggestion, index) => (
                  <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0">
                    <img src={suggestion.image_url} alt={suggestion.text} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{suggestion.text}</span>
                    </div>
                    <Search size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/upload" className="hidden md:block text-sm font-semibold text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors">
              Share a bench
            </Link>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <Globe size={20} />
            </button>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full p-2 pl-3 hover:shadow-md transition-shadow cursor-pointer">
              <Menu size={16} />
              <div className="bg-gray-700 rounded-full p-1.5">
                <User size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
