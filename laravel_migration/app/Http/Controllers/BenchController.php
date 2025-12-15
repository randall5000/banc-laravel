<?php

namespace App\Http\Controllers;

use App\Models\Bench;
use Illuminate\Http\Request;

class BenchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get the latest bench for the Hero section
        // Logic from page.tsx: const heroBench = benches[0];
        // We can fetch the featured bench separately or let the view handle it.
        // Let's pass the hero bench explicitly.
        
        $heroBench = Bench::with(['photos', 'videos'])
            ->orderBy('likes', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();

        return view('benches.index', compact('heroBench'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Bench $bench)
    {
        $bench->load(['photos', 'videos', 'comments']);
        return view('benches.show', compact('bench'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('benches.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'town' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'description' => 'required|string',
            'photo' => 'required|image|max:10240', // Max 10MB
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $path = $request->file('photo')->store('benches', 'public');

        $bench = Bench::create([
            'location' => $validated['location'],
            'country' => $validated['country'],
            'town' => $validated['town'],
            'province' => $validated['province'],
            'description' => $validated['description'],
            'image_url' => '/storage/' . $path, // We will use the storage link
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'likes' => 0,
            'is_tribute' => false,
        ]);

        return redirect()->route('benches.show', $bench);
    }
}
