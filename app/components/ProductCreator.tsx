'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface Zone {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface ViewConfig {
    id: string;
    name: string;
    image: string;
    editorZone: Zone;
    previewZone: Zone;
    displacementMap?: string;
    shadowMap?: string;
    cssTransform?: string;
    editorCutout?: string;
}

export default function ProductCreator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [productName, setProductName] = useState('New Product');
    const [views, setViews] = useState<ViewConfig[]>([
        {
            id: 'front',
            name: 'Front View',
            image: '',
            editorZone: { left: 300, top: 300, width: 400, height: 500 },
            previewZone: { left: 300, top: 300, width: 400, height: 500 },
        }
    ]);
    const [activeViewId, setActiveViewId] = useState('front');
    const [jsonOutput, setJsonOutput] = useState('');

    const CANVAS_SIZE = 1024;

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
        });

        setFabricCanvas(canvas);

        return () => {
            canvas.dispose();
        };
    }, []);

    // Handle Active View Change & Canvas Updates
    useEffect(() => {
        if (!fabricCanvas) return;

        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        fabricCanvas.clear();
        fabricCanvas.backgroundColor = 'transparent';

        // Helper to create zone rects
        const createZoneRect = (zone: Zone, color: string, id: string, label: string) => {
            const rect = new fabric.Rect({
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
                fill: color,
                stroke: color.replace('0.1)', '1)'),
                strokeWidth: 2,
                cornerColor: color.replace('0.1)', '1)'),
                cornerSize: 12,
                transparentCorners: false,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                data: { id },
                strokeDashArray: [5, 5]
            });

            const text = new fabric.Text(label, {
                left: zone.left,
                top: zone.top - 20,
                fontSize: 16,
                fill: color.replace('0.1)', '1)'),
                selectable: false,
                evented: false,
                data: { id: `${id}-label` }
            });

            return { rect, text };
        };

        // Editor Zone (Blue)
        const editor = createZoneRect(activeView.editorZone, 'rgba(0, 100, 255, 0.1)', 'editor-zone', 'Editor Zone');
        fabricCanvas.add(editor.rect, editor.text);

        // Preview Zone (Green)
        const preview = createZoneRect(activeView.previewZone, 'rgba(0, 255, 100, 0.1)', 'preview-zone', 'Preview Zone');
        fabricCanvas.add(preview.rect, preview.text);

        // Event Listeners for updating state
        const updateState = () => {
            const editorObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone') as fabric.Rect;
            const previewObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone') as fabric.Rect;

            // Update labels
            const editorLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone-label') as fabric.Text;
            const previewLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone-label') as fabric.Text;

            if (editorObj && editorLabel) {
                editorLabel.set({ left: editorObj.left, top: (editorObj.top || 0) - 20 });
            }
            if (previewObj && previewLabel) {
                previewLabel.set({ left: previewObj.left, top: (previewObj.top || 0) - 20 });
            }

            if (editorObj && previewObj) {
                setViews(prev => prev.map(v => {
                    if (v.id === activeViewId) {
                        return {
                            ...v,
                            editorZone: {
                                left: Math.round(editorObj.left || 0),
                                top: Math.round(editorObj.top || 0),
                                width: Math.round((editorObj.width || 0) * (editorObj.scaleX || 1)),
                                height: Math.round((editorObj.height || 0) * (editorObj.scaleY || 1)),
                            },
                            previewZone: {
                                left: Math.round(previewObj.left || 0),
                                top: Math.round(previewObj.top || 0),
                                width: Math.round((previewObj.width || 0) * (previewObj.scaleX || 1)),
                                height: Math.round((previewObj.height || 0) * (previewObj.scaleY || 1)),
                            }
                        };
                    }
                    return v;
                }));
            }
        };

        fabricCanvas.on('object:modified', updateState);
        fabricCanvas.on('object:moving', updateState);
        fabricCanvas.on('object:scaling', updateState);

        fabricCanvas.requestRenderAll();

        return () => {
            fabricCanvas.off('object:modified', updateState);
            fabricCanvas.off('object:moving', updateState);
            fabricCanvas.off('object:scaling', updateState);
        };
    }, [fabricCanvas, activeViewId]);

    // Update JSON Output
    useEffect(() => {
        const config = {
            id: productName.toLowerCase().replace(/\s+/g, '-'),
            name: productName,
            image: views[0]?.image || '',
            canvasSize: CANVAS_SIZE,
            colors: [], // Placeholder
            designZone: views[0]?.editorZone, // Fallback
            previews: views.map(v => ({
                id: v.id,
                name: v.name,
                editorZone: v.editorZone,
                previewZone: v.previewZone,
                displacementMap: v.displacementMap,
                shadowMap: v.shadowMap,
                editorCutout: v.editorCutout,
                cssTransform: v.cssTransform
            }))
        };
        setJsonOutput(JSON.stringify(config, null, 4));
    }, [views, productName]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            const result = f.target?.result as string;
            setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, image: result } : v));
        };
        reader.readAsDataURL(file);
    };

    const addView = () => {
        const newId = `view-${views.length + 1}`;
        setViews(prev => [...prev, {
            id: newId,
            name: `View ${views.length + 1}`,
            image: '',
            editorZone: { left: 300, top: 300, width: 400, height: 500 },
            previewZone: { left: 300, top: 300, width: 400, height: 500 },
        }]);
        setActiveViewId(newId);
    };

    const activeView = views.find(v => v.id === activeViewId);

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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">2. Views</h3>
                        <button onClick={addView} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add View</button>
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {views.map(view => (
                            <button
                                key={view.id}
                                onClick={() => setActiveViewId(view.id)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${activeViewId === view.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {view.name}
                            </button>
                        ))}
                    </div>

                    {activeView && (
                        <div className="space-y-4 border-t pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">View Name</label>
                                <input
                                    type="text"
                                    value={activeView.name}
                                    onChange={(e) => setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, name: e.target.value } : v))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CSS Transform</label>
                                <input
                                    type="text"
                                    value={activeView.cssTransform || ''}
                                    placeholder="e.g. rotate(-2deg)"
                                    onChange={(e) => setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, cssTransform: e.target.value } : v))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">3. Output</h3>
                    <textarea
                        readOnly
                        value={jsonOutput}
                        className="w-full h-64 font-mono text-xs p-3 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>

            {/* Right Column: Canvas */}
            <div className="lg:col-span-2">
                <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-200">
                    <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <style jsx global>{`
                            .canvas-container { width: 100% !important; height: 100% !important; }
                            .canvas-container canvas { width: 100% !important; height: 100% !important; }
                        `}</style>
                        {activeView?.image && (
                            <img
                                src={activeView.image}
                                alt="View Base"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                            />
                        )}
                        <div className="absolute inset-0 z-10 w-full h-full">
                            <canvas ref={canvasRef} className="w-full h-full" />
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex gap-6 justify-center text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500/20 border border-blue-500"></div>
                        <span>Editor Zone (Where user places design)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500/20 border border-green-500"></div>
                        <span>Preview Zone (Where design appears on shirt)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
