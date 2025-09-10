<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Car;


class CarController extends Controller
{
    //
    public function index(){
        $cars = Car::with(['make', 'model', 'variant', 'images'])->get();
        return response()->json($cars);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'make_id'     => 'required|exists:makes,id',
            'model_id'    => 'required|exists:models,id',
            'variant_id'  => 'required|exists:variants,id',
            'color'       => 'nullable|string|max:50',
            'year'        => 'required|integer|min:1900|max:' . date('Y'),
            'mileage'     => 'required|integer|min:0',
            'price'       => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'images.*'    => 'nullable|image|max:2048',
        ]);
    
        $validated['user_id'] = Auth::id();
    
        $car = Car::create($validated);
    
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('cars', 'public');
                $car->images()->create(['image_path' => $path]);
            }
        }
    
        return response()->json([
            'message' => 'Car created successfully.',
            'car' => $car->load(['variant.model.make', 'images'])
        ], 201);
    }

    public function show(Car $car)
    {
        $car->load([
            'user:id,name',
            'variant:id,name,model_id',
            'variant.model:id,name,make_id',
            'variant.model.make:id,name',
            'images:id,car_id,image_path'
        ]);

        return response()->json($car);
    }


    public function update(Request $request, Car $car)
    {

        if ($car->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'make_id'     => 'sometimes|exists:makes,id',
            'model_id'    => 'sometimes|exists:models,id',
            'variant_id'  => 'sometimes|exists:variants,id',
            'color'       => 'nullable|string|max:50',
            'year'        => 'sometimes|integer|min:1900|max:' . date('Y'),
            'mileage'     => 'sometimes|integer|min:0',
            'price'       => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'images.*'    => 'nullable|image|max:2048',
        ]);

        $car->update($validated);

        // 如果有新图片，上传并保存
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('cars', 'public');
                $car->images()->create(['image_path' => $path]);
            }
        }

        return response()->json([
            'message' => 'Car updated successfully.',
            'car' => $car->load(['variant.model.make', 'images'])
        ]);
    }

    public function destroy(Car $car)
    {
        if ($car->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        foreach ($car->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $car->delete();

        return response()->json(['message' => 'Car deleted successfully.']);
    }

}
