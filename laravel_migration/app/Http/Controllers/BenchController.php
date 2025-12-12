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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validation and storage logic would go here
        // Simulating the upload endpoint
    }
}
