<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Car;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

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

        // 检查车辆是否已被预订
        if ($car->status !== Car::STATUS_AVAILABLE) {
            return response()->json([
                'success' => false,
                'message' => 'This car is no longer available.',
            ], 400);
        }

        \DB::transaction(function () use ($request, $car, $orderItems, &$order) {
            // 创建订单
            $order = Order::create([
                'user_id' => $request->user()->id,
                'car_id' => $car->id,
                'seller_id' => $car->user_id,
                'order_items' => $orderItems,
                'total_price' => $request->total_price,
                'status' => 'Pending',
            ]);

            // 更新汽车状态为已预订
            $car->update(['status' => Car::STATUS_RESERVED]);
        });

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

        \DB::transaction(function () use ($request, $order) {
            $oldStatus = $order->status;
            $newStatus = $request->status;
            
            // 更新订单状态
            $order->status = $newStatus;
            $order->save();

            // 根据订单状态更新汽车状态
            $car = $order->car;
            
            if ($newStatus === 'Cancelled' && $oldStatus === 'Pending') {
                // 如果订单从Pending变为Cancelled，将车辆状态改回Available
                $car->update(['status' => Car::STATUS_AVAILABLE]);
            }
        });

        return response()->json(['success' => true, 'message' => "Order status updated to {$request->status}."]);
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

    public function showOwnerOrder(Request $request, Order $order)
    {
        $user = $request->user();

        // ✅ 验证该订单是否属于当前登录用户的车
        if ($order->car->user_id !== $user->id) {
            return response()->json(['message' => 'Not authorized to view this order.'], 403);
        }

        // ✅ 返回详细信息，包含买家资料
        return response()->json(
            $order->load(['car.make', 'car.model', 'car.variant', 'car.images', 'user'])
        );
    }

    // 支付订单
    public function pay(Request $request, Order $order)
     {
        // 1️⃣ 验证订单属于当前登录用户
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not authorized to pay for this order.'], 403);
        }

        // 2️⃣ 检查订单状态，防止重复支付
        if (in_array($order->status, ['Completed', 'Cancelled'])) {
            return response()->json([
                'message' => 'This order has already been processed or cancelled.'
            ], 400);
        }

        // 3️⃣ 模拟支付（前端传入 simulateResult）
        $result = $request->input('result'); // 可为 success 或 fail
        if ($result === 'fail') {
            return response()->json(['message' => 'Simulated payment failure.'], 400);
        }

        // 4️⃣ 模拟计算押金金额（例如总价的 10%）
        $deposit = round($order->total_price * 0.1, 2);

        // 5️⃣ 数据库事务：更新订单和车辆状态
        \DB::transaction(function () use ($order) {
            $order->update(['status' => 'Confirmed']);
            $order->car->update(['status' => \App\Models\Car::STATUS_RESERVED]);
        });

        // 6️⃣ 返回成功响应
        return response()->json([
            'message' => 'Payment successful',
            'deposit' => $deposit,
            'order_id' => $order->id,
            'status' => 'Confirmed'
        ]);
    }

    public function complete(Request $request, Order $order)
    {
        // 1️⃣ 验证：是否为车主本人
        if ($order->car->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not authorized'], 403);
        }

        // 2️⃣ 只能在已确认状态（Confirmed）后完成
        if ($order->status !== 'Confirmed') {
            return response()->json(['message' => 'Order must be confirmed before completing.'], 400);
        }

        // 3️⃣ 更新状态
        \DB::transaction(function () use ($order) {
            $order->update(['status' => 'Completed']);
            $order->car->update(['status' => \App\Models\Car::STATUS_SOLD]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Order marked as completed and car set to Sold.'
        ]);
    }

}
