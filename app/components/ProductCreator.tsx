'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

export default function ProductCreator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [productName, setProductName] = useState('New Product');
    const [jsonOutput, setJsonOutput] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const productNameRef = useRef(productName);

    // Update ref when state changes
    useEffect(() => {
        productNameRef.current = productName;
        // Trigger update if canvas exists
        if (fabricCanvas) {
            fabricCanvas.fire('object:modified');
        }
    }, [productName, fabricCanvas]);

    // Default canvas size
    const CANVAS_SIZE = 1024;

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
        });

        setFabricCanvas(canvas);

        // Update JSON on object modification
        const updateJson = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const zone = canvas.getObjects().find(o => (o as any).data?.id === 'design-zone');
            if (zone) {
                const rect = zone as fabric.Rect;
                const currentName = productNameRef.current;
                const config = {
                    id: currentName.toLowerCase().replace(/\s+/g, '-'),
                    name: currentName,
                    image: '/path/to/your/image.svg', // Placeholder will be updated by user manually usually
                    canvasSize: CANVAS_SIZE,
                    designZone: {
                        left: Math.round(rect.left || 0),
                        top: Math.round(rect.top || 0),
                        width: Math.round((rect.width || 0) * (rect.scaleX || 1)),
                        height: Math.round((rect.height || 0) * (rect.scaleY || 1)),
                    }
                };
                setJsonOutput(JSON.stringify(config, null, 4));
            }
        };

        canvas.on('object:modified', updateJson);
        canvas.on('object:moving', updateJson);
        canvas.on('object:scaling', updateJson);

        return () => {
            canvas.dispose();
        };
    }, []); // Empty dependency array to run only once!


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!fabricCanvas || !e.target.files?.[0]) return;

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (f) => {
            const result = f.target?.result as string;
            setImageSrc(result);
            setImageLoaded(true);

            // Clear existing
            fabricCanvas.clear();
            fabricCanvas.backgroundColor = 'transparent';
            fabricCanvas.requestRenderAll();

            // Add Default Design Zone Rect
            const zone = new fabric.Rect({
                left: 300,
                top: 300,
                width: 400,
                height: 500,
                fill: 'rgba(0, 100, 255, 0.2)',
                stroke: '#0064ff',
                strokeWidth: 2,
                cornerColor: '#0064ff',
                cornerSize: 12,
                transparentCorners: false,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                data: { id: 'design-zone' }
            });

            fabricCanvas.add(zone);
            fabricCanvas.setActiveObject(zone);

            // Recalculate offset to ensure pointer events map correctly
            fabricCanvas.calcOffset();
            fabricCanvas.requestRenderAll();

            // Trigger JSON update
            fabricCanvas.fire('object:modified');
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">1. Product Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload the shirt/product image.</p>
                        </div>
                    </div>
                </div>

                {imageLoaded && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">3. Configuration JSON</h3>
                        <p className="text-sm text-gray-600 mb-2">Copy this into <code>app/data/products.ts</code></p>
                        <textarea
                            readOnly
                            value={jsonOutput}
                            className="w-full h-64 font-mono text-xs p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(jsonOutput)}
                            className="mt-2 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column: Canvas */}
            <div className="lg:col-span-2">
                <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-200">
                    <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <style jsx global>{`
                            .canvas-container {
                                width: 100% !important;
                                height: 100% !important;
                            }
                            .canvas-container canvas {
                                width: 100% !important;
                                height: 100% !important;
                            }
                        `}</style>
                        {/* Background Shirt Image */}
                        {imageSrc && (
                            <img
                                src={imageSrc}
                                alt="Product Base"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                            />
                        )}
                        <div className="absolute inset-0 z-10 w-full h-full">
                            <canvas ref={canvasRef} className="w-full h-full" />
                        </div>
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                                <p>Upload an image to start</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>Drag and resize the blue box to define the printable area.</p>
                </div>
            </div>
        </div>
    );
}
