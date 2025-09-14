import { Link, usePage, router } from "@inertiajs/react";
import { type SharedData } from "@/types";
import AppLogoIcon from "@/components/app-logo-icon";
import { login, register } from "@/routes";
import { useState, useEffect, useRef } from "react";
import profile from '@/routes/profile';


export default function Header() {
    const { auth } = usePage<SharedData>().props;
    const currentPath = window.location.pathname;
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => {
        return currentPath === path
            ? "border-indigo-400 text-indigo-600 font-semibold"
            : "border-transparent text-gray-900";
    };

    const logout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post("/logout");
    };

    // 点击外部关闭 dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                {/* 左侧导航 */}
                <nav className="flex items-center gap-6">
                    <Link href="/" className="flex items-center">
                        <AppLogoIcon className="h-9 w-9 text-gray-900" />
                    </Link>

                    <Link
                        href="/cars"
                        className={`flex-1 border-b-2 px-1 py-2 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive("/cars")}`}
                    >
                        Buy Car
                    </Link>

                    {auth.user ? (
                        <Link
                            href="/sell-car"
                            className={`flex-1 border-b-2 px-1 py-2 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive("/cars/sell")}`}
                        >
                            Sell Car
                        </Link>
                    ) : (
                        <Link
                            href={login()}
                            className={`flex-1 border-b-2 px-1 py-2 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive("/login")}`}
                        >
                            Sell Car
                        </Link>
                    )}
                </nav>

                {/* 右侧用户导航 */}
                <div className="flex items-center gap-6 relative">
                    {auth.user ? (
                        <div className="relative" ref={dropdownRef}>
                          <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-1 border-b-2 border-transparent px-1 py-2 text-base font-medium text-gray-900 whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400"
                        >
                            {auth.user.name} ▾
                        </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                                    <Link
                                        href="/my-cars"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        My Cars
                                    </Link>
                                        <Link
                                            href={profile.edit().url}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Account Settings
                                        </Link>
                                    <form onSubmit={logout}>
                                        <button
                                            type="submit"
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Log out
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className={`flex-1 border-b-2 px-1 py-2 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive("/login")}`}
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className={`flex-1 border-b-2 px-1 py-2 text-base font-medium whitespace-nowrap hover:border-indigo-400 hover:text-indigo-400 ${isActive("/register")}`}
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
