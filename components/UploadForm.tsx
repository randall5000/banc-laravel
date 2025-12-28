'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, MapPin, Image as ImageIcon, Award, Loader2, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import heic2any from 'heic2any';
import ExifReader from 'exifreader';
import dynamic from 'next/dynamic';

// Dynamic import for the Map component to avoid SSR issues
const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [benchName, setBenchName] = useState('');
  const [town, setTown] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [isTribute, setIsTribute] = useState(false);
  const [tributeName, setTributeName] = useState('');
  const [tributeDate, setTributeDate] = useState('');

  // Prompts
  const [showExifPrompt, setShowExifPrompt] = useState(false);
  const [showNoExifPrompt, setShowNoExifPrompt] = useState(false);
  const [potentialLocation, setPotentialLocation] = useState<{ lat: number, lng: number } | null>(null);

  const processFile = async (file: File): Promise<File> => {
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (e) {
        console.error('HEIC conversion failed:', e);
        return file;
      }
    }
    return file;
  };

  const extractExifLocation = async (file: File) => {
    try {
      const tags = await ExifReader.load(file);
      // @ts-ignore
      const latDesc = tags['GPSLatitude']?.description;
      // @ts-ignore
      const lngDesc = tags['GPSLongitude']?.description;

      if (latDesc && lngDesc) {
        const lat = parseFloat(latDesc);
        const lng = parseFloat(lngDesc);
        if (!isNaN(lat) && !isNaN(lng)) {
          setPotentialLocation({ lat, lng });
          setShowExifPrompt(true);
          return true; // Found EXIF
        }
      }
    } catch (e) {
      console.error('Error reading EXIF data:', e);
    }
    return false; // No EXIF found
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    // Reset prompts on new upload
    setShowExifPrompt(false);
    setShowNoExifPrompt(false);
    setPotentialLocation(null);

    try {
      let exifFound = false;

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const processedFile = await processFile(file);

        // Check EXIF only on the first file for simplicity
        if (index === 0) {
          const hasExif = await extractExifLocation(file);
          exifFound = hasExif;
        }

        const formData = new FormData();
        formData.append('file', processedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages([...uploadedImages, ...urls]);

      // If no EXIF was found in the first file, show the "No EXIF" prompt
      if (!exifFound) {
        setShowNoExifPrompt(true);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        setTown(address.city || address.town || address.village || address.hamlet || '');
        setProvince(address.state || address.province || '');
        setCountry(address.country || '');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleApplyExif = () => {
    if (potentialLocation) {
      setLatitude(potentialLocation.lat);
      setLongitude(potentialLocation.lng);
      reverseGeocode(potentialLocation.lat, potentialLocation.lng);
      setShowExifPrompt(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);
          await reverseGeocode(lat, lon);
          setIsGettingLocation(false);
          setShowNoExifPrompt(false);
        },
        () => {
          setIsGettingLocation(false);
          alert('Could not get location. Please allow access or pick a spot on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    // Optional: Reverse geocode on every pin drop? 
    // Yes, usually helpful for the user.
    reverseGeocode(lat, lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchName.trim() || !country.trim()) {
      alert('Please fill in at least the bench name and country.');
      return;
    }
    if (uploadedImages.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const benchResponse = await fetch('/api/benches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: benchName,
          town: town || null,
          province: province || null,
          country,
          latitude,
          longitude,
          description: description || null,
          image_url: uploadedImages[0],
          is_tribute: isTribute,
          tribute_name: isTribute && tributeName ? tributeName : null,
          tribute_date: isTribute && tributeDate ? tributeDate : null,
        }),
      });

      if (!benchResponse.ok) throw new Error('Failed to create bench');
      const { id: benchId } = await benchResponse.json();

      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          await fetch(`/api/benches/${benchId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photo_url: uploadedImages[i],
              is_primary: i === 0,
              display_order: i + 1,
            }),
          });
        }
      }
      alert('Bench uploaded successfully!');
      router.push(`/benches/${benchId}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload bench. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 space-y-6">

      {/* 1. Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Upload Photos <span className="text-red-500">*</span>
        </label>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingPhoto}
          className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-500 hover:bg-rose-50 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploadingPhoto ? (
            <>
              <Loader2 size={32} className="text-rose-500 animate-spin" />
              <span className="text-sm text-gray-600">Uploading photos...</span>
            </>
          ) : (
            <>
              <ImageIcon size={32} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Tap to upload photos</span>
              <span className="text-xs text-gray-500">Supports HEIC & Live Photos</span>
            </>
          )}
        </button>

        {/* Photo Previews */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && <div className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-2 py-1 rounded">Primary</div>}
                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Prompts Area */}
      {showExifPrompt && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-teal-900">Location found in photo</h4>
              <p className="text-sm text-teal-700">Would you like to use the GPS data from your uploaded photo?</p>
            </div>
          </div>
          <div className="flex gap-3 pl-8">
            <button type="button" onClick={handleApplyExif} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">Yes, use photo location</button>
            <button type="button" onClick={() => setShowExifPrompt(false)} className="px-4 py-2 bg-white text-teal-700 text-sm font-semibold border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">No, thanks</button>
          </div>
        </div>
      )}

      {showNoExifPrompt && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">No location data in uploaded photo</h4>
              <p className="text-sm text-amber-700">Use your current device location instead?</p>
            </div>
          </div>
          <div className="flex gap-3 pl-8">
            <button type="button" onClick={handleUseCurrentLocation} disabled={isGettingLocation} className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2">
              {isGettingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              Yes, use current location
            </button>
            <button type="button" onClick={() => setShowNoExifPrompt(false)} className="px-4 py-2 bg-white text-amber-700 text-sm font-semibold border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">No, I'll pick on map</button>
          </div>
        </div>
      )}

      {/* 3. Map Picker & Bench Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Bench Location (New Map Form) <span className="text-red-500">*</span></label>
        <p className="text-xs text-gray-500 mb-2">Drag the pin to the exact location of the bench.</p>

        {/* Map */}
        <div className="mb-4">
          <LocationPicker
            initialLat={latitude}
            initialLng={longitude}
            onLocationSelect={handleMapSelect}
          />
        </div>

        {/* Bench Name Input */}
        <input
          type="text"
          value={benchName}
          onChange={(e) => setBenchName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent mt-2"
          placeholder="Detailed Name (e.g., Central Park West Entrance Bench)"
          required
        />
      </div>

      {/* 4. Location Fields (Mobile Fixed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Town */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Town/City</label>
          <input type="text" value={town} onChange={(e) => setTown(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Auto-filled" />
        </div>

        {/* Province / State */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">State/Province</label>
          <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Auto-filled" />
        </div>

      </div>

      {/* Country - Separated container to prevent overlapping */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Country <span className="text-red-500">*</span></label>
        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Auto-filled" required />
      </div>

      {/* 5. Description & Tribute */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none" placeholder="Tell us about this bench..." />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <input type="checkbox" id="isTribute" checked={isTribute} onChange={(e) => setIsTribute(e.target.checked)} className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500" />
          <label htmlFor="isTribute" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Award size={20} className="text-amber-600" /> This is a tribute bench
          </label>
        </div>

        {isTribute && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">In Memory Of</label>
              <input type="text" value={tributeName} onChange={(e) => setTributeName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tribute Date</label>
              <input type="date" value={tributeDate} onChange={(e) => setTributeDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 pt-6">
        <button type="submit" disabled={isSubmitting || uploadedImages.length === 0} className="w-full bg-rose-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Uploading...</> : <><Upload size={20} /> Share This Bench</>}
        </button>
        <button type="button" onClick={() => router.push('/')} className="w-full px-8 py-3 border-2 border-gray-300 rounded-full font-semibold hover:border-gray-400 transition-colors">Cancel</button>
      </div>
    </form>
  );
}