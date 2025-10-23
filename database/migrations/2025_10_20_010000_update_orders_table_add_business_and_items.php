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
        Schema::table('orders', function (Blueprint $table) {
            // If you have a businesses table, change the foreignId accordingly. For now make it nullable.
            $table->unsignedBigInteger('seller_id')->nullable()->after('user_id');
            $table->json('order_items')->nullable()->after('seller_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['seller_id', 'order_items']);
        });
    }
};
