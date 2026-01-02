'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as fabric from 'fabric';
import {
    Type, Image as ImageIcon, RotateCcw,
    X, Palette, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus, Plus, Move
} from 'lucide-react';
import { Product } from '../data/products';
import { cn } from '@/lib/utils';

export interface DesignEditorRef {
    addText: () => void;
    addImage: (url: string) => void;
}

interface DesignEditorProps {
    onUpdate: (data: { dataUrl: string; jsonState: any }) => void;
    product: Product;
    activeViewId: string;
    initialState?: any;
    hideToolbar?: boolean;
}

const DesignEditorMobile = forwardRef<DesignEditorRef, DesignEditorProps>(({ onUpdate, product, activeViewId, initialState, hideToolbar = false }, ref) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const designZoneRef = useRef<fabric.Rect | null>(null);

    // Editor State
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [textColor, setTextColor] = useState<string>('#333333');
    const [fontFamily, setFontFamily] = useState<string>('Arial');

    // Logic
    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];
    const currentDesignZone = activePreview.editorZone || product.designZone;

    // --- CANVAS INIT ---
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        let isMounted = true;

        // Dispose previous instance carefully
        if (fabricCanvas) {
            try { fabricCanvas.dispose(); } catch (e) { console.warn("Canvas dispose error", e); }
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            selection: false,
            allowTouchScrolling: true,
        });

        // Mobile-friendly Touch Handles
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#4f46e5',
            borderColor: '#4f46e5',
            cornerSize: 14,
            padding: 15,
            cornerStyle: 'circle',
            borderDashArray: [5, 5],
            touchCornerSize: 30,
        });

        const initOverlays = () => {
            if (!isMounted) return;
            const designZone = new fabric.Rect({
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height,
                fill: 'transparent', stroke: 'rgba(79, 70, 229, 0.4)',
                strokeWidth: 2, strokeDashArray: [10, 5],
                selectable: false, evented: false, excludeFromExport: true,
            });
            canvas.add(designZone);
            designZoneRef.current = designZone;

            // Re-order to top
            canvas.moveObjectTo(designZone, 999);

            const clipPath = new fabric.Rect({
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height,
                absolutePositioned: true,
            });
            canvas.clipPath = clipPath;
        };

        const setupEvents = () => {
            if (!isMounted) return;

            // Events
            const handleUpdate = () => {
                if (!designZoneRef.current) return;
                designZoneRef.current.set('visible', false);

                const jsonState = (canvas as any).toJSON(['id', 'gradient', 'selectable']);
                const dataUrl = canvas.toDataURL({
                    format: 'png', multiplier: 1,
                    left: currentDesignZone.left, top: currentDesignZone.top,
                    width: currentDesignZone.width, height: currentDesignZone.height
                });

                designZoneRef.current.set('visible', true);
                if (isMounted) onUpdate({ dataUrl, jsonState });
            };

            const handleSelection = (e: any) => {
                const selected = e.selected?.[0];
                if (isMounted) setSelectedObject(selected || null);
                if (selected && selected instanceof fabric.IText) {
                    setTextColor(selected.fill as string);
                    setFontFamily(selected.fontFamily || 'Arial');
                }
            };

            canvas.on('object:modified', handleUpdate);
            canvas.on('object:added', handleUpdate);
            canvas.on('object:removed', handleUpdate);
            canvas.on('selection:created', handleSelection);
            canvas.on('selection:updated', handleSelection);
            canvas.on('selection:cleared', () => isMounted && setSelectedObject(null));
        };

        const initializeCanvas = async () => {
            // 1. Load State first (without listeners)
            if (initialState) {
                try {
                    await canvas.loadFromJSON(initialState);
                } catch (e) {
                    console.error("Error loading JSON", e);
                }
            }

            if (!isMounted) return;

            // 2. Setup Overlays
            initOverlays();

            // 3. Attach Listeners (ONLY after loading)
            setupEvents();

            // 4. Initial Render
            canvas.requestRenderAll();
        };

        initializeCanvas();
        setFabricCanvas(canvas);

        // Resize Logic
        const resizeCanvas = () => {
            if (!containerRef.current || !isMounted) return;
            const width = containerRef.current.clientWidth;
            const scale = width / product.canvasSize;
            canvas.setDimensions({ width: width, height: width });
            canvas.setZoom(scale);
            canvas.requestRenderAll();
        };

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(containerRef.current);

        return () => {
            isMounted = false;
            resizeObserver.disconnect();
            try { canvas.dispose(); } catch (e) { console.warn("Dispose error", e); }
        };
    }, [onUpdate, product, activeViewId]);

    // --- METHODS ---
    useImperativeHandle(ref, () => ({
        addText: () => {
            if (!fabricCanvas) return;
            const text = new fabric.IText('TEXT', {
                left: currentDesignZone.left + currentDesignZone.width / 2,
                top: currentDesignZone.top + currentDesignZone.height / 2,
                originX: 'center', originY: 'center',
                fontFamily: 'Arial', fill: '#1e293b', fontSize: currentDesignZone.width * 0.15, fontWeight: 'bold',
            });
            fabricCanvas.add(text);
            fabricCanvas.setActiveObject(text);
            fabricCanvas.fire('object:added');
        },
        addImage: (url: string) => {
            if (!fabricCanvas) return;
            fabric.Image.fromURL(url, {}, { crossOrigin: 'anonymous' }).then((img) => {
                img.scaleToWidth(currentDesignZone.width * 0.6);
                img.set({
                    left: currentDesignZone.left + currentDesignZone.width / 2,
                    top: currentDesignZone.top + currentDesignZone.height / 2,
                    originX: 'center', originY: 'center'
                });
                fabricCanvas.add(img);
                fabricCanvas.setActiveObject(img);
                fabricCanvas.fire('object:added');
            });
        }
    }));

    // --- Helpers ---
    const updateObject = (key: string, value: any) => {
        if (!fabricCanvas || !selectedObject) return;
        if (key === 'fill') setTextColor(value);
        if (key === 'fontFamily') setFontFamily(value);
        selectedObject.set(key as any, value);
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    const nudge = (dx: number, dy: number) => {
        if (!selectedObject) return;
        selectedObject.set({ left: (selectedObject.left || 0) + dx, top: (selectedObject.top || 0) + dy });
        selectedObject.setCoords();
        fabricCanvas?.requestRenderAll();
        fabricCanvas?.fire('object:modified');
    };

    return (
        <div className="flex flex-col w-full h-full relative bg-slate-50 overflow-hidden">

            {/* CANVAS CONTAINER */}
            <div className="flex-1 relative w-full flex items-center justify-center p-4">
                <div ref={containerRef} className="w-full relative shadow-xl rounded-lg overflow-hidden bg-white">
                    {/* Base Image */}
                    <img
                        src={activePreview.editorCutout || product.image}
                        alt="Product"
                        className="w-full h-auto pointer-events-none select-none z-0 relative"
                    />
                    {/* Canvas Overlay */}
                    <div className="absolute inset-0 z-10">
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>

            {/* SPACER for fixed toolbar */}
            <div className="h-20" />

            {/* --- PROPERTIES DRAWER (Only shows when selected) --- */}
            <div className={cn(
                "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col max-h-[60vh]",
                selectedObject ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Drag Handle */}
                <div className="w-full h-6 flex items-center justify-center shrink-0" onClick={() => setSelectedObject(null)}>
                    <div className="w-12 h-1 bg-slate-200 rounded-full" />
                </div>

                <div className="overflow-y-auto px-6 pb-8">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold uppercase text-slate-400">
                            {selectedObject instanceof fabric.IText ? 'Edit Text' : 'Edit Image'}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => { fabricCanvas?.remove(selectedObject!); fabricCanvas?.discardActiveObject(); }} className="p-2 bg-red-50 text-red-500 rounded-full">
                                <Trash2 size={18} />
                            </button>
                            <button onClick={() => fabricCanvas?.discardActiveObject()} className="p-2 bg-slate-100 text-slate-500 rounded-full">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Controls Grid */}
                    <div className="space-y-6">
                        {selectedObject instanceof fabric.IText && (
                            <>
                                <input
                                    type="text"
                                    value={(selectedObject as fabric.IText).text}
                                    onChange={(e) => updateObject('text', e.target.value)}
                                    className="w-full px-4 py-3 text-lg font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                                />
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Color</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                        {['#1e293b', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#7c3aed'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => updateObject('fill', c)}
                                                className={cn("w-10 h-10 rounded-full border border-slate-200 flex-shrink-0", textColor === c ? "ring-2 ring-indigo-500 scale-110" : "")}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Nudge Pad */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-bold uppercase text-slate-400 mb-3 text-center">Fine Tune Position</div>
                            <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                                <div />
                                <button onClick={() => nudge(0, -2)} className="h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center active:bg-indigo-50"><ArrowUp size={16} /></button>
                                <div />
                                <button onClick={() => nudge(-2, 0)} className="h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center active:bg-indigo-50"><ArrowLeft size={16} /></button>
                                <div className="flex items-center justify-center text-slate-300"><Move size={12} /></div>
                                <button onClick={() => nudge(2, 0)} className="h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center active:bg-indigo-50"><ArrowRight size={16} /></button>
                                <div />
                                <button onClick={() => nudge(0, 2)} className="h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center active:bg-indigo-50"><ArrowDown size={16} /></button>
                                <div />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

DesignEditorMobile.displayName = 'DesignEditorMobile';
export default DesignEditorMobile;