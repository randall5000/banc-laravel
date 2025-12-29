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
        // Get the most liked bench for the Hero section
        $heroBench = Bench::orderBy('likes', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();

        return view('benches.index', compact('heroBench'));
    }

    /**
     * Display a listing of the resource for API.
     */
    public function apiIndex()
    {
        return response()->json(Bench::with('photos')->latest()->get());
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
        return redirect('/upload');
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
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240', // Max 10MB per file
            'user_name' => 'nullable|string|max:255', // Allow attribution
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_tribute' => 'nullable|boolean',
            'tribute_name' => 'nullable|string|max:255',
            'tribute_date' => 'nullable|date',
            'tribute_message' => 'nullable|string',
        ]);

        $mainImageUrl = null;
        
        // Create the bench first (we'll update image_url after processing first photo)
        $bench = Bench::create([
            'location' => $validated['location'],
            'country' => $validated['country'],
            'town' => $validated['town'],
            'province' => $validated['province'],
            'description' => $validated['description'],
            'image_url' => '', // Placeholder
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'likes' => 0,
            'is_tribute' => $request->has('is_tribute'),
            'tribute_name' => $validated['tribute_name'] ?? null,
            'tribute_date' => $validated['tribute_date'] ?? null,
            'tribute_message' => $validated['tribute_message'] ?? null,
        ]);

        $uploadUser = $validated['user_name'] ?? 'Anonymous';

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('benches', 'public');
                $fullUrl = '/storage/' . $path;

                // First photo becomes the main cover image
                if ($index === 0) {
                    $bench->update(['image_url' => $fullUrl]);
                }

                $bench->photos()->create([
                    'photo_url' => $fullUrl,
                    'user_name' => $uploadUser, // Attribute the upload
                    'is_primary' => $index === 0,
                    'display_order' => $index,
                ]);
            }
        }

        return redirect()->route('benches.show', $bench);
    }


    /**
     * Like a bench.
     */
    public function like(Request $request, Bench $bench)
    {
        $sessionId = $request->session()->getId();
        $likedKey = 'liked_bench_' . $bench->id;

        if ($request->session()->has($likedKey)) {
            return response()->json([
                'likes' => $bench->likes,
                'liked' => true,
                'message' => 'You already liked this bench.'
            ]);
        }

        $bench->increment('likes');
        $request->session()->put($likedKey, true);

        return response()->json([
            'likes' => $bench->fresh()->likes,
            'liked' => true
        ]);
    }
}
