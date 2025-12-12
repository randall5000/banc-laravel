<?php

namespace App\Livewire;

use App\Models\Bench;
use Livewire\Component;
use Livewire\WithPagination;

class BenchGrid extends Component
{
    use WithPagination;

    public $searchQuery = '';
    public $selectedCountry = 'all';
    public $sortBy = 'newest';
    public $userLocation = null; // ['lat' => ..., 'lng' => ...]

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
                  ->orWhere('province', 'like', '%' . $this->searchQuery . '%')
                  ->orWhereRaw("CONCAT_WS(', ', town, province, country) LIKE ?", ['%' . $this->searchQuery . '%']);
            });
        }

        // Country Filter
        if ($this->selectedCountry !== 'all') {
            $query->where('country', $this->selectedCountry);
        }

        // Sorting
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
                // complex sorting typically done in DB if feasible, or collection info
                // verifying if userLocation is available
                if ($this->userLocation) {
                    $lat = $this->userLocation['lat'];
                    $lng = $this->userLocation['lng'];
                     $query->selectRaw(
                        '*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance', 
                        [$lat, $lng, $lat]
                    )->orderBy('distance');
                } else {
                     $query->orderBy('created_at', 'desc');
                }
                break;
            default: // newest
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->with(['photos'])->get(); 
        // Note: In real app, standard pagination ->paginate(12) creates a LengthAwarePaginator.
        // If sorting by calculated distance, standard pagination needs a DB view or raw query.
        // For simplicity here, fetching all ->get() to mimic the client-side React behavior for now, 
        // or we could stick to pagination if the list is huge.
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

    public function setUserLocation($lat, $lng)
    {
        $this->userLocation = ['lat' => $lat, 'lng' => $lng];
        $this->sortBy = 'nearest';
    }
}
