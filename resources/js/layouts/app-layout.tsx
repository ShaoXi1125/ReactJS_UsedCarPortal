// resources/js/layouts/AppLayout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen bg-white text-gray-900 flex-col">
            
            <Header />

            <main className="flex-1">
                {children}
            </main>

         
            <Footer />
        </div>
    );
}
