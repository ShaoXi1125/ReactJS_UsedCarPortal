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

    public function create(){
        return Inertia::render('SellCarPage');
    }

    public function myCar(){
        return Inertia::render('myCarPage');
    }

    public function CarDetail(){
        return Inertia::render("CarDetailPage");
    }

   
    public function EditMyCar($carId)
    {
        $car = Car::with('variant.model.make', 'images')->findOrFail($carId);

        return Inertia::render('EditCarPage', [
            'car' => $car
        ]);
    }
}
