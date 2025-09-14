<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Car;
use App\Models\Make;
use App\Models\CarModel;
use App\Models\Variant;
use App\Models\CarImage;

class CarController extends Controller
{
    public function index(Request $request)
    {
        $query = Car::with(['variant.model.make', 'images']);

        // 全局 searchText 搜索
        if ($request->searchText) {
            $query->where(function($q) use ($request) {
                $q->whereHas('variant.model.make', fn($q) => 
                    $q->where('name', 'like', '%'.$request->searchText.'%')
                )
                ->orWhereHas('variant.model', fn($q) => 
                    $q->where('name', 'like', '%'.$request->searchText.'%')
                )
                ->orWhere('year', 'like', '%'.$request->searchText.'%');
            });
        }

        // 品牌
        if ($request->make) {
            $query->whereHas('variant.model.make', function($q) use ($request) {
                $q->where('id', $request->make)
                ->orWhere('name', 'like', '%'.$request->make.'%');
            });
        }

        // 型号
        if ($request->model) {
            $query->whereHas('variant.model', function($q) use ($request) {
                $q->where('id', $request->model)
                ->orWhere('name', 'like', '%'.$request->model.'%');
            });
        }

        // 年份（转 int）
        if ($request->year) {
            $query->where('year', intval($request->year));
        }

        // 价格区间（转 int）
        if ($request->minPrice && $request->maxPrice) {
            $query->whereBetween('price', [
                intval($request->minPrice),
                intval($request->maxPrice)
            ]);
        }

        return response()->json($query->get());
    }

    public function random(){
        $cars = Car::with(['make', 'model', 'variant', 'images'])
        ->inRandomOrder()
        ->take(8)    
        ->get();

        return response()->json($cars);

    }

    public function myCars(Request $request)
    {
        $user = $request->user(); 

        $query = Car::with(['variant.model.make', 'images'])
            ->where('user_id', $user->id);

        $cars = $query->get();

        return response()->json($cars);
    }

    public function store(Request $request)
    {
        // 设置正确的响应头
        $request->headers->set('Accept', 'application/json');
        
        try {
            // 检查认证
            if (!Auth::check()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // 验证输入
            $validated = $request->validate([
                'make_id'       => 'nullable|string',
                'make_title'    => 'nullable|string|max:255',
                'model_id'      => 'nullable|string',
                'model_title'   => 'nullable|string|max:255',
                'variant_id'    => 'nullable|string',
                'variant_title' => 'nullable|string|max:255',
                'color'         => 'nullable|string|max:50',
                'year'          => 'required|string',
                'mileage'       => 'required|string',
                'price'         => 'required|string',
                'description'   => 'nullable|string',
                'images.*'      => 'nullable|image|max:2048',
            ]);

            // 处理 Make
            $make = null;
            if (!empty($validated['make_id'])) {
                $make = Make::find((int)$validated['make_id']);
            }
            if (!$make && !empty($validated['make_title'])) {
                $make = Make::firstOrCreate(['name' => $validated['make_title']]);
            }
            if (!$make) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['make' => ['Make is required or make_id not found']]
                ], 422);
            }

            // 处理 Model
            $model = null;
            if (!empty($validated['model_id'])) {
                $model = CarModel::find((int)$validated['model_id']);
            }
            if (!$model && !empty($validated['model_title'])) {
                $model = CarModel::firstOrCreate([
                    'make_id' => $make->id, 
                    'name' => $validated['model_title']
                ]);
            }
            if (!$model) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['model' => ['Model is required or model_id not found']]
                ], 422);
            }

            // 处理 Variant
            $variant = null;
            if (!empty($validated['variant_id'])) {
                $variant = Variant::find((int)$validated['variant_id']);
            }
            if (!$variant && !empty($validated['variant_title'])) {
                $variant = Variant::firstOrCreate([
                    'model_id' => $model->id, 
                    'name' => $validated['variant_title']
                ]);
            }
            if (!$variant) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['variant' => ['Variant is required or variant_id not found']]
                ], 422);
            }

            // 验证年份、里程和价格范围
            $year = (int)$validated['year'];
            $mileage = (int)$validated['mileage'];
            $price = (float)$validated['price'];

            if ($year < 1900 || $year > (date('Y') + 1)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['year' => ['Year must be between 1900 and ' . (date('Y') + 1)]]
                ], 422);
            }

            if ($mileage < 0) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['mileage' => ['Mileage cannot be negative']]
                ], 422);
            }

            if ($price <= 0) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ['price' => ['Price must be greater than 0']]
                ], 422);
            }

            // 创建汽车记录
            $car = Car::create([
                'user_id' => Auth::id(),
                'make_id' => $make->id,
                'model_id' => $model->id,
                'variant_id' => $variant->id,
                'color' => $validated['color'] ?? null,
                'year' => $year,
                'mileage' => $mileage,
                'price' => $price,
                'description' => $validated['description'] ?? null,
            ]);

            // 处理图片上传
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    if ($image->isValid()) {
                        $path = $image->store('cars', 'public');
                        $car->images()->create(['image_path' => $path]);
                    }
                }
            }

            // 返回成功响应
            return response()->json([
                'message' => 'Car created successfully.',
                'car' => $car->load(['make', 'model', 'variant', 'images'])
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error occurred',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show(Car $car)
    {
        $car->load([
            'user:id,name',
            'make:id,name',
            'model:id,name',
            'variant:id,name',
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
            'make_id'        => 'nullable|integer',
            'make_title'     => 'nullable|string|max:255',
            'model_id'       => 'nullable|integer',
            'model_title'    => 'nullable|string|max:255',
            'variant_id'     => 'nullable|integer',
            'variant_title'  => 'nullable|string|max:255',
            'color'          => 'nullable|string|max:50',
            'year'           => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'mileage'        => 'sometimes|integer|min:0',
            'price'          => 'sometimes|numeric|min:0',
            'description'    => 'nullable|string',
            'images.*'       => 'nullable|image|max:2048',
        ]);

        // 🔹 处理 Make
        $make = null;
        if (!empty($validated['make_id'])) {
            $make = Make::find((int)$validated['make_id']);
        }
        if (!$make && !empty($validated['make_title'])) {
            $make = Make::firstOrCreate(['name' => $validated['make_title']]);
        }
        if (!$make) {
            return response()->json(['errors' => ['make' => ['Make is required']]], 422);
        }

        // 🔹 处理 Model
        $model = null;
        if (!empty($validated['model_id'])) {
            $model = CarModel::find((int)$validated['model_id']);
        }
        if (!$model && !empty($validated['model_title'])) {
            $model = CarModel::firstOrCreate([
                'make_id' => $make->id,
                'name' => $validated['model_title'],
            ]);
        }
        if (!$model) {
            return response()->json(['errors' => ['model' => ['Model is required']]], 422);
        }

        // 🔹 处理 Variant
        $variant = null;
        if (!empty($validated['variant_id'])) {
            $variant = Variant::find((int)$validated['variant_id']);
        }
        if (!$variant && !empty($validated['variant_title'])) {
            $variant = Variant::firstOrCreate([
                'model_id' => $model->id,
                'name' => $validated['variant_title'],
            ]);
        }
        if (!$variant) {
            return response()->json(['errors' => ['variant' => ['Variant is required']]], 422);
        }

        // 🔹 更新 Car
        $car->update([
            'make_id'     => $make->id,
            'model_id'    => $model->id,
            'variant_id'  => $variant->id,
            'color'       => $validated['color'] ?? $car->color,
            'year'        => $validated['year'] ?? $car->year,
            'mileage'     => $validated['mileage'] ?? $car->mileage,
            'price'       => $validated['price'] ?? $car->price,
            'description' => $validated['description'] ?? $car->description,
        ]);

        // 🔹 删除旧图
        $existing = $request->input('existing_images', []);
        $car->images()->whereNotIn('id', $existing)->get()->each(function ($img) {
            \Storage::disk('public')->delete($img->image_path);
            $img->delete();
        });

        // 🔹 新图
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                if ($image->isValid()) {
                    $path = $image->store('cars', 'public');
                    $car->images()->create(['image_path' => $path]);
                }
            }
        }

        return response()->json([
            'message' => 'Car updated successfully.',
            'car' => $car->load(['make', 'model', 'variant', 'images'])
        ]);
    }




    public function destroy(Car $car)
    {
        if ($car->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 删除图片文件和记录
        foreach ($car->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $car->delete();

        return response()->json(['message' => 'Car deleted successfully.']);
    }
}