<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BenchController;

Route::get('/', [BenchController::class, 'index'])->name('home');
Route::get('/benches/{bench}', [BenchController::class, 'show'])->name('benches.show');
Route::post('/benches', [BenchController::class, 'store'])->name('benches.store');
