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
        Schema::table('cars', function (Blueprint $table) {
            $table->string('status')->default('AVAILABLE')->after('description');
        });

        // 更新现有记录：根据是否有未完成的订单来设置状态
        DB::statement("
            UPDATE cars
            LEFT JOIN orders ON cars.id = orders.car_id AND orders.status IN ('Pending', 'Confirmed')
            SET cars.status = CASE
                WHEN orders.id IS NOT NULL AND orders.status = 'Pending' THEN 'RESERVED'
                WHEN orders.id IS NOT NULL AND orders.status = 'Confirmed' THEN 'SOLD'
                ELSE 'AVAILABLE'
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
