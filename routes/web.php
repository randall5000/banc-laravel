<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BenchController;

// Debug Route: If this is hit, it means the Proxy rule in .htaccess failed or was ignored.
Route::get('/upload', function () {
    return 'DEBUG: Hit Laravel /upload route. Proxy to Next.js failed. Web Root is correct.';
});

Route::get('/', [BenchController::class, 'index'])->name('home');
Route::redirect('/benches/create', '/upload')->name('benches.create');
Route::post('/benches', [BenchController::class, 'store'])->name('benches.store');
Route::get('/benches/{bench}', [BenchController::class, 'show'])->name('benches.show');
