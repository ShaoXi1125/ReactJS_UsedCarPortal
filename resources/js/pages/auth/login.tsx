import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                 {...AuthenticatedSessionController.store.form()}
                 resetOnSuccess={['password']}
                 className="flex flex-col gap-6"
                 onSuccess={(page) => {
                    console.log("Login response:", page.props); // Debug
                    if (page.props.token) {
                        console.log("Token received:", page.props.token); // Debug
                        localStorage.setItem('token', String(page.props.token));
                    } else {
                        console.error("No token received from login response");
                    }
                }}
                
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-gray-800">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
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
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember */}
                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="text-gray-700">
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        {/* Register link */}
                        <div className="text-center text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <TextLink
                                href={register()}
                                className="text-blue-600 hover:text-blue-700"
                                tabIndex={5}
                            >
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {/* Status message */}
            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
        
    );
}
