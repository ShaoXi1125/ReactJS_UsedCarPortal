<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

class ProviderController extends Controller
{
    public function redirectToGithub()
    {
        return Socialite::driver('github')->redirect();
    }

    public function handleGithubCallback(Request $request)
    {
        try {
            $githubUser = Socialite::driver('github')->user();

            // 先尝试用 email 找用户（避免 Duplicate entry）
            $user = User::where('email', $githubUser->getEmail())->first();

            if (!$user) {
                // 如果没有用户，则创建新用户
                $user = User::create([
                    'github_id' => $githubUser->getId(),
                    'email' => $githubUser->getEmail() ?? $githubUser->getId().'@github.local',
                    'name' => $githubUser->getName() ?? $githubUser->getNickname(),
                    'github_token' => $githubUser->token,
                    'password' => bcrypt(str()->random(24)), // 占位密码
                ]);
            } else {
                // 如果已有用户（用 email 登录过），更新 GitHub 信息
                $user->update([
                    'github_id' => $githubUser->getId(),
                    'github_token' => $githubUser->token,
                ]);
            }

            Auth::login($user);

            return redirect()->intended('/dashboard');

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            return redirect('/login')->with('error', 'OAuth state invalid. Try again.');
        } catch (\Exception $e) {
            \Log::error('GitHub OAuth error: '.$e->getMessage());
            return redirect('/login')->with('error', 'GitHub login failed.');
        }
    }
}
