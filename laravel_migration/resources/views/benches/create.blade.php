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

            <!-- Photo Upload -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bench Photo</label>
                <div class="flex items-center justify-center w-full">
                    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                            <svg class="w-10 h-10 mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-2 text-sm"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                            <p class="text-xs">SVG, PNG, JPG or GIF (MAX. 10MB)</p>
                        </div>
                        <input id="dropzone-file" name="photo" type="file" class="hidden" required />
                    </label>
                </div>
                @error('photo') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>

            <!-- Location Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title / Location Name</label>
                    <input type="text" name="location" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="e.g. Sunset Point Bench" required>
                    @error('location') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" name="country" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="e.g. Canada" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Town / City</label>
                    <input type="text" name="town" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="e.g. Vancouver" >
                </div>
            </div>

            <!-- Description -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="4" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="Tell us what makes this bench special..." required></textarea>
                @error('description') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
            </div>

            <!-- Coordinates (Hidden/Advanced) -->
            <div x-data="{ open: false }">
                <button type="button" @click="open = !open" class="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                    <span x-show="!open">+ Add Coordinates (Optional)</span>
                    <span x-show="open">- Hide Coordinates</span>
                </button>
                
                <div x-show="open" class="grid grid-cols-2 gap-6 mt-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input type="text" name="latitude" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="0.000000">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input type="text" name="longitude" class="w-full rounded-lg border-gray-300 focus:ring-black focus:border-black" placeholder="0.000000">
                    </div>
                    <p class="col-span-2 text-xs text-gray-500">Tip: Right-click on Google Maps to get these numbers.</p>
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
