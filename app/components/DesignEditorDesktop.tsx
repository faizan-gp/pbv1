'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import {
    Type, Image as ImageIcon, RotateCcw,
    Save, Loader2, X, Palette, Trash2,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus, Plus, Move,
    Type as TypeIcon, Maximize2, ChevronDown
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface DesignEditorProps {
    onUpdate: (dataUrl: string) => void;
    product: any;
    activeViewId: string;
}

export default function DesignEditorDesktop({ onUpdate, product, activeViewId }: DesignEditorProps) {
    const { data: session } = useSession();

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null); // The responsive container

    // State
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [scale, setScale] = useState(1); // CSS Scale factor

    // Design State
    const [textColor, setTextColor] = useState<string>('#333333');
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [saving, setSaving] = useState(false);

    // Derived Data
    const activePreview = product.previews.find((p: any) => p.id === activeViewId) || product.previews[0];
    const currentDesignZone = activePreview.editorZone || product.designZone;

    // --- 1. RESPONSIVE SCALING LOGIC ---
    useEffect(() => {
        const handleResize = () => {
            if (!wrapperRef.current) return;

            // Available space in the container
            const availableWidth = wrapperRef.current.clientWidth;
            const availableHeight = wrapperRef.current.clientHeight;

            // Desired 'padding' around the shirt (15% breathing room)
            const padding = 0.85;

            // Calculate scale to fit the Master Frame (canvasSize) into available space
            const scaleX = (availableWidth * padding) / product.canvasSize;
            const scaleY = (availableHeight * padding) / product.canvasSize;

            // Use the smaller scale to ensure it fits entirely
            setScale(Math.min(scaleX, scaleY));
        };

        // Initial calc
        handleResize();

        // Listen for window resize
        window.addEventListener('resize', handleResize);

        // Also listen for container resize (if sidebar opens/closes)
        const resizeObserver = new ResizeObserver(handleResize);
        if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [product.canvasSize]);

    // --- 2. CANVAS INITIALIZATION ---
    useEffect(() => {
        if (!canvasRef.current) return;

        // Clean up old canvas
        if (fabricCanvas) {
            fabricCanvas.dispose();
        }

        // Initialize Fabric with fixed dimensions matching the product base image
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize, // STRICTLY LOCKED TO PRODUCT DIMENSIONS
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selectionColor: 'rgba(99, 102, 241, 0.1)',
            selectionBorderColor: '#6366f1',
            selectionLineWidth: 1.5,
        });

        // Configure Controls
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#cbd5e1',
            borderColor: '#6366f1',
            cornerSize: 12,
            padding: 10,
            cornerStyle: 'circle',
            borderDashArray: [4, 4],
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 5 })
        });

        // Add Design Zone Guide (Dashed Box)
        const designZone = new fabric.Rect({
            left: currentDesignZone.left,
            top: currentDesignZone.top,
            width: currentDesignZone.width,
            height: currentDesignZone.height,
            fill: 'transparent',
            stroke: 'rgba(99, 102, 241, 0.3)',
            strokeWidth: 2,
            strokeDashArray: [10, 10],
            selectable: false,
            evented: false,
            visible: true,
            id: 'design-zone' // Tagging it to find later if needed
        });
        canvas.add(designZone);

        // Add Clip Path (Forces content to stay inside print area)
        const clipPath = new fabric.Rect({
            left: currentDesignZone.left,
            top: currentDesignZone.top,
            width: currentDesignZone.width,
            height: currentDesignZone.height,
            absolutePositioned: true,
        });
        canvas.clipPath = clipPath;

        setFabricCanvas(canvas);

        // --- EXPORT LOGIC ---
        const handleUpdate = () => {
            // Hide guide before export
            designZone.set('visible', false);

            const dataUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 2, // High res export
                quality: 1,
                // Only export the printable area
                left: currentDesignZone.left,
                top: currentDesignZone.top,
                width: currentDesignZone.width,
                height: currentDesignZone.height,
            });

            // Show guide again
            designZone.set('visible', true);
            onUpdate(dataUrl);
        };

        const handleSelection = (e: any) => {
            const selected = e.selected?.[0];
            setSelectedObject(selected || null);
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
        canvas.on('selection:cleared', () => setSelectedObject(null));

        return () => {
            canvas.dispose();
        };
    }, [product.id, activeViewId]); // Re-init when product or view changes

    // --- ACTIONS (Unchanged logic) ---
    const addText = () => {
        if (!fabricCanvas) return;
        const centerX = currentDesignZone.left + currentDesignZone.width / 2;
        const centerY = currentDesignZone.top + currentDesignZone.height / 2;
        const text = new fabric.IText('DESIGN', {
            left: centerX, top: centerY, originX: 'center', originY: 'center',
            fontFamily: 'Arial', fill: '#1e293b', fontSize: currentDesignZone.width * 0.15, fontWeight: 'bold',
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
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
                imgInstance.scaleToWidth(currentDesignZone.width * 0.6);
                const centerX = currentDesignZone.left + currentDesignZone.width / 2;
                const centerY = currentDesignZone.top + currentDesignZone.height / 2;
                imgInstance.set({ left: centerX, top: centerY, originX: 'center', originY: 'center' });
                fabricCanvas.add(imgInstance);
                fabricCanvas.setActiveObject(imgInstance);
                fabricCanvas.fire('object:added');
            };
        };
        reader.readAsDataURL(e.target.files[0]);
        e.target.value = '';
    };

    const updateObject = (key: string, value: any) => {
        if (!fabricCanvas || !selectedObject) return;
        if (key === 'fill') setTextColor(value);
        if (key === 'fontFamily') setFontFamily(value);
        selectedObject.set(key as any, value);
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    const modify = (action: 'move' | 'scale' | 'rotate' | 'delete', val: number = 0, y: number = 0) => {
        if (!fabricCanvas || !selectedObject) return;
        if (action === 'move') selectedObject.set({ left: (selectedObject.left || 0) + val, top: (selectedObject.top || 0) + y });
        if (action === 'scale') selectedObject.scale((selectedObject.scaleX || 1) + val);
        if (action === 'rotate') selectedObject.rotate((selectedObject.angle || 0) + val);
        if (action === 'delete') { fabricCanvas.remove(selectedObject); fabricCanvas.discardActiveObject(); }
        selectedObject.setCoords();
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire(action === 'delete' ? 'object:removed' : 'object:modified');
    };

    return (
        <div className="w-full h-full relative bg-[#F8F9FB] overflow-hidden flex font-sans">

            {/* --- 1. TOOLBAR (Left) --- */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-2 flex flex-col gap-2 ring-1 ring-black/5">
                    <ToolButton icon={Type} label="Text" onClick={addText} tooltip="Add Text" />
                    <label className="relative">
                        <ToolButton icon={ImageIcon} label="Image" onClick={() => { }} tooltip="Upload Image" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </label>
                    <div className="h-px w-8 bg-slate-100 mx-auto my-1" />
                    <ToolButton icon={Save} label="Save" onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800) }} loading={saving} tooltip="Save Draft" />
                </div>
            </div>

            {/* --- 2. MAIN STAGE --- */}
            <div ref={wrapperRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

                {/* THE MASTER FRAME */}
                {/* This div is strictly sized to the product dimensions. We use CSS transform to fit it on screen. */}
                <div
                    className="relative shadow-2xl transition-transform duration-200 ease-out origin-center bg-white"
                    style={{
                        width: product.canvasSize,
                        height: product.canvasSize,
                        transform: `scale(${scale})`
                    }}
                >
                    {/* A. Product Image Layer (Bottom) */}
                    <img
                        src={activePreview.editorCutout || product.image}
                        alt="Product Base"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                    />

                    {/* B. Fabric Canvas Layer (Top) */}
                    {/* The canvas sits exactly on top of the image 1:1 */}
                    <canvas ref={canvasRef} className="absolute inset-0 z-10" />
                </div>

                {/* Reset View Button */}
                <div className="absolute top-8 right-8 z-20">
                    <button
                        onClick={() => { fabricCanvas?.clear(); fabricCanvas?.fire('object:modified'); }}
                        className="p-3 bg-white/80 backdrop-blur border border-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* --- 3. PROPERTIES PANEL (Right) --- */}
            <div className={cn(
                "absolute top-6 right-6 bottom-6 w-80 z-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                selectedObject ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
            )}>
                <div className="h-full bg-white/85 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 flex flex-col gap-6 ring-1 ring-black/5 overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100/50">
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            {selectedObject instanceof fabric.IText ? <TypeIcon size={18} className="text-indigo-500" /> : <ImageIcon size={18} className="text-purple-500" />}
                            <span className="text-sm tracking-tight">{selectedObject instanceof fabric.IText ? 'Text Layer' : 'Image Layer'}</span>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => modify('delete')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                            <button onClick={() => { fabricCanvas?.discardActiveObject(); fabricCanvas?.requestRenderAll(); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} /></button>
                        </div>
                    </div>

                    {/* Text Tools */}
                    {selectedObject instanceof fabric.IText && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Content</label>
                                <input
                                    type="text"
                                    value={(selectedObject as fabric.IText).text}
                                    onChange={(e) => updateObject('text', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Typography</label>
                                <div className="relative">
                                    <select
                                        value={fontFamily}
                                        onChange={(e) => updateObject('fontFamily', e.target.value)}
                                        className="w-full appearance-none px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white outline-none cursor-pointer"
                                    >
                                        {['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact', 'Monaco', 'Brush Script MT'].map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    <label className="w-8 h-8 rounded-full shadow-inner ring-1 ring-black/5 overflow-hidden relative cursor-pointer hover:scale-110 transition-transform bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 group">
                                        <input type="color" value={textColor} onChange={(e) => updateObject('fill', e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Palette size={12} className="text-white" /></div>
                                    </label>
                                    {['#1e293b', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateObject('fill', c)}
                                            className={cn(
                                                "w-8 h-8 rounded-full shadow-sm border border-slate-100 transition-transform hover:scale-110",
                                                textColor === c ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transform Tools */}
                    <div className="space-y-4 pt-4 border-t border-slate-100/50">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Maximize2 size={10} /> Transform
                        </label>
                        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
                            <div className="grid grid-cols-3 gap-2 w-28 mx-auto mb-4">
                                <div />
                                <NudgeBtn icon={ArrowUp} onClick={() => modify('move', 0, -5)} />
                                <div />
                                <NudgeBtn icon={ArrowLeft} onClick={() => modify('move', -5, 0)} />
                                <div className="flex items-center justify-center"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-sm" /></div>
                                <NudgeBtn icon={ArrowRight} onClick={() => modify('move', 5, 0)} />
                                <div />
                                <NudgeBtn icon={ArrowDown} onClick={() => modify('move', 0, 5)} />
                                <div />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                    <button onClick={() => modify('scale', -0.1)} className="p-2 hover:bg-slate-50 text-slate-500"><Minus size={14} /></button>
                                    <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-400 border-x border-slate-100">SCALE</div>
                                    <button onClick={() => modify('scale', 0.1)} className="p-2 hover:bg-slate-50 text-slate-500"><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* D. EMPTY STATE HINT */}
            {!selectedObject && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm text-xs font-medium text-slate-500 pointer-events-none animate-in fade-in slide-in-from-bottom-4 z-20">
                    Click an element to edit or drag to move
                </div>
            )}
        </div>
    );
}

// Sub components retained from previous snippet
function ToolButton({ icon: Icon, label, onClick, loading, tooltip }: any) {
    return (
        <div className="group relative flex items-center">
            <button onClick={onClick} disabled={loading} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} strokeWidth={1.5} />}
            </button>
            {tooltip && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none translate-x-[-10px] group-hover:translate-x-0 duration-200 z-50">
                    {tooltip}
                </span>
            )}
        </div>
    )
}

function NudgeBtn({ icon: Icon, onClick }: any) {
    return (
        <button onClick={onClick} className="w-full h-8 bg-white border border-slate-200 shadow-sm rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all flex items-center justify-center">
            <Icon size={14} />
        </button>
    )
}