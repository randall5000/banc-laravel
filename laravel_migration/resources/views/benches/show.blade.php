<x-app-layout>
    <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="mb-6">
            <a href="{{ route('home') }}" class="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                Back to benches
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Image Gallery -->
            <div class="space-y-4">
                <div class="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <img 
                        src="{{ $bench->image_url }}" 
                        alt="{{ $bench->location }}" 
                        class="w-full h-full object-cover"
                    />
                </div>
                
                @if($bench->photos->count() > 0)
                    <div class="grid grid-cols-4 gap-4">
                        @foreach($bench->photos as $photo)
                            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                <img src="{{ $photo->photo_url }}" class="w-full h-full object-cover" />
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>

            <!-- Details -->
            <div>
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            @if($bench->is_tribute)
                                <span class="bg-black text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                    Tribute
                                </span>
                            @endif
                            <span class="text-gray-500 text-sm font-medium">{{ $bench->created_at->format('F j, Y') }}</span>
                        </div>
                        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ $bench->location }}</h1>
                        <div class="flex items-center gap-2 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {{ $bench->town ?? $bench->province ?? '' }}, {{ $bench->country }}
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-center gap-1">
                         <button class="flex flex-col items-center gap-1 group">
                            <div class="p-3 rounded-full bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            </div>
                            <span class="font-bold text-gray-900">{{ $bench->likes }}</span>
                        </button>
                    </div>
                </div>

                <div class="prose prose-lg text-gray-600 mb-8">
                    {{ $bench->description }}
                </div>

                @if($bench->is_tribute)
                    <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                        <h3 class="font-semibold text-gray-900 mb-2">In Memory Of</h3>
                        <p class="text-lg text-gray-800 font-medium">{{ $bench->tribute_name }}</p>
                        @if($bench->tribute_date)
                            <p class="text-gray-500 text-sm mt-1">{{ $bench->tribute_date->format('Y') }}</p>
                        @endif
                    </div>
                @endif
                
                @if($bench->latitude && $bench->longitude)
                    <div class="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
                        <strong>Coordinates:</strong> {{ $bench->latitude }}, {{ $bench->longitude }}
                        <br/>
                        <a href="https://www.google.com/maps/search/?api=1&query={{ $bench->latitude }},{{ $bench->longitude }}" target="_blank" class="underline hover:text-blue-900 mt-1 inline-block">
                            View on Google Maps &rarr;
                        </a>
                    </div>
                @endif

                <!-- Comments Section -->
                <div class="border-t border-gray-100 pt-8 mt-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Comments ({{ $bench->comments->count() }})</h2>
                    
                    <div class="space-y-6">
                        @forelse($bench->comments as $comment)
                            <div class="flex gap-4">
                                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                                    {{ substr($comment->user_name, 0, 1) }}
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="font-semibold text-gray-900">{{ $comment->user_name }}</span>
                                        <span class="text-xs text-gray-400">{{ $comment->created_at->diffForHumans() }}</span>
                                    </div>
                                    <p class="text-gray-600 leading-relaxed">{{ $comment->comment }}</p>
                                </div>
                            </div>
                        @empty
                            <p class="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
