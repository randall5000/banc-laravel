'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, MapPin, Image as ImageIcon, Award, Loader2, X, AlertCircle, ArrowRight } from 'lucide-react';
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

  const checkExifData = async (file: File) => {
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
          setShowExifPrompt(true); // Prepare prompt for Step 2
          return true;
        }
      }
    } catch (e) {
      console.error('Error reading EXIF data:', e);
    }
    return false;
  };

  // Old handleFileSelect removed. New one is below in the component body.

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

  // State for Wizard
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // ... (keep existing state: benchName, description, location, images, etc.) ...

  // Helper to upload single file
  const uploadFile = async (file: File) => {
    const processedFile = await processFile(file);
    const formData = new FormData();
    formData.append('file', processedFile);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.url;
  };

  // Image Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingPhoto(true);
      setShowExifPrompt(false);
      setPotentialLocation(null);

      try {
        const file = e.target.files[0];
        // 1. Check EXIF
        await checkExifData(file);

        // 2. Upload
        const url = await uploadFile(file);
        setUploadedImages(prev => [...prev, url]);

      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image.");
      } finally {
        setIsUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && uploadedImages.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }
    if (currentStep === 2 && !latitude) {
      alert("Please set a location.");
      return;
    }
    if (currentStep === 3 && (!benchName || !country)) {
      alert("Please enter a name and country.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span className={currentStep >= 1 ? "text-rose-500" : ""}>Photos</span>
          <span className={currentStep >= 2 ? "text-rose-500" : ""}>Location</span>
          <span className={currentStep >= 3 ? "text-rose-500" : ""}>Details</span>
          <span className={currentStep >= 4 ? "text-rose-500" : ""}>Tribute</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-rose-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* STEP 1: PHOTOS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Step 1: Upload Photos</h2>
            <p className="text-gray-600 text-sm">Start by verifying the bench exists! Upload a clear photo.</p>

            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-colors flex flex-col items-center justify-center gap-4 disabled:opacity-50"
            >
              {isUploadingPhoto ? (
                <>
                  <Loader2 size={48} className="text-rose-500 animate-spin" />
                  <span className="text-gray-600">Processing image...</span>
                </>
              ) : (
                <>
                  <div className="p-4 bg-rose-100 text-rose-500 rounded-full">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-semibold text-gray-900">Click to upload</span>
                    <span className="text-sm text-gray-500">Supports HEIC, JPG, PNG</span>
                  </div>
                </>
              )}
            </button>

            {/* Previews */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Step 2: Pin the Location</h2>

            {/* EXIF Prompt Logic */}
            {showExifPrompt && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <h4 className="font-semibold text-teal-900 flex items-center gap-2"><AlertCircle size={18} /> Photo Location Found!</h4>
                <p className="text-sm text-teal-700 mt-1 mb-3">We found GPS coordinates in your photo.</p>
                <button type="button" onClick={handleApplyExif} className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700">Use Photo Location</button>
              </div>
            )}

            {/* Main Map */}
            <div className="h-[400px] rounded-xl overflow-hidden border border-gray-300 relative">
              <LocationPicker
                initialLat={latitude}
                initialLng={longitude}
                onLocationSelect={handleMapSelect}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">Drag the marker to correct the position if needed.</p>

            {!showExifPrompt && !latitude && (
              <div className="flex justify-center">
                <button type="button" onClick={handleUseCurrentLocation} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm font-medium">
                  <MapPin size={16} /> Use My Current Location
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Step 3: Bench Details</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bench Title <span className="text-red-500">*</span></label>
              <input type="text" value={benchName} onChange={(e) => setBenchName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g. Sunset Point Bench" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none" placeholder="What makes this view special?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Town/City</label>
                <input type="text" value={town} onChange={(e) => setTown(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Country <span className="text-red-500">*</span></label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" readOnly />
              <p className="text-xs text-gray-400 mt-1">Location fields update automatically from the map.</p>
            </div>
          </div>
        )}

        {/* STEP 4: TRIBUTE & SUBMIT */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Step 4: Tribute & Review</h2>

            <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="isTribute" checked={isTribute} onChange={(e) => setIsTribute(e.target.checked)} className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500" />
                <label htmlFor="isTribute" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="text-amber-600" />
                  This is a Tribute Bench
                </label>
              </div>

              {isTribute && (
                <div className="space-y-4 pl-8 border-l-2 border-amber-200 ml-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">In Memory Of</label>
                    <input type="text" value={tributeName} onChange={(e) => setTributeName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Name of person..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={tributeDate} onChange={(e) => setTributeDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>📍 <strong>Location:</strong> {town}, {country}</li>
                <li>📸 <strong>Photos:</strong> {uploadedImages.length} attached</li>
                <li>📝 <strong>Name:</strong> {benchName}</li>
              </ul>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
          {currentStep > 1 ? (
            <button type="button" onClick={prevStep} className="px-6 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Back
            </button>
          ) : (
            <button type="button" onClick={() => router.push('/')} className="px-6 py-3 text-gray-500 hover:text-gray-900 font-medium">Cancel</button>
          )}

          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <>Share Bench <Upload size={18} /></>}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}