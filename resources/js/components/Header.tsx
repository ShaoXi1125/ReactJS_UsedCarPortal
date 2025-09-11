import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import { login, register } from '@/routes';

export default function Header() {
    const { auth, component } = usePage<SharedData>().props;

    // 调试：查看当前组件名称
    console.log('Current component:', component);

    // 判断当前页面
    const isActive = (routeName: string) => {
        const active = component === routeName;
        console.log(`Route: ${routeName}, Component: ${component}, Active: ${active}`);
        return active ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-gray-900';
    };

    return (
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* 左侧导航 */}
                <nav className="flex items-center gap-4">
                    <Link href="/" className="flex items-center">
                        <AppLogoIcon className="h-9 w-9 text-gray-900" />
                    </Link>
                    <Link
                        href="/cars"
                        className={`flex-1 px-1 py-4 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive('Cars/Index')}`}
                    >
                        Buy Car
                    </Link>
                    {auth.user ? (
                        <Link
                            href="/cars/sell"
                            className={`flex-1 px-1 py-4 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive('Cars/Sell')}`}
                        >
                            Sell Car
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            className={`flex-1 px-1 py-4 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive('Auth/Login')}`}
                        >
                            Sell Car
                        </Link>
                    )}
                </nav>
                {/* 右侧用户导航 */}
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className={`flex-1 px-1 py-4 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive('Dashboard')}`}
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className={`flex-1 px-1 py-4 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive('Auth/Login')}`}
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className={`flex-1 px-1 py-4 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive('Auth/Register')}`}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}