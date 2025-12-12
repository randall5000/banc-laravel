<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('benches', function (Blueprint $table) {
            $table->id();
            $table->string('image_url'); // Main image
            $table->string('location'); // Specific location name
            $table->string('town')->nullable();
            $table->string('province')->nullable();
            $table->string('country');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_tribute')->default(false);
            $table->string('tribute_name')->nullable();
            $table->date('tribute_date')->nullable();
            $table->integer('likes')->default(0);
            $table->timestamps();
        });

        Schema::create('bench_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bench_id')->constrained()->onDelete('cascade');
            $table->string('photo_url');
            $table->boolean('is_primary')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('bench_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bench_id')->constrained()->onDelete('cascade');
            $table->string('video_url');
            $table->string('thumbnail_url')->nullable();
            $table->timestamps();
        });

        Schema::create('bench_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bench_id')->constrained()->onDelete('cascade');
            $table->string('user_name');
            $table->text('comment');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bench_comments');
        Schema::dropIfExists('bench_videos');
        Schema::dropIfExists('bench_photos');
        Schema::dropIfExists('benches');
    }
};
