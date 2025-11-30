'use client';

import React, { useState } from 'react';
import DesignEditor from './DesignEditor';
import ProductPreview from './ProductPreview';

export default function ShirtConfigurator() {
    const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="order-2 lg:order-1 sticky top-8">
                        <DesignEditor onUpdate={setDesignTextureUrl} />
                    </div>
                    <div className="order-1 lg:order-2 sticky top-8">
                        <ProductPreview designTextureUrl={designTextureUrl} />
                    </div>
                </div>
            </div>
        </div>
    );
}
