<?php

namespace App\Livewire;

use App\Models\Bench;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\Attributes\On;

class BenchGrid extends Component
{
    use WithPagination;

    public $searchQuery = '';
    public $selectedCountry = 'all';
    public $sortBy = 'newest';
    public $userLocation = null; // ['lat' => ..., 'lng' => ...]
    public $suggestions = []; // Auto-suggest results

    protected $queryString = [
        'searchQuery' => ['except' => '', 'as' => 'search'],
        'selectedCountry' => ['except' => 'all', 'as' => 'country'],
        'sortBy' => ['except' => 'newest', 'as' => 'sort'],
    ];

    public function updated($propertyName)
    {
        if (in_array($propertyName, ['searchQuery', 'selectedCountry'])) {
            $this->resetPage();
        }

        if ($propertyName === 'searchQuery') {
            if (strlen($this->searchQuery) > 1) {
                // Fetch suggestions
               $this->suggestions = Bench::where('location', 'like', '%' . $this->searchQuery . '%')
                    ->orWhere('country', 'like', '%' . $this->searchQuery . '%')
                    ->orWhere('town', 'like', '%' . $this->searchQuery . '%')
                    ->orWhere('province', 'like', '%' . $this->searchQuery . '%')
                    ->take(5)
                    ->get();
            } else {
                $this->suggestions = [];
            }
        }
    }

    public function getBenchesProperty()
    {
        $query = Bench::query();

        // Search Filter
        if ($this->searchQuery) {
            $query->where(function ($q) {
                $q->where('location', 'like', '%' . $this->searchQuery . '%')
                  ->orWhere('country', 'like', '%' . $this->searchQuery . '%')
                  ->orWhere('town', 'like', '%' . $this->searchQuery . '%')
                  ->orWhere('province', 'like', '%' . $this->searchQuery . '%');
            });
        }

        // Country Filter
        if ($this->selectedCountry !== 'all') {
            $query->where('country', $this->selectedCountry);
        }

        // Database Sorting (Simple fields)
        switch ($this->sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'most-liked':
                $query->orderBy('likes', 'desc');
                break;
            case 'least-liked':
                $query->orderBy('likes', 'asc');
                break;
            case 'nearest':
                // Handled in PHP below
                break;
            default: // newest
                $query->orderBy('created_at', 'desc');
                break;
        }

        $benches = $query->with(['photos'])->get();

        // PHP-side Sorting for 'nearest' (SQLite-safe)
        if ($this->sortBy === 'nearest' && $this->userLocation) {
            $lat = $this->userLocation['lat'];
            $lng = $this->userLocation['lng'];

            $benches = $benches->map(function ($bench) use ($lat, $lng) {
                // Approximate distance calculation (Haversine)
                if ($bench->latitude && $bench->longitude) {
                    $earthRadius = 6371;
                    $dLat = deg2rad($bench->latitude - $lat);
                    $dLon = deg2rad($bench->longitude - $lng);
                    $a = sin($dLat/2) * sin($dLat/2) +
                         cos(deg2rad($lat)) * cos(deg2rad($bench->latitude)) *
                         sin($dLon/2) * sin($dLon/2);
                    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                    $bench->distance = $earthRadius * $c;
                } else {
                    $bench->distance = 999999;
                }
                return $bench;
            })->sortBy('distance')->values();
        }

        return $benches;
    }

    public function getCountriesProperty()
    {
        return Bench::select('country')->distinct()->orderBy('country')->pluck('country');
    }

    public function render()
    {
        return view('livewire.bench-grid', [
            'benches' => $this->benches,
            'countries' => $this->countries,
        ]);
    }

    #[On('update-user-location')]
    public function setUserLocation($lat, $lng)
    {
        $this->userLocation = ['lat' => $lat, 'lng' => $lng];
        $this->sortBy = 'nearest';
    }
}
