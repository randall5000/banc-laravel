<div x-data="{ showFilters: false }">
    @if($heroBench && $sortBy !== 'nearest')
        <!-- Hero Section -->
        <a href="{{ route('benches.show', $heroBench->id) }}" class="block relative h-[450px] w-full overflow-hidden group cursor-pointer mb-8">
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
    <div class="flex flex-col lg:flex-row items-start gap-6">
        <!-- Sidebar Filters -->
        <div class="w-full lg:w-1/4 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm sticky top-20 z-40 transition-all">
            
            <!-- Mobile Toggle Header -->
            <button @click="showFilters = !showFilters" class="w-full flex items-center justify-between p-4 lg:hidden">
                <div class="flex items-center gap-2 font-semibold text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                    Filters & Search
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200" :class="showFilters ? 'rotate-180' : ''"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <!-- Filter Content (Collapsible on Mobile, Visible on Desktop) -->
            <div class="lg:!block lg:!h-auto lg:!overflow-visible p-6 border-t lg:border-t-0 border-gray-100" x-show="showFilters" x-collapse>
                <div class="hidden lg:flex items-center justify-between mb-6">
                    <h3 class="font-semibold text-gray-900">Filters</h3>
                </div>

                <!-- Search -->
                <div class="mb-6 relative z-50">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div class="relative">
                        <input 
                            type="text" 
                            wire:model.live.debounce.300ms="searchQuery" 
                            placeholder="Search locations..." 
                            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            autocomplete="off"
                        >
                        <svg class="absolute left-3 top-2.5 text-gray-400 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <!-- Autosuggest Dropdown -->
                    @if(!empty($suggestions))
                        <div class="absolute w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-2 overflow-hidden max-h-64 overflow-y-auto">
                            @foreach($suggestions as $suggestion)
                                <a href="{{ route('benches.show', $suggestion->id) }}" class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-100">
                                    <div class="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                         <img src="{{ $suggestion->image_url }}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/100?text=Bench'">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-semibold text-gray-900 truncate">{{ $suggestion->location }}</p>
                                        <p class="text-xs text-gray-500 truncate">{{ $suggestion->town ?? $suggestion->province }}, {{ $suggestion->country }}</p>
                                    </div>
                                </a>
                            @endforeach
                        </div>
                    @endif
                </div>

                <!-- Sort -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select 
                        wire:model.live="sortBy" 
                        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    >
                        <option value="newest">Newest Added</option>
                        <option value="oldest">Oldest Added</option>
                        <option value="most-liked">Most Liked</option>
                        <option value="least-liked">Least Liked</option>
                        <option value="nearest">Nearest to Me</option>
                    </select>
                </div>

                <!-- Country Filter -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select 
                        wire:model.live="selectedCountry" 
                        class="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    >
                        <option value="all">All Countries</option>
                        @foreach($countries as $country)
                            <option value="{{ $country }}">{{ $country }}</option>
                        @endforeach
                    </select>
                </div>
                
                <!-- Location Button (JS needed to get coords) -->
                <button 
                    onclick="navigator.geolocation.getCurrentPosition(
                        (pos) => @this.setUserLocation(pos.coords.latitude, pos.coords.longitude),
                        (err) => alert('Could not get location')
                    )"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Find Nearest Benches
                </button>
            </div>
        </div>

        <!-- Main Grid -->
        <div class="flex-1">
            @if($this->userLocation && $sortBy === 'nearest')
                <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-sm text-blue-900">📍 Showing results sorted by distance from your location</p>
                </div>
            @endif

            <p class="text-sm text-gray-600 mb-4">Showing {{ $benches->count() }} {{ Str::plural('bench', $benches->count()) }}</p>

            @if($benches->isEmpty())
                <div class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p class="text-gray-500 text-lg">No benches found matching criteria.</p>
                    <p class="text-gray-400 text-sm mt-2">Try a different search term or clear your filters.</p>
                </div>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($benches as $bench)
                        <a href="{{ route('benches.show', $bench->id) }}" class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 block cursor-pointer">
                            <!-- Image -->
                            <div class="aspect-[4/3] overflow-hidden relative bg-gray-100">
                                <img 
                                    src="{{ $bench->image_url }}" 
                                    alt="{{ $bench->location }}" 
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                @if($bench->is_tribute)
                                    <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                        Tribute
                                    </div>
                                @endif
                            </div>

                            <!-- Content -->
                            <div class="p-4">
                                <div class="flex items-start justify-between mb-2">
                                    <h3 class="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {{ $bench->location }}
                                    </h3>
                                    <div class="flex items-center gap-1 text-gray-600 text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 fill-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                        {{ $bench->likes }}
                                    </div>
                                </div>
                                <div class="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {{ $bench->town ?? $bench->province ?? '' }}, {{ $bench->country }}
                                </div>
                                
                                @if(isset($bench->distance))
                                    <div class="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="12"/></svg>
                                        {{ number_format($bench->distance, 1) }} km away
                                    </div>
                                @endif
                            </div>
                        </a>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</div>
