<?php

use App\Http\Controllers\API\CarController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/auth/facebook-login', [AuthController::class, 'facebookLogin']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
});

Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/random', [CarController::class, 'random']);
Route::get('/cars/{car}', [CarController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cars', [CarController::class, 'store']);
    Route::get('/mycars', [CarController::class, 'myCars']);
    Route::put('/cars/{car}', [CarController::class, 'update']);
    Route::delete('/cars/{car}', [CarController::class, 'destroy']);
});