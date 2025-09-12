<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Import Log facade
use Illuminate\Support\Facades\Storage; // added Storage facade
use Illuminate\Validation\ValidationException; // Import ValidationException
use App\Models\Car;
use App\Models\Make;
use App\Models\CarModel;
use App\Models\Variant;
use App\Models\CarImage;


class CarController extends Controller
{
    //
    public function index(){
        $cars = Car::with(['make', 'model', 'variant', 'images'])->get();
        return response()->json($cars);
    }

    public function store(Request $request)
    {
        $request->headers->set('Accept', 'application/json');

        try {
            Log::info('Store request headers:', $request->headers->all());
            Log::info('Store request data:', $request->all());
            Log::info('Files:', $request->file('images') ? $request->file('images') : 'No files');

            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Validate input, including title fields
            $validated = $request->validate([
                // accept either IDs (preferred) or titles
                'make_id'        => 'required_without:make_title|exists:makes,id',
                'make_title'     => 'required_without:make_id|string|max:255',
                'model_id'       => 'required_without:model_title|exists:models,id',
                'model_title'    => 'required_without:model_id|string|max:255',
                'variant_id'     => 'required_without:variant_title|exists:variants,id',
                'variant_title'  => 'required_without:variant_id|string|max:255',
                'color'          => 'nullable|string|max:50',
                'year'           => 'required|integer|min:1900|max:' . date('Y'),
                'mileage'        => 'required|integer|min:0',
                'price'          => 'required|numeric|min:0',
                'description'    => 'nullable|string',
                'images.*'       => 'nullable|image|max:2048',
            ]);

            // Handle Make - support either id or title
            $make = null;
            if (!empty($validated['make_id'])) {
                $make = Make::find($validated['make_id']);
            }
            if (!$make && !empty($validated['make_title'])) {
                $make = Make::where('name', $validated['make_title'])->first();
                if (!$make) {
                    $make = Make::create(['name' => $validated['make_title']]);
                }
            }
            if (!$make) {
                throw ValidationException::withMessages(['make' => ['Invalid make specified']]);
            }

            // Handle Model (ensure it belongs to the make) - support id or title
            $model = null;
            if (!empty($validated['model_id'])) {
                $model = CarModel::find($validated['model_id']);
            }
            if (!$model && !empty($validated['model_title'])) {
                $model = CarModel::where('make_id', $make->id)
                                 ->where('name', $validated['model_title'])
                                 ->first();
                if (!$model) {
                    $model = CarModel::create([
                        'make_id' => $make->id,
                        'name' => $validated['model_title']
                    ]);
                }
            }
            if (!$model) {
                throw ValidationException::withMessages(['model' => ['Invalid model specified']]);
            }
            $validated['model_id'] = $model->id;

            // Handle Variant (ensure it belongs to the model) - support id or title
            $variant = null;
            if (!empty($validated['variant_id'])) {
                $variant = Variant::find($validated['variant_id']);
            }
            if (!$variant && !empty($validated['variant_title'])) {
                $variant = Variant::where('model_id', $model->id)
                                  ->where('name', $validated['variant_title'])
                                  ->first();
                if (!$variant) {
                    $variant = Variant::create([
                        'model_id' => $model->id,
                        'name' => $validated['variant_title']
                    ]);
                }
            }
            if (!$variant) {
                throw ValidationException::withMessages(['variant' => ['Invalid variant specified']]);
            }
            $validated['variant_id'] = $variant->id;

            // Create Car
            $validated['user_id'] = Auth::id();
            $car = Car::create([
                'user_id' => $validated['user_id'],
                'make_id' => $make->id,
                'model_id' => $model->id,
                'variant_id' => $variant->id,
                'color' => $validated['color'],
                'year' => $validated['year'],
                'mileage' => $validated['mileage'],
                'price' => $validated['price'],
                'description' => $validated['description'],
            ]);

            // Handle Images
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
        } catch (ValidationException $e) {
            Log::error('Validation error in CarController::store: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in CarController::store: ' . $e->getMessage());
            return response()->json(['message' => 'Server error: ' . $e->getMessage()], 500);
        }
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
