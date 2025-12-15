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
        Schema::table('benches', function (Blueprint $table) {
            $table->text('tribute_message')->nullable()->after('tribute_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('benches', function (Blueprint $table) {
            $table->dropColumn('tribute_message');
        });
    }
};
