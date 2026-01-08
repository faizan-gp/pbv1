
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: "Print Brawl Guides & Resources",
        template: "%s | Print Brawl Guides"
    },
    description: "Expert tips, tutorials, and inspiration for custom apparel design and print-on-demand.",
    openGraph: {
        type: 'website',
        title: "Print Brawl Guides",
        description: "Expert tips, tutorials, and inspiration for custom apparel design.",
    }
};

export default function GuidesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-900 py-16 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Resource Hub</h1>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto px-4">
                    Master the art of custom apparel. Design tips, business guides, and inspiration for your next project.
                </p>
            </div>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {children}
            </main>
        </div>
    );
}
