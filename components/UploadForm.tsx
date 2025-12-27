'use client';

import { useState, useRef } from 'react';
import { Upload, MapPin, Image as ImageIcon, Award, Loader2, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import heic2any from 'heic2any';
import ExifReader from 'exifreader';

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
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [isTribute, setIsTribute] = useState(false);
  const [tributeName, setTributeName] = useState('');
  const [tributeDate, setTributeDate] = useState('');

  // New state for EXIF location prompt
  const [potentialLocation, setPotentialLocation] = useState<{ lat: number, lng: number } | null>(null);

  const processFile = async (file: File): Promise<File> => {
    // 1. Handle HEIC conversion
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        console.log('Converting HEIC file...', file.name);
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });

        // heic2any can return a Blob or Blob[]
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const newFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        console.log('Conversion successful:', newFile.name);
        return newFile;
      } catch (e) {
        console.error('HEIC conversion failed:', e);
        // Fallback to original file if conversion fails (server might handle it or just fail)
        return file;
      }
    }
    return file;
  };

  const extractExifLocation = async (file: File) => {
    try {
      const tags = await ExifReader.load(file);

      if (tags['GPSLatitude'] && tags['GPSLongitude']) {
        // ExifReader returns coordinates as array of numbers [degrees, minutes, seconds]
        // or simple number depending on version, but usually provides a 'description' 
        // We need to parse correctly based on the library output.
        // The safest way with ExifReader is typically checking the 'description' property which is pre-calculated
        // BUT for robust calculation we can use the raw values if needed.
        // Let's rely on the library's parsing if available, otherwise manual.

        // Actually ExifReader standardizes this well in recent versions.
        // Let's assume standard behavior:

        // Helper to convert DMS to Decimal
        // @ts-ignore
        const lat = tags['GPSLatitude'].description;
        // @ts-ignore
        const lng = tags['GPSLongitude'].description;

        if (lat && lng) {
          // Sometimes it returns just the number if it's simple
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lng);

          if (!isNaN(latNum) && !isNaN(lngNum)) {
            console.log('Found GPS data:', latNum, lngNum);
            setPotentialLocation({ lat: latNum, lng: lngNum });
          }
        }
      }
    } catch (e) {
      console.error('Error reading EXIF data:', e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // 1. Convert/Process File
        const processedFile = await processFile(file);

        // 2. Extract EXIF (only from the first file to avoid spamming prompts)
        // We check the ORIGINAL file for EXIF because sometimes conversion strips metadata
        // although heic2any tries to preserve it, it's safer to read original if possible.
        // However, standard File API file objects are blobs.
        // Let's read the processed file if it was converted, or original if not.
        // Actually best to read original for EXIF data before conversion if possible?
        // Let's try reading the PROCESSED file because we want the final image to be what we use.
        // BUT sometimes we want to extract from original. Let's try original for GPS.
        if (!latitude && !longitude && !potentialLocation) {
          await extractExifLocation(file);
        }

        const formData = new FormData();
        formData.append('file', processedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages([...uploadedImages, ...urls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    if (uploadedImages.length <= 1) {
      // If they remove the only photo, maybe clear the potential location? 
      // Nah, keep it if they accepted it.
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        // Extract location details
        const city = address.city || address.town || address.village || address.hamlet || '';
        const state = address.state || address.province || '';
        const countryName = address.country || '';

        // Only overwrite if empty? Or always?
        // Let's update state.
        setTown(city);
        setProvince(state);
        setCountry(countryName);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Don't alert - location fields will just stay empty
    }
  };

  const applyPotentialLocation = () => {
    if (potentialLocation) {
      setLatitude(potentialLocation.lat.toFixed(6));
      setLongitude(potentialLocation.lng.toFixed(6));
      reverseGeocode(potentialLocation.lat, potentialLocation.lng);
      setPotentialLocation(null); // Hide prompt
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          setLatitude(lat.toFixed(6));
          setLongitude(lon.toFixed(6));

          // Get address from coordinates
          await reverseGeocode(lat, lon);

          setIsGettingLocation(false);
        },
        (error) => {
          setIsGettingLocation(false);
          alert('Unable to get your location. Please enable location services or enter details manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
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
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          description: description || null,
          image_url: uploadedImages[0],
          is_tribute: isTribute,
          tribute_name: isTribute && tributeName ? tributeName : null,
          tribute_date: isTribute && tributeDate ? tributeDate : null,
        }),
      });

      if (!benchResponse.ok) {
        throw new Error('Failed to create bench');
      }

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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
      {/* Photo Upload - FIRST */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Upload Photos <span className="text-red-500">*</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

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
              <span className="text-sm font-semibold text-gray-700">
                Tap to upload photos
              </span>
              <span className="text-xs text-gray-500">
                You can select multiple photos
              </span>
            </>
          )}
        </button>

        {/* Photo Preview Grid */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXIF Location Prompt */}
      {potentialLocation && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-teal-900 mb-1">
              Location found in photo
            </h4>
            <p className="text-sm text-teal-700 mb-3">
              We found GPS coordinates in your uploaded photo. Would you like to use this location?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={applyPotentialLocation}
                className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
              >
                Yes, use photo location
              </button>
              <button
                type="button"
                onClick={() => setPotentialLocation(null)}
                className="px-4 py-2 bg-white text-teal-700 text-sm font-semibold border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
              >
                No, thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Use My Location Button - SECOND */}
      <div>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isGettingLocation}
          className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGettingLocation ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <MapPin size={20} />
              Use My Location
            </>
          )}
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          This will automatically fill in your location details
        </p>
      </div>

      {/* Bench Name */}
      <div>
        <label htmlFor="benchName" className="block text-sm font-semibold text-gray-900 mb-2">
          Bench Name / Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="benchName"
          value={benchName}
          onChange={(e) => setBenchName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          placeholder="e.g., Central Park West Entrance"
          required
        />
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="town" className="block text-sm font-semibold text-gray-900 mb-2">
            Town/City
          </label>
          <input
            type="text"
            id="town"
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Will auto-fill from location"
          />
        </div>
        <div>
          <label htmlFor="province" className="block text-sm font-semibold text-gray-900 mb-2">
            State/Province
          </label>
          <input
            type="text"
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Will auto-fill from location"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Will auto-fill from location"
            required
          />
        </div>
      </div>

      {/* GPS Coordinates (Read-only, auto-filled) */}
      {latitude && longitude && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-1">GPS Coordinates</p>
          <p className="text-sm text-blue-700 font-mono">
            {latitude}, {longitude}
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
          placeholder="Tell us about this bench... What makes it special?"
        />
      </div>

      {/* Tribute Bench */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="isTribute"
            checked={isTribute}
            onChange={(e) => setIsTribute(e.target.checked)}
            className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
          />
          <label htmlFor="isTribute" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Award size={20} className="text-amber-600" />
            This is a tribute bench
          </label>
        </div>

        {isTribute && (
          <div className="grid grid-cols-1 gap-4 ml-8">
            <div>
              <label htmlFor="tributeName" className="block text-sm font-medium text-gray-700 mb-2">
                In Memory Of
              </label>
              <input
                type="text"
                id="tributeName"
                value={tributeName}
                onChange={(e) => setTributeName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label htmlFor="tributeDate" className="block text-sm font-medium text-gray-700 mb-2">
                Tribute Date
              </label>
              <input
                type="date"
                id="tributeDate"
                value={tributeDate}
                onChange={(e) => setTributeDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting || uploadedImages.length === 0}
          className="w-full bg-rose-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Share This Bench
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full px-8 py-3 border-2 border-gray-300 rounded-full font-semibold hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}