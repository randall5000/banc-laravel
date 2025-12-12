<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BenchComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'bench_id',
        'user_name',
        'comment',
    ];

    public function bench()
    {
        return $this->belongsTo(Bench::class);
    }
}
