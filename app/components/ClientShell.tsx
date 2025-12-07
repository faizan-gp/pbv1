'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <>
            {!isAdmin && <Navbar />}
            <main className={`flex-1 ${!isAdmin ? 'pt-16' : ''}`}>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
