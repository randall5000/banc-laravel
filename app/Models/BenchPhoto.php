<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BenchPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'bench_id',
        'photo_url',
        'is_primary',
        'display_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'display_order' => 'integer',
    ];

    public function bench()
    {
        return $this->belongsTo(Bench::class);
    }
}
