'use client';

import React, { useState } from 'react';
import DesignEditor from './DesignEditor';
import ProductPreview from './ProductPreview';
import { products } from '../data/products';

export default function ShirtConfigurator() {
    const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState(products[0]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                        Custom T-Shirt Designer
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Create your unique style with our advanced 3D configurator. Drag, drop, and visualize in real-time.
                    </p>
                </div>

                <div className="flex flex-col gap-12">
                    <div className="w-full">
                        <DesignEditor onUpdate={setDesignTextureUrl} product={selectedProduct} />
                    </div>

                    <div className="w-full max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">3D Preview</h3>
                            </div>
                            <div className="p-8 bg-gray-50">
                                <ProductPreview designTextureUrl={designTextureUrl} product={selectedProduct} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
