import { dashboard, login, register } from '@/routes';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CarSlider, { Car } from '@/components/CarSlider';



export default function Welcome() {
    const maybeCars = usePage<SharedData>().props.cars as Car[] | undefined;
    const cars: Car[] = maybeCars ?? [];// Ensure cars is always an array

    return (
        <>
            <Head title="XYZ Cars - Used Car Portal">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-gray-50">
                {/* header */}
                <Header />

                {/* main content */}
                <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to XYZ Cars
                    </h1>
                    <p className="text-lg text-gray-600 mb-6 max-w-xl">
                        Buy and sell used cars easily. Register today to post your car for
                        sale, or browse through our wide range of vehicles.
                    </p>
                    <Link
                        href="/cars"
                        className="px-6 py-3 rounded-lg bg-blue-600 text-white text-lg hover:bg-blue-700"
                    >
                        Browse Cars
                    </Link>
                </main>

                {/* car slider */}
                <section className="w-full max-w-6xl mx-auto my-8 px-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Featured Cars
                    </h2>
                    <CarSlider cars={cars} />
                </section>

                {/* footer */}
                <Footer />
            </div>
        </>
    );
}
