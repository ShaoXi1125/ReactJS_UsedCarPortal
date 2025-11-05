<?php

use App\Http\Controllers\API\CarController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;




Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'update']);
});

Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/random', [CarController::class, 'random']);
Route::get('/cars/{car}', [CarController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cars', [CarController::class, 'store']);
    Route::get('/mycars', [CarController::class, 'myCars']);
    Route::put('/cars/{car}', [CarController::class, 'update']);
    Route::delete('/cars/{car}', [CarController::class, 'destroy']);
    // Orders (purchase simulation)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/owner-orders', [OrderController::class, 'ownerOrders']);
    Route::get('/owner-orders/{order}', [OrderController::class, 'showOwnerOrder']);
    // Payment simulation: POST /orders/{order}/pay
    Route::post('/orders/{order}/pay', [OrderController::class, 'pay']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    Route::put('/orders/{order}/complete', [OrderController::class, 'complete']);
});