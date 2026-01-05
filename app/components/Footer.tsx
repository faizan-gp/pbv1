export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 py-16 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                    <p className="text-sm font-medium text-gray-900">
                        © {new Date().getFullYear()} PrintBrawl
                    </p>
                    <p className="text-xs text-gray-500">
                        Premium Custom Apparel
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <a href="/about" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        About
                    </a>
                    <a href="/faq" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        FAQ
                    </a>
                    <a href="/contact" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Contact
                    </a>
                    <a href="/site-map" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                        Sitemap
                    </a>
                </div>
            </div>
        </footer>
    );
}
