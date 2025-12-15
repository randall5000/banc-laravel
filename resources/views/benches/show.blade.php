@extends('layouts.app')

@section('content')
    <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="mb-6">
            <a href="{{ route('home') }}" class="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back to benches
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Left Column: Carousel & Map -->
            <div class="space-y-8" x-data="{ 
                activeSlide: 0, 
                lightboxOpen: false, 
                likes: {{ $bench->likes }},
                userLiked: {{ session()->has('liked_bench_' . $bench->id) ? 'true' : 'false' }},
                slides: {{ $bench->photos->map(fn($p) => ['url' => $p->photo_url, 'user' => $p->user_name])->toJson() }},
                async likeBench() {
                    if (this.userLiked) return;
                    
                    // Optimistic update
                    this.userLiked = true;
                    this.likes++;

                    try {
                        const response = await fetch('{{ route('benches.like', $bench) }}', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content
                            }
                        });
                        const data = await response.json();
                        this.likes = data.likes; // Sync with server
                    } catch (e) {
                        // Revert on error
                        this.userLiked = false;
                        this.likes--;
                        console.error('Like failed', e);
                    }
                }
            }">
                <!-- Fallback if no photos (shouldn't happen with validation, but safe) -->
                @if($bench->photos->isEmpty())
                     <div class="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm relative cursor-zoom-in group" @click="lightboxOpen = true">
                        <img src="{{ $bench->image_url }}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                         <div class="absolute bottom-4 left-4 text-white/90 text-sm font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                            {{ $bench->created_at->format('F j, Y') }}
                        </div>
                    </div>
                @else
                    <!-- Carousel Wrap -->
                    <div class="relative group rounded-2xl overflow-hidden shadow-sm bg-black aspect-[4/3] cursor-zoom-in" @click="lightboxOpen = true">
                        <!-- Main Slides -->
                        <template x-for="(slide, index) in slides" :key="index">
                            <div x-show="activeSlide === index" class="absolute inset-0 transition-opacity duration-300">
                                <img :src="slide.url" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                                
                                <!-- Overlays -->
                                <!-- 1. Bottom Left Group (User & Date) -->
                                <div class="absolute bottom-4 left-4 flex items-center gap-2">
                                    <!-- User Pill -->
                                    <div class="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        <span x-text="slide.user || 'Anonymous'"></span>
                                    </div>

                                    <!-- Date Pill (Shortened) -->
                                    <div class="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                        {{ $bench->created_at->format("M j, 'y") }}
                                    </div>
                                </div>
                                
                                <!-- 3. Right Overlay Group (Likes & Tribute) -->
                                <div class="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <!-- Likes (Interactive) -->
                                    <button 
                                        @click.stop="likeBench()" 
                                        class="bg-white/90 backdrop-blur-md text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 group/like"
                                        :class="userLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500'"
                                        :disabled="userLiked"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="transition-colors" :class="userLiked ? 'fill-current' : 'fill-none'"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                        <span x-text="likes"></span>
                                    </button>
                                    
                                    <!-- Tribute Badge -->
                                    @if($bench->is_tribute)
                                        <div class="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-sm border border-white/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                            Tribute
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </template>

                        <!-- Navigation Arrows (Stop propagation to prevent opening lightbox when navigating) -->
                        <button @click.stop="activeSlide = activeSlide === 0 ? slides.length - 1 : activeSlide - 1" class="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button @click.stop="activeSlide = activeSlide === slides.length - 1 ? 0 : activeSlide + 1" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>

                    <!-- Thumbnails -->
                    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <template x-for="(slide, index) in slides" :key="index">
                            <button @click="activeSlide = index" class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all" :class="activeSlide === index ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'">
                                <img :src="slide.url" class="w-full h-full object-cover">
                            </button>
                        </template>
                    </div>
                @endif

                <!-- Lightbox Overlay -->
                <!-- Use x-teleport to body to avoid stacking context issues -->
                <template x-teleport="body">
                    <div x-show="lightboxOpen" 
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0"
                        x-transition:enter-end="opacity-100"
                        x-transition:leave="transition ease-in duration-200"
                        x-transition:leave-start="opacity-100"
                        x-transition:leave-end="opacity-0"
                        @keydown.escape.window="lightboxOpen = false"
                        class="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
                        style="display: none;">
                        
                        <!-- Close Button - High Z-Index -->
                        <button @click="lightboxOpen = false" class="absolute top-6 right-6 z-[10000] text-white/70 hover:text-white transition-colors p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>

                        <!-- Main Image -->
                        <div class="relative w-full h-full flex items-center justify-center" @click.outside="lightboxOpen = false">
                            <template x-for="(slide, index) in slides" :key="index">
                                <img x-show="activeSlide === index" :src="slide.url" class="max-w-full max-h-full object-contain shadow-2xl">
                            </template>
                            
                            <!-- Fallback Image for Empty Photos Case -->
                            @if($bench->photos->isEmpty())
                                <img src="{{ $bench->image_url }}" class="max-w-full max-h-full object-contain shadow-2xl">
                            @endif
                        </div>

                        <!-- Navigation Arrows (Lightbox) -->
                        @if($bench->photos->count() > 1)
                            <button @click.stop="activeSlide = activeSlide === 0 ? slides.length - 1 : activeSlide - 1" class="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm z-[10000]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <button @click.stop="activeSlide = activeSlide === slides.length - 1 ? 0 : activeSlide + 1" class="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm z-[10000]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        @endif
                    </div>
                </template>
            </div>

            <!-- Right Column: Details -->
            <div>
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h1 class="text-4xl font-bold text-gray-900 mb-2 leading-tight">{{ $bench->location }}</h1>
                        <div class="flex items-center gap-2 text-gray-600 text-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {{ $bench->town ?? $bench->province ?? '' }}, {{ $bench->country }}
                        </div>
                    </div>
                </div>

                <div class="prose prose-lg text-gray-600 mb-8 leading-relaxed">
                    {{ $bench->description }}
                </div>

                @if($bench->latitude && $bench->longitude)
                    <div class="mb-8 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative z-0">
                        <iframe 
                            width="100%" 
                            height="250" 
                            frameborder="0" 
                            style="border:0"
                            src="https://maps.google.com/maps?q={{ $bench->latitude }},{{ $bench->longitude }}&hl=en&z=15&output=embed"
                            allowfullscreen>
                        </iframe>
                        <div class="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center border-t border-gray-100">
                            <span class="font-mono">{{ number_format($bench->latitude, 5) }}, {{ number_format($bench->longitude, 5) }}</span>
                            <a href="https://www.google.com/maps/search/?api=1&query={{ $bench->latitude }},{{ $bench->longitude }}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                                Open External Map <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            </a>
                        </div>
                    </div>
                @endif
                
                @if($bench->is_tribute)
                    <div class="border-t border-gray-100 pt-6 mt-8 mb-8" x-data="{ expanded: false }">
                        <button @click="expanded = !expanded" class="flex items-center justify-between w-full group">
                            <div class="flex items-center gap-3">
                                <h3 class="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                    In Memory Of
                                </h3>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300" :class="expanded ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </button>
                        
                        <div x-show="expanded" x-collapse style="display: none;">
                            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-4">
                                <p class="text-xl text-gray-900 font-serif italic">{{ $bench->tribute_name }}</p>
                                @if($bench->tribute_date)
                                    <p class="text-gray-500 text-sm mt-1 mb-3">{{ $bench->tribute_date->format('Y') }}</p>
                                @endif
                                @if($bench->tribute_message)
                                    <p class="text-gray-700 font-serif leading-relaxed pt-3 border-t border-gray-200 mt-3">{{ $bench->tribute_message }}</p>
                                @endif
                            </div>
                        </div>
                    </div>
                @endif

                <!-- Collapsible Comments Accordion -->
                <div class="border-t border-gray-100 pt-6 mt-8" x-data="{ expanded: false }">
                    <button @click="expanded = !expanded" class="flex items-center justify-between w-full group">
                        <div class="flex items-center gap-3">
                            <h2 class="text-xl font-bold text-gray-900">Comments <span class="text-gray-400 font-normal">({{ $bench->comments->count() }})</span></h2>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300" :class="expanded ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </button>
                    
                    <div x-show="expanded" x-collapse style="display: none;">
                        <div class="space-y-6 mt-6">
                            @forelse($bench->comments as $comment)
                                <div class="flex gap-4">
                                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0 text-sm">
                                        {{ substr($comment->user_name, 0, 1) }}
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="font-semibold text-gray-900 text-sm">{{ $comment->user_name }}</span>
                                            <span class="text-xs text-gray-400">{{ $comment->created_at->diffForHumans() }}</span>
                                        </div>
                                        <p class="text-gray-600 leading-relaxed text-sm">{{ $comment->comment }}</p>
                                    </div>
                                </div>
                            @empty
                                <p class="text-gray-500 italic text-sm">No comments yet. Be the first to share your thoughts!</p>
                            @endforelse
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

