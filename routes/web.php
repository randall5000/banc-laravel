<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BenchController;

Route::get('/', [BenchController::class, 'index'])->name('home');
Route::get('/benches/create', [BenchController::class, 'create'])->name('benches.create');
Route::post('/benches', [BenchController::class, 'store'])->name('benches.store');
Route::get('/benches/{bench}', [BenchController::class, 'show'])->name('benches.show');
