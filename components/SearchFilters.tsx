'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Bench } from '@/lib/types';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onCountryFilter: (country: string) => void;
  onSort: (sortBy: string) => void;
  countries: string[];
  benches: Bench[];
  hasLocation?: boolean;
}

export default function SearchFilters({ onSearch, onCountryFilter, onSort, countries, benches, hasLocation = false }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matchedSuggestions = new Set<string>();
    benches.forEach(bench => {
      if (bench.location.toLowerCase().includes(query)) matchedSuggestions.add(bench.location);
      if (bench.town?.toLowerCase().includes(query)) matchedSuggestions.add(`${bench.town}, ${bench.country}`);
      if (bench.province?.toLowerCase().includes(query)) matchedSuggestions.add(`${bench.province}, ${bench.country}`);
      if (bench.country.toLowerCase().includes(query)) matchedSuggestions.add(bench.country);
    });
    const suggestionArray = Array.from(matchedSuggestions).slice(0, 5);
    setSuggestions(suggestionArray);
    setShowSuggestions(suggestionArray.length > 0);
  }, [searchQuery, benches]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    onCountryFilter(value);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSort(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
          <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} placeholder="Search..." className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden min-w-[250px]">
              {suggestions.map((suggestion, index) => (
                <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0">
                  <Search size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>
      {showFilters && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Country</label>
            <select value={selectedCountry} onChange={(e) => handleCountryChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Sort By</label>
            <select value={selectedSort} onChange={(e) => handleSortChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-liked">Most Liked</option>
              <option value="least-liked">Least Liked</option>
              {hasLocation && <option value="nearest">Nearest First</option>}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
