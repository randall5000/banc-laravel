<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BenchController;

// Internal Proxy Diagnostic: Test if Next.js is running
Route::get('/upload', function () {
    try {
        $response = \Illuminate\Support\Facades\Http::get('http://127.0.0.1:3000/upload');
        if ($response->successful()) {
             // We return the raw HTML just to prove connection. Assets will be broken.
             return $response->body();
        }
        return 'Next.js returned status: ' . $response->status();
    } catch (\Exception $e) {
        return 'Next.js App Unreachable on Port 3000. Error: ' . $e->getMessage();
    }
});

Route::get('/', [BenchController::class, 'index'])->name('home');
Route::redirect('/benches/create', '/upload')->name('benches.create');
Route::post('/benches', [BenchController::class, 'store'])->name('benches.store');
Route::get('/benches/{bench}', [BenchController::class, 'show'])->name('benches.show');
