
import React from 'react';
import { Product } from '@/lib/firestore/products';

interface ProductDescriptionServerProps {
    product: Product;
}

export default function ProductDescriptionServer({ product }: ProductDescriptionServerProps) {
    const { shortDescription, bulletPoints, fullDescription: description, features } = product;
    return (
        <div className="space-y-12">
            {/* Description Section */}
            {(shortDescription || description) && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Overview</h3>
                    <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 leading-relaxed">
                        {shortDescription && <p className="font-medium text-slate-800">{shortDescription}</p>}
                        {bulletPoints && bulletPoints.length > 0 && (
                            <ul className="space-y-2 mt-4 ml-4 list-disc">
                                {bulletPoints.map((point, i) => (
                                    <li key={i} className="text-sm text-slate-700 leading-relaxed pl-1">
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {description && <p>{description}</p>}
                    </div>
                </div>
            )}

            {/* Features Section */}
            {features && features.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Key Features</h3>
                    <div className="grid gap-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                {feature.image && (
                                    <div className="mb-3 w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <h4 className="font-bold text-slate-900 mb-1.5 text-sm">
                                    {feature.title}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
