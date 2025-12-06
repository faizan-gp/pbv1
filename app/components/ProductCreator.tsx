'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useToast } from './Toast';

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
    const { showToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [productName, setProductName] = useState('New Product');
    const [views, setViews] = useState<ViewConfig[]>([
        {
            id: 'front',
            name: 'Front View',
            image: '',
            editorZone: { left: 312, top: 262, width: 400, height: 500 },
            previewZone: { left: 312, top: 262, width: 400, height: 500 },
        }
    ]);
    const [activeViewId, setActiveViewId] = useState('front');
    const [jsonOutput, setJsonOutput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const CANVAS_SIZE = 1024;

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selection: false,
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
        const createZoneRect = (zone: Zone, strokeColor: string, fillColor: string, id: string, label: string) => {
            const rect = new fabric.Rect({
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: 2,
                cornerColor: '#ffffff',
                cornerStrokeColor: strokeColor,
                borderColor: strokeColor,
                cornerSize: 10,
                transparentCorners: false,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                data: { id },
                strokeDashArray: [6, 6],
                borderOpacityWhenMoving: 0.8,
            });

            const text = new fabric.Text(label, {
                left: zone.left,
                top: zone.top - 24,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fill: strokeColor,
                selectable: false,
                evented: false,
                data: { id: `${id}-label` },
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: 4,
            });

            return { rect, text };
        };

        // Editor Zone (Blue)
        const editor = createZoneRect(
            activeView.editorZone,
            '#3b82f6', // blue-500
            'rgba(59, 130, 246, 0.1)',
            'editor-zone',
            'EDITOR ZONE'
        );
        fabricCanvas.add(editor.rect, editor.text);

        // Preview Zone (Green)
        const preview = createZoneRect(
            activeView.previewZone,
            '#22c55e', // green-500
            'rgba(34, 197, 94, 0.1)',
            'preview-zone',
            'PREVIEW ZONE'
        );
        fabricCanvas.add(preview.rect, preview.text);

        // Event Listeners for updating state
        const updateState = () => {
            const editorObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone') as fabric.Rect;
            const previewObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone') as fabric.Rect;
            const editorLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone-label') as fabric.Text;
            const previewLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone-label') as fabric.Text;

            if (editorObj && editorLabel) {
                editorLabel.set({ left: editorObj.left, top: (editorObj.top || 0) - 24 });
            }
            if (previewObj && previewLabel) {
                previewLabel.set({ left: previewObj.left, top: (previewObj.top || 0) - 24 });
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
            colors: [],
            designZone: views[0]?.editorZone,
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
            editorZone: { left: 312, top: 262, width: 400, height: 500 },
            previewZone: { left: 312, top: 262, width: 400, height: 500 },
        }]);
        setActiveViewId(newId);
    };

    const handleSave = async () => {
        if (!productName.trim()) {
            showToast('Please enter a product name', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const payload = JSON.parse(jsonOutput);
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Product saved successfully!', 'success');
                setProductName('');
                setViews([{
                    id: 'front',
                    name: 'Front View',
                    image: '',
                    editorZone: { left: 312, top: 262, width: 400, height: 500 },
                    previewZone: { left: 312, top: 262, width: 400, height: 500 },
                }]);
                setActiveViewId('front');
            } else {
                showToast(data.error || 'Failed to save product', 'error');
            }
        } catch (e) {
            showToast('An error occurred while saving', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const activeView = views.find(v => v.id === activeViewId);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
            {/* Left Sidebar: Controls */}
            <div className="w-full lg:w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col z-20 shadow-xl">
                {/* Sidebar Header */}
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                    <div>
                        <h2 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">Configurator</h2>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">v2.0.0</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    {/* SECTION 1: Details */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global Settings</h3>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-zinc-500">PRODUCT NAME</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g. Heavyweight Tee"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 
                                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-zinc-800/50" />

                    {/* SECTION 2: Views */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Views</h3>
                            </div>
                            <button
                                onClick={addView}
                                className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors flex items-center gap-1"
                            >
                                <span className="text-emerald-500 text-lg leading-none">+</span> New
                            </button>
                        </div>

                        {/* View Tabs */}
                        <div className="grid grid-cols-2 gap-2">
                            {views.map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveViewId(view.id)}
                                    className={`relative px-3 py-2 text-xs font-medium rounded-md text-left transition-all border ${activeViewId === view.id
                                        ? 'bg-zinc-800 border-indigo-500/50 text-indigo-400 ring-1 ring-indigo-500/20'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                        }`}
                                >
                                    <span className="truncate block">{view.name}</span>
                                    {activeViewId === view.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full box-shadow" />}
                                </button>
                            ))}
                        </div>

                        {/* Active View Details */}
                        {activeView && (
                            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg space-y-4 shadow-inner">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-500">VIEW LABEL</label>
                                    <input
                                        type="text"
                                        value={activeView.name}
                                        onChange={(e) => setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, name: e.target.value } : v))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-500">BASE IMAGE</label>
                                    <label className="relative group flex flex-col items-center justify-center w-full h-20 border border-zinc-800 border-dashed rounded cursor-pointer hover:bg-zinc-900 hover:border-zinc-600 transition-all overflow-hidden">
                                        {activeView.image ? (
                                            <>
                                                <img src={activeView.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" alt="preview" />
                                                <div className="relative z-10 flex items-center gap-1.5 text-emerald-500 text-xs font-medium bg-zinc-950/80 px-2 py-1 rounded">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2"><polyline points="20 6 9 17 4 12" /></svg>
                                                    Loaded
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300">Upload PNG/SVG</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-500">CSS TRANSFORM</label>
                                    <input
                                        type="text"
                                        value={activeView.cssTransform || ''}
                                        placeholder="rotate(-2deg)"
                                        onChange={(e) => setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, cssTransform: e.target.value } : v))}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-400 placeholder-zinc-700 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-zinc-800 bg-zinc-900 space-y-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_10px_-2px_rgba(99,102,241,0.5)] active:translate-y-px"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                <span>Save Product</span>
                            </>
                        )}
                    </button>

                    <details className="group">
                        <summary className="text-[10px] uppercase text-zinc-600 cursor-pointer hover:text-zinc-400 list-none flex justify-center items-center gap-1">
                            <span>Raw Data</span>
                        </summary>
                        <div className="absolute left-[340px] bottom-5 w-80 p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50">
                            <h4 className="text-[10px] font-bold text-zinc-500 mb-2 uppercase">Debug Output</h4>
                            <textarea readOnly value={jsonOutput} className="w-full h-40 bg-zinc-950 text-[10px] text-zinc-400 font-mono p-2 rounded border border-zinc-800 resize-none outline-none" />
                        </div>
                    </details>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative bg-[#09090b] flex flex-col items-center justify-center overflow-hidden">

                {/* Canvas Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-zinc-900/90 backdrop-blur border border-zinc-800 px-4 py-2 rounded-full shadow-2xl z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border-2 border-blue-500"></div>
                        <span className="text-xs font-medium text-zinc-400">Editor Zone</span>
                    </div>
                    <div className="w-px h-4 bg-zinc-700"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border-2 border-green-500"></div>
                        <span className="text-xs font-medium text-zinc-400">Preview Zone</span>
                    </div>
                </div>

                {/* Workspace */}
                <div className="relative z-10 p-10 flex items-center justify-center w-full h-full">
                    <div className="transform scale-[0.45] md:scale-[0.55] lg:scale-[0.65] xl:scale-[0.75] transition-transform origin-center">
                        <div className="bg-white rounded-lg shadow-2xl ring-1 ring-zinc-800 overflow-hidden relative" style={{ width: '1024px', height: '1024px' }}>

                            {/* Image Layer */}
                            {activeView?.image ? (
                                <img
                                    src={activeView.image}
                                    alt="Context"
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-90"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 text-zinc-300">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 border-2 border-zinc-200 border-dashed rounded-xl mx-auto flex items-center justify-center">
                                            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-xs font-medium">No Base Image</p>
                                    </div>
                                </div>
                            )}

                            {/* Interactive Canvas */}
                            <div className="absolute inset-0 w-full h-full">
                                <canvas ref={canvasRef} className="w-full h-full" />
                            </div>
                        </div>

                        {/* Size Indicator */}
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-zinc-500 text-xs font-mono tracking-widest uppercase bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                            Canvas: 1024px × 1024px
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
