@extends('layouts.app')

@section('content')
<div class="max-w-3xl mx-auto px-6 py-12">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Add a New Bench</h1>
        <p class="text-gray-600">Share a beautiful resting spot with the world.</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <form action="{{ route('benches.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
            @csrf

            <!-- User Name (Optional Attribution) -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Uploaded By (Optional)</label>
                <input type="text" name="user_name" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none" placeholder="Your name">
            </div>

            <!-- Tribute Details (Optional) -->
            <div class="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-100" x-data="{ isTribute: false }">
                <div class="flex items-center gap-3 mb-4">
                    <input type="checkbox" id="is_tribute" name="is_tribute" value="1" x-model="isTribute" class="w-5 h-5 text-black border-gray-300 rounded focus:ring-black">
                    <label for="is_tribute" class="font-medium text-gray-900 cursor-pointer select-none">Is this a Tribute Bench?</label>
                </div>

                <div x-show="isTribute" x-transition class="space-y-4 pt-2 border-t border-gray-200 mt-2" style="display: none;">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">In Memory Of (Name)</label>
                        <input type="text" name="tribute_name" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none" placeholder="e.g. John Doe">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Date (Optional)</label>
                        <input type="date" name="tribute_date" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none">
                    </div>
                </div>
            </div>

            <!-- Image Upload -->
            <div class="mb-8" x-data="{ images: [] }">
                <label class="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div class="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors group cursor-pointer">
                    <input 
                        type="file" 
                        name="photos[]" 
                        multiple
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        @change="
                            images = [];
                            Array.from($event.target.files).forEach(file => {
                                let reader = new FileReader();
                                reader.onload = (e) => { images.push(e.target.result); };
                                reader.readAsDataURL(file);
                            });
                        "
                    >
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">Click to upload photos</p>
                            <p class="text-sm text-gray-500 mt-1">SVG, PNG, JPG or WEBP (max. 10MB)</p>
                        </div>
                    </div>
                </div>

                <!-- Preview Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4" x-show="images.length > 0" style="display: none;">
                    <template x-for="(img, index) in images" :key="index">
                        <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 relative shadow-sm border border-gray-100">
                             <img :src="img" class="w-full h-full object-cover">
                             <div x-show="index === 0" class="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium">Cover</div>
                        </div>
                    </template>
                </div>
            </div>
            @error('photos') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror

            <!-- Location Logic -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" 
                 x-data="{ 
                    countries: {{ json_encode($locationData) }},
                    selectedCountry: '',
                    provinces: [],
                    updateProvinces() {
                        this.provinces = this.countries[this.selectedCountry] || [];
                        // Reset province if not in new list
                        if (!this.provinces.includes($refs.provinceInput.value)) {
                            $refs.provinceInput.value = '';
                        }
                    }
                 }"
            >
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title / Location Name</label>
                    <input type="text" name="location" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="e.g. Sunset Point Bench" required>
                    @error('location') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <div class="relative">
                        <select name="country" x-model="selectedCountry" @change="updateProvinces()" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black appearance-none bg-white py-2 pl-3 pr-8" required>
                            <option value="">Select a country...</option>
                            <template x-for="(regions, country) in countries" :key="country">
                                <option :value="country" x-text="country"></option>
                            </template>
                        </select>
                         <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                        
                        <!-- Show Dropdown if regions exist -->
                        <div x-show="provinces.length > 0" class="relative">
                            <select name="province" x-ref="provinceInput" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black appearance-none bg-white py-2 pl-3 pr-8">
                                <option value="">Select Region...</option>
                                <template x-for="province in provinces" :key="province">
                                    <option :value="province" x-text="province"></option>
                                </template>
                            </select>
                             <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <!-- Fallback Text Input if no regions (or 'Other' selected) -->
                        <input x-show="provinces.length === 0" type="text" name="province" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="e.g. Region">
                    </div>

                    <div>
                         <label class="block text-sm font-medium text-gray-700 mb-1">Town / City</label>
                         <input type="text" name="town" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="e.g. Vancouver" >
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="4" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="Tell us what makes this bench special..." required></textarea>
                @error('description') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>

            <!-- Coordinates (Advanced) -->
            <div x-data="{ 
                open: true, 
                loading: false,
                getLocation() {
                    this.loading = true;
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                document.getElementById('lat').value = position.coords.latitude;
                                document.getElementById('lng').value = position.coords.longitude;
                                this.loading = false;
                            },
                            (error) => {
                                alert('Error getting location: ' + error.message);
                                this.loading = false;
                            }
                        );
                    } else {
                        alert('Geolocation is not supported by this browser.');
                        this.loading = false;
                    }
                }
            }" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between mb-4">
                     <h3 class="text-sm font-medium text-gray-900">Coordinates</h3>
                     <button type="button" @click="getLocation()" class="flex items-center gap-2 text-xs font-semibold bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors">
                        <span x-show="!loading">📍 Use My Location</span>
                        <span x-show="loading">Getting location...</span>
                     </button>
                </div>
                
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Latitude</label>
                        <input type="text" id="lat" name="latitude" class="w-full rounded-lg border-gray-300 bg-white focus:ring-black focus:border-black text-sm" placeholder="0.000000">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Longitude</label>
                        <input type="text" id="lng" name="longitude" class="w-full rounded-lg border-gray-300 bg-white focus:ring-black focus:border-black text-sm" placeholder="0.000000">
                    </div>
                </div>
            </div>

            <div class="pt-4 border-t border-gray-100 flex justify-end gap-4">
                <a href="{{ route('home') }}" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</a>
                <button type="submit" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Add Bench
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
