<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bench extends Model
{
    use HasFactory;

    protected $fillable = [
        'image_url',
        'location',
        'town',
        'province',
        'country',
        'latitude',
        'longitude',
        'description',
        'is_tribute',
        'tribute_name',
        'tribute_date',
        'likes',
    ];

    protected $casts = [
        'is_tribute' => 'boolean',
        'tribute_date' => 'date',
        'likes' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function photos()
    {
        return $this->hasMany(BenchPhoto::class);
    }

    public function videos()
    {
        return $this->hasMany(BenchVideo::class);
    }

    public function comments()
    {
        return $this->hasMany(BenchComment::class);
    }
}
