'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import ScrollToTop from './ScrollToTop';
import Footer from './Footer';

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isCustomizer = pathname?.startsWith('/customize');

    const showNav = !isAdmin && !isCustomizer;

    return (
        <>
            {showNav && <Navbar />}
            <main className={`flex-1 ${showNav ? 'pt-16' : ''}`}>
                {children}
            </main>
            {showNav && (
                <>
                    <ScrollToTop />
                    <Footer />
                </>
            )}
        </>
    );
}
