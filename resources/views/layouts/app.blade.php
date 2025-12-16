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
        <header class="fixed top-0 z-50 w-full bg-white border-b border-gray-100" x-data="{ mobileMenuOpen: false }">
            <div class="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
                <a href="{{ route('home') }}" class="flex items-center group z-50 relative">
                    <img src="/images/seeds/banconauts_logo.png" alt="Banconauts" class="h-12 md:h-[140px] w-auto transition-all duration-300">
                </a>
        
                <!-- Desktop Nav -->
                <nav class="hidden md:flex items-center gap-4">
                    <!-- <a href="{{ route('home') }}" class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Discover</a> -->
                    <button 
                        onclick="navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                const lat = pos.coords.latitude;
                                const lng = pos.coords.longitude;
                                if (window.location.pathname === '/') {
                                    Livewire.dispatch('update-user-location', { lat, lng });
                                    const main = document.querySelector('main');
                                    if(main) main.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    window.location.href = '/?lat=' + lat + '&lng=' + lng;
                                }
                            },
                            (err) => alert('Please allow location access to find benches near you.')
                        )"
                        class="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                        Benches near me
                    </button>
                    <a href="{{ route('benches.create') }}" class="text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity" style="background-color: #FF385C;">
                        Add Bench
                    </a>
                </nav>

                <!-- Mobile Menu Button -->
                <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden z-50 relative p-2 text-gray-600">
                    <div class="w-6 h-6 flex flex-col justify-center gap-1.5">
                        <span class="block w-full h-0.5 bg-black transition-all duration-300 transform" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''"></span>
                        <span class="block w-full h-0.5 bg-black transition-all duration-300 opacity-100" :class="mobileMenuOpen ? 'opacity-0' : ''"></span>
                        <span class="block w-full h-0.5 bg-black transition-all duration-300 transform" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"></span>
                    </div>
                </button>

                <!-- Mobile Menu Overlay -->
                <div x-show="mobileMenuOpen" 
                     x-transition:enter="transition ease-out duration-200"
                     x-transition:enter-start="opacity-0 -translate-y-full"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     x-transition:leave="transition ease-in duration-150"
                     x-transition:leave-start="opacity-100 translate-y-0"
                     x-transition:leave-end="opacity-0 -translate-y-full"
                     class="fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 md:hidden overflow-y-auto"
                     style="display: none;">
                    
                    <nav class="flex flex-col gap-6 text-xl font-medium text-gray-900">
                        <!-- <a href="{{ route('home') }}" class="py-2 border-b border-gray-100">Discover</a> -->
                        <button 
                            @click="mobileMenuOpen = false; navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    const lat = pos.coords.latitude;
                                    const lng = pos.coords.longitude;
                                    if (window.location.pathname === '/') {
                                        Livewire.dispatch('update-user-location', { lat, lng });
                                        const main = document.querySelector('main');
                                        if(main) main.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        window.location.href = '/?lat=' + lat + '&lng=' + lng;
                                    }
                                },
                                (err) => alert('Please allow location access to find benches near you.')
                            )"
                            class="text-left py-2 border-b border-gray-100 text-blue-600 font-semibold"
                        >
                            Benches near me
                        </button>
                        <a href="{{ route('benches.create') }}" class="py-2 border-b border-gray-100 text-[#FF385C]">Add Bench</a>
                    </nav>
                </div>
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
