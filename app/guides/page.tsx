
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function GuidesIndexPage() {
    const guides = getAllGuides();

    return (
        <div className="grid gap-8">
            {guides.map((guide) => (
                <article key={guide.slug} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-slate-100 flex items-center justify-center p-8">
                        {/* Placeholder for guide image */}
                        <BookOpen className="w-12 h-12 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                            Guide &bull; {guide.date}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                            <Link href={`/guides/${guide.slug}`}>
                                <span className="absolute inset-0" />
                                {guide.title}
                            </Link>
                        </h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            {guide.excerpt}
                        </p>
                        <div className="flex items-center text-sm font-bold text-slate-900 mt-auto">
                            Read Article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
