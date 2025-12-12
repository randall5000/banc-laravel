<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BenchVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'bench_id',
        'video_url',
        'thumbnail_url',
    ];

    public function bench()
    {
        return $this->belongsTo(Bench::class);
    }
}
