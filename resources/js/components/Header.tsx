import { dashboard, login, register } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function Header() {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="w-full px-6 py-4 flex justify-end bg-white shadow-sm">
            <nav className="flex items-center gap-4 text-sm">
                {auth.user ? (
                    <>
                        <Link
                            href={dashboard()}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/cars"
                            className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                            Browse Cars
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href={login()}
                            className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100"
                        >
                            Log in
                        </Link>
                        <Link
                            href={register()}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Register
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
