import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import Footer from '@/components/Footer';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
                                <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-9 fill-current text-gray-900" />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-medium text-gray-900">{title}</h1>
                                <p className="text-center text-sm text-gray-700">{description}</p>
                            </div>
                        </div>

                        {/* Page content */}
                        {children}
                    </div>
                </div>
            </div>

            {/* Dark footer at the bottom */}
            <Footer />
        </div>
    );
}
