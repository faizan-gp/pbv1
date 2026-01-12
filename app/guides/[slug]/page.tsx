
import { notFound } from 'next/navigation';
import { getGuideBySlug, getAllGuides } from '@/lib/guides';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const guides = getAllGuides();
    return guides.map((guide) => ({
        slug: guide.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        return {
            title: 'Guide Not Found',
        };
    }

    return {
        title: `${guide.title} | Print Brawl Guides`,
        description: guide.excerpt,
        openGraph: {
            title: guide.title,
            description: guide.excerpt,
            type: 'article',
            publishedTime: guide.date,
            authors: [guide.author],
        }
    };
}

import ArticleSchema from '@/app/components/seo/ArticleSchema';

export default async function GuidePage({ params }: PageProps) {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        notFound();
    }

    return (
        <article className="max-w-3xl mx-auto">
            <ArticleSchema guide={guide} />
            <Link href="/guides" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to All Guides
            </Link>

            <header className="mb-12 text-center md:text-left">
                <div className="text-sm font-bold text-indigo-600 mb-4 uppercase tracking-wider">
                    {guide.date} &bull; {guide.author}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    {guide.title}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                    {guide.excerpt}
                </p>
            </header>

            <div className="prose prose-lg prose-slate max-w-none">
                {/* 
                  Note: In a real app we might use a robust markdown renderer or dangerous HTML.
                  Since content is trusted (internal), we can use a simple whitespace preserve or markdown component.
                  For simplicity right now, I'll assume valid markdown and use a basic render 
                  or just generic pre-wrap if 'react-markdown' isn't available. 
                  Given the environment, I'll try to emulate simple markdown via a helper or just plain text if needed.
                  Actually, I'll just use a whitespace-pre-wrap div for now to be safe without deps.
                */}
                <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                    {/* Basic Markdown-like rendering helper */}
                    {/* Basic Markdown-like rendering helper */}
                    {(() => {
                        const lines = guide.content.split('\n');
                        const elements = [];
                        let listBuffer: React.ReactNode[] = [];

                        lines.forEach((line, i) => {
                            const trimmed = line.trim();
                            if (trimmed.startsWith('* ')) {
                                listBuffer.push(
                                    <li key={`li-${i}`} className="ml-4 list-disc mb-2 marker:text-indigo-500">{line.replace('* ', '')}</li>
                                );
                            } else {
                                if (listBuffer.length > 0) {
                                    elements.push(<ul key={`ul-${i}`} className="my-4 space-y-2">{listBuffer}</ul>);
                                    listBuffer = [];
                                }

                                if (trimmed.startsWith('### ')) {
                                    elements.push(<h3 key={i} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{trimmed.replace('### ', '')}</h3>);
                                } else if (trimmed.startsWith('## ')) {
                                    elements.push(<h2 key={i} className="text-3xl font-bold text-slate-900 mt-12 mb-6 pb-2 border-b border-slate-100">{trimmed.replace('## ', '')}</h2>);
                                } else if (trimmed.trim() === '') {
                                    elements.push(<br key={`br-${i}`} />);
                                } else {
                                    elements.push(<p key={i} className="mb-4">{line}</p>);
                                }
                            }
                        });

                        if (listBuffer.length > 0) {
                            elements.push(<ul key="ul-end" className="my-4 space-y-2">{listBuffer}</ul>);
                        }

                        return elements;
                    })()}
                </div>
            </div>

            {/* Internal Linking / Related Categories */}
            {guide.relatedCategories && (
                <div className="mt-16 pt-8 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Related Collections</h3>
                    <div className="flex flex-wrap gap-4">
                        {guide.relatedCategories.map(catSlug => (
                            <Link
                                key={catSlug}
                                href={`/categories/${catSlug}`}
                                className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-full font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                            >
                                Shop {catSlug.replace('-', ' ')}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
