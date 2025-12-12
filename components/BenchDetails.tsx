'use client';

import { useState } from 'react';
import { ChevronDown, Award } from 'lucide-react';
import type { Bench } from '@/lib/types';

interface BenchDetailsProps {
  bench: Bench;
  photoCount: number;
  postedBy: string;
}

export default function BenchDetails({ bench, photoCount, postedBy }: BenchDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTributeDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <h3 className="font-semibold text-gray-900 text-lg">Bench Details</h3>
        <ChevronDown 
          size={24} 
          className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible Content */}
      <div 
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-6 space-y-3 bg-white">
          {/* Tribute Section - Shows if is_tribute is true */}
          {bench.is_tribute && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} className="text-amber-600" />
                <h4 className="font-semibold text-amber-900">Tribute Bench</h4>
              </div>
              <div className="text-sm space-y-1">
                {bench.tribute_name && (
                  <p className="text-amber-900">
                    <span className="font-medium">In memory of:</span> {bench.tribute_name}
                  </p>
                )}
                {bench.tribute_date && (
                  <p className="text-amber-800">
                    <span className="font-medium">Date:</span> {formatTributeDate(bench.tribute_date)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Regular Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Photos</span>
              <span className="font-medium text-gray-900">{photoCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Location Verified</span>
              <span className="font-medium text-gray-900">
                {bench.latitude && bench.longitude ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Posted By</span>
              <span className="font-medium text-gray-900">{postedBy}</span>
            </div>
            {bench.is_tribute && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Bench Type</span>
                <span className="font-medium text-amber-700 flex items-center gap-1">
                  <Award size={14} />
                  Tribute
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
