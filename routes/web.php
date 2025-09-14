<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CarController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('welcome');
    })->name('dashboard');

    Route::get('/account/settings', function () {
        return Inertia::render('Account/Settings');
    });

    Route::get('/sell-car', [CarController::class, 'create'])->name('cars.create');

    Route::get('/my-cars', [CarController::class, 'myCar'])->name('myCar');
    Route::get('/cars/{carId}/edit', [CarController::class, 'EditMyCar'])->name('EditCar');
});



Route::get('/cars', [CarController::class, 'index'])->name('cars.index');
Route::get('/CarDetail',[CarController::class,'CarDetail'])->name('cars.detail');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
