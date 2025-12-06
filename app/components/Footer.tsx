export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-zinc-950 py-16 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                    <p className="text-sm font-medium text-white">
                        © {new Date().getFullYear()} PrintBrawl
                    </p>
                    <p className="text-xs text-gray-400">
                        Premium Custom Apparel
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <a href="#" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        Terms
                    </a>
                    <a href="#" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        Privacy
                    </a>
                    <a href="#" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    );
}
