import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from "react";
import axios from "axios";
import FacebookLogin from '@/components/FacebookLogin';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    setErrorMsg("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      // 保存 token
      localStorage.setItem("token", res.data.token);

      console.log("Login success:", res.data.user);
      window.location.href = "/dashboard"; // 登录后跳转
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMsg("Invalid credentials");
      } else {
        setErrorMsg("Login failed, please try again.");
      }
      console.error("Login error:", err.response?.data || err);
    } finally {
      setProcessing(false);
    }
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://127.0.0.1:8000/api/auth/facebook/redirect";
  };

  return (
    <AuthLayout
      title="Log in to your account"
      description="Enter your email and password below to log in"
    >
      <Head title="Log in" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-800">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="email@example.com"
              className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
            />
            <InputError message={errors.email} />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-gray-800">
                Password
              </Label>
              {canResetPassword && (
                <TextLink
                  href={request()}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </TextLink>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Password"
              className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
            />
            <InputError message={errors.password} />
          </div>

          {/* Remember */}
          <div className="flex items-center space-x-3">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember" className="text-gray-700">
              Remember me
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={processing}
          >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Log in
          </Button>
          
         
          
        </div>
        </form>
         <FacebookLogin />
        {/* Register link */}
        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <TextLink
            href={register()}
            className="text-blue-600 hover:text-blue-700"
          >
            Sign up
          </TextLink>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="text-center text-sm text-red-600 mt-2">
            {errorMsg}
          </div>
        )}
      

      {/* Status message */}
      {status && (
        <div className="mb-4 text-center text-sm font-medium text-green-600">
          {status}
        </div>
      )}
    </AuthLayout>
  );
}
