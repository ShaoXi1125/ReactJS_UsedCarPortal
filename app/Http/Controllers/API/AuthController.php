<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{

   public function facebookLogin(Request $request)
    {
        $accessToken = $request->input('access_token');

        // 向 Facebook Graph API 请求用户信息
        $fbResponse = Http::get("https://graph.facebook.com/me", [
            'fields' => 'id,name,email',
            'access_token' => $accessToken,
        ]);

        if ($fbResponse->failed()) {
            return response()->json(['error' => 'Invalid Facebook token'], 401);
        }

        $fbUser = $fbResponse->json();

        // 根据 email 查找或创建用户
        $user = User::updateOrCreate(
            ['email' => $fbUser['email'] ?? $fbUser['id'].'@facebook.com'],
            ['name' => $fbUser['name']]
        );

        // 登录（如果你用 sanctum / passport，返回 token）
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Facebook login success',
            'user' => $user,
            'token' => $token
        ]);
    }

    // Simplified GitHub OAuth handling when frontend provides GitHub user data or access token
    public function githubLogin(Request $request)
    {
        // Accept either access_token or raw user data
        $githubUser = null;

        if ($request->has('access_token')) {
            $resp = Http::withHeaders(['Accept' => 'application/json'])
                ->get('https://api.github.com/user', [
                    'access_token' => $request->input('access_token'),
                ]);

            if ($resp->failed()) {
                return response()->json(['error' => 'Invalid GitHub token'], 401);
            }

            $githubUser = $resp->json();
        } else {
            $githubUser = $request->input('github_user');
        }

        if (empty($githubUser) || empty($githubUser['id'])) {
            return response()->json(['error' => 'GitHub user data required'], 422);
        }

        $user = User::firstOrCreate(
            ['github_id' => $githubUser['id']],
            [
                'name' => $githubUser['name'] ?? $githubUser['login'] ?? 'GitHub User',
                'email' => $githubUser['email'] ?? null,
                'avatar_url' => $githubUser['avatar_url'] ?? null,
                'role' => 'user',
            ]
        );

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'GitHub login success',
            'user' => $user,
            'token' => $token
        ]);
    }
    
    //
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!auth()->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = auth()->user();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // Update authenticated user profile
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->only(['name', 'phone', 'address', 'avatar_url']);

        $user->fill($data);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user->only(['id','name','phone','address','avatar_url']),
        ]);
    }
}
