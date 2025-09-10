<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Car;

class CarController extends Controller
{
    //
    public function index(){
        $cars = Car::with(['variant.model.make', 'images'])->get();
        return Inertia::render('CarPage', [
            'cars' => $cars,
        ]);
    }
}
