'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface DesignEditorProps {
    onUpdate: (dataUrl: string) => void;
}

import { products } from '../data/products';

// ... inside component ...
export default function DesignEditor({ onUpdate }: DesignEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const designZoneRef = useRef<fabric.Rect | null>(null);

    // Use the first product for now
    const product = products[0];

    useEffect(() => {
        if (!canvasRef.current) return;

        // 1. Initialize Canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
        });

        // 2. Add the "Print Area" Guide
        const designZone = new fabric.Rect({
            left: product.designZone.left,
            top: product.designZone.top,
            width: product.designZone.width,
            height: product.designZone.height,
            fill: 'transparent',
            stroke: '#3b82f6', // Blue for better visibility
            strokeWidth: 2,
            strokeDashArray: [10, 5],
            selectable: false,
            evented: false,
        });

        // Create a clip path that matches the design zone
        // We don't set it on the canvas globally anymore to avoid hiding the guide
        // Instead we apply it to individual objects

        canvas.add(designZone);
        designZoneRef.current = designZone;
        setFabricCanvas(canvas);

        // 3. Handle Updates
        const handleUpdate = () => {
            if (!designZoneRef.current) return;

            // 1. Hide guidelines
            designZoneRef.current.set('visible', false);

            // 2. Export at High Resolution (Multiplier is key!)
            const dataUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 3,
                quality: 1
            });

            // 3. Show guidelines
            designZoneRef.current.set('visible', true);

            onUpdate(dataUrl);
        };

        canvas.on('object:modified', handleUpdate);
        canvas.on('object:added', handleUpdate);
        canvas.on('object:removed', handleUpdate);

        return () => {
            canvas.dispose();
        };
    }, [onUpdate, product]);

    const createClipPath = () => {
        return new fabric.Rect({
            left: product.designZone.left,
            top: product.designZone.top,
            width: product.designZone.width,
            height: product.designZone.height,
            absolutePositioned: true,
        });
    };

    const addText = () => {
        if (!fabricCanvas) return;
        // Center in design zone
        const centerX = product.designZone.left + product.designZone.width / 2;
        const centerY = product.designZone.top + product.designZone.height / 2;

        const text = new fabric.IText('Design Here', {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arial',
            fill: '#333',
            fontSize: 60,
            fontWeight: 'bold',
            clipPath: createClipPath(),
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
        // Trigger manual update
        fabricCanvas.fire('object:added');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!fabricCanvas || !e.target.files?.[0]) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            const imgObj = new Image();
            imgObj.src = f.target?.result as string;
            imgObj.onload = () => {
                const imgInstance = new fabric.Image(imgObj);
                // Scale image to reasonable size
                imgInstance.scaleToWidth(200);

                // Center in design zone
                const centerX = product.designZone.left + product.designZone.width / 2;
                const centerY = product.designZone.top + product.designZone.height / 2;

                imgInstance.set({
                    left: centerX,
                    top: centerY,
                    originX: 'center',
                    originY: 'center',
                    clipPath: createClipPath(),
                });
                fabricCanvas.add(imgInstance);
                fabricCanvas.setActiveObject(imgInstance);
                fabricCanvas.renderAll();
                fabricCanvas.fire('object:added');
            };
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 h-full">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Design Editor</h3>
                <button
                    onClick={() => {
                        fabricCanvas?.getObjects().forEach((o) => {
                            if (o !== designZoneRef.current) fabricCanvas.remove(o);
                        });
                        fabricCanvas?.renderAll();
                        // Trigger update with empty canvas
                        const dataUrl = fabricCanvas?.toDataURL({
                            format: 'png',
                            multiplier: 1
                        }) || '';
                        onUpdate(dataUrl);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Editor Container */}
            <div className="relative w-full aspect-square border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50 flex justify-center items-center bg-[url('/grid.png')]">
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
                <img
                    src={product.image}
                    alt="Product Base"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                />
                <canvas ref={canvasRef} className="w-full h-full relative z-10" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={addText}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <span className="text-lg">T</span>
                    <span className="font-medium">Add Text</span>
                </button>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="font-medium">Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
            </div>
        </div>
    );
}