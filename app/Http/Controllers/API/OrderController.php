<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Car;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // List orders for authenticated user
    public function index(Request $request)
    {
        // Eager-load nested relations so frontend gets make/model/variant
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['car.make', 'car.model', 'car.variant', 'car.images'])
            ->get();

        return response()->json($orders);
    }

    // Place a new order
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_id' => 'required|integer|exists:cars,id',
            'total_price' => 'required|numeric',
            'seller_id' => 'nullable|integer',
            // order_items are optional; if not provided we'll default to one item (the car) with qty 1
            'order_items' => 'nullable|array',
            'order_items.*.id' => 'required_with:order_items|integer',
            'order_items.*.qty' => 'required_with:order_items|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()->messages()], 422);
        }

        $car = Car::findOrFail($request->car_id);

        // Normalize payload: use seller_id field (migration and model use seller_id)
        $sellerId = $request->input('seller_id');

        // Default order_items to a single item referencing the car if not provided
        $orderItems = $request->input('order_items');
        if (empty($orderItems) || !is_array($orderItems)) {
            $orderItems = [
                ['id' => $car->id, 'qty' => 1]
            ];
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'car_id' => $car->id,
            'seller_id' => $car->user_id,
            'order_items' => $orderItems,
            'total_price' => $request->total_price,
            'status' => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully.',
            'data' => $order,
        ], 201);
    }

    // Show specific order (must belong to user)
    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not authorized'], 403);
        }

        return response()->json($order->load(['car.make', 'car.model', 'car.variant', 'car.images']));
    }

    // Update order (status updates)
    public function update(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not authorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Pending,Confirmed,Completed,Cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Only allow cancelling if pending, etc. Simple rules here.
        $order->status = $request->status;
        $order->save();

        return response()->json(['success' => true, 'message' => "Order status updated to {$order->status}."]); 
    }

    // Delete order (only if pending)
    public function destroy(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not authorized'], 403);
        }

        if ($order->status !== 'Pending') {
            return response()->json(['message' => 'Only pending orders can be deleted'], 400);
        }

        $order->delete();

        return response()->json(['success' => true, 'message' => 'Order deleted']);
    }

    public function ownerOrders(Request $request)
    {
        $user = $request->user();

        // 查找卖家拥有的车所对应的订单
        $orders = Order::whereHas('car', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['car.make', 'car.model', 'car.variant', 'car.images', 'user']) // user = buyer info
            ->get();

        return response()->json($orders);
    }
}
