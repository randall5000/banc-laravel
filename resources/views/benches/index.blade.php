@extends('layouts.app')

@section('content')
    @if($heroBench)
        <!-- Hero Section -->
        <a href="{{ route('benches.show', $heroBench->id) }}" class="block relative h-[450px] w-full overflow-hidden group cursor-pointer">
            <div class="absolute inset-0">
                <img 
                    src="{{ $heroBench->image_url }}" 
                    alt="Featured Bench in {{ $heroBench->location }}"
                    class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
            </div>
            
            <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <div class="max-w-7xl mx-auto">
                    <div class="max-w-2xl animate-fade-in-up">
                        <div class="flex items-center gap-2 mb-4 text-white/90">
                            <span class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium">
                                Featured Bench
                            </span>
                            @if($heroBench->is_tribute)
                            <span class="flex items-center gap-1 text-sm font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                Tribute
                            </span>
                            @endif
                        </div>
                        
                        <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            {{ $heroBench->location }}
                        </h1>
                        
                        <p class="text-xl md:text-2xl text-white/90 mb-8 font-light leading-relaxed">
                            {{ $heroBench->description }}
                        </p>
                        
                        <div class="flex flex-wrap items-center gap-6 text-sm font-medium">
                            <div class="flex items-center gap-2">
                                <span class="w-8 h-[1px] bg-white/60"></span>
                                {{ $heroBench->town ?? $heroBench->province }}, {{ $heroBench->country }}
                            </div>
                            <div class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                {{ $heroBench->likes }} people love this view
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    @endif

    <main class="max-w-7xl mx-auto px-6 py-12">
        <livewire:bench-grid :initialBenches="$heroBench ? null : null" /> 
        {{-- Passing null as we want Livewire to fetch all benches, or we could pass initial if we wanted SSR optimization --}}
    </main>
@endsection
