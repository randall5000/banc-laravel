<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Banconaut') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            // Add custom colors here if needed to match global.css
                        }
                    }
                }
            }
        </script>
        @livewireStyles
    </head>
    <body class="font-sans antialiased text-gray-900 bg-white">
        <!-- Header -->
        <header class="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <a href="{{ route('home') }}" class="flex items-center gap-2 group">
                    <div class="bg-black text-white p-2 rounded-lg group-hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M5 12v6a1 1 0 0 0 1 1h2"/><path d="M18 12v6a1 1 0 0 1-1 1h-2"/><path d="M12 12v7"/></svg>
                    </div>
                    <span class="font-bold text-xl tracking-tight">Banconaut</span>
                </a>
        
                <nav class="hidden md:flex items-center gap-8">
                    <a href="{{ route('home') }}" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Discover</a>
                    <!-- For "See Benches Near Me", we can link to home with a query param or just home for now until we have a specific route/filter logic -->
                    <button onclick="document.querySelector('[wire\\:click=\'setUserLocation\']')?.click() ?? alert('Please allow location access on the grid below')" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">See Benches Near Me</button>
                    <a href="{{ route('benches.create') }}" class="text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity" style="background-color: #FF385C;">
                        Add Bench
                    </a>
                </nav>
            </div>
        </header>

        <div class="min-h-screen pt-16">
            @yield('content')
        </div>

        <footer class="bg-gray-50 border-t border-gray-200 mt-16">
            <div class="max-w-7xl mx-auto px-6 py-12">
                <div class="text-center text-sm text-gray-600">© {{ date('Y') }} Banconaut. Find your perfect bench.</div>
            </div>
        </footer>

        @livewireScripts
    </body>
</html>
