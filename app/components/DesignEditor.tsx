'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Type, Image as ImageIcon, RotateCcw, MousePointer2, ChevronDown, Save, Loader2 } from 'lucide-react';
import { Product, ProductColor } from '../data/products';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DesignEditorProps {
    onUpdate: (dataUrl: string) => void;
    product: Product;
    selectedColor: ProductColor;
    onColorChange: (color: ProductColor) => void;
    activeViewId: string;
}

export default function DesignEditor({ onUpdate, product, selectedColor, onColorChange, activeViewId }: DesignEditorProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const designZoneRef = useRef<fabric.Rect | null>(null);

    // Editor State
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [textColor, setTextColor] = useState<string>('#333333');
    const [fontSize, setFontSize] = useState<number>(60);
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [saving, setSaving] = useState(false);

    // Derived Logic
    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];
    const currentDesignZone = activePreview.editorZone || product.designZone;

    // --- CANVAS INITIALIZATION LOGIC (Same as before) ---
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selectionColor: 'rgba(79, 70, 229, 0.1)',
            selectionBorderColor: '#4f46e5',
            selectionLineWidth: 1,
        });

        // Custom styling for controls
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#4f46e5',
            borderColor: '#4f46e5',
            cornerSize: 10,
            padding: 5,
            cornerStyle: 'circle',
            borderDashArray: [4, 4],
        });

        // Guidelines
        const designZone = new fabric.Rect({
            left: currentDesignZone.left,
            top: currentDesignZone.top,
            width: currentDesignZone.width,
            height: currentDesignZone.height,
            fill: 'transparent',
            stroke: 'rgba(79, 70, 229, 0.3)',
            strokeWidth: 2,
            strokeDashArray: [10, 5],
            selectable: false,
            evented: false,
        });
        canvas.add(designZone);
        designZoneRef.current = designZone;

        // Clip Path
        const clipPath = new fabric.Rect({
            left: currentDesignZone.left,
            top: currentDesignZone.top,
            width: currentDesignZone.width,
            height: currentDesignZone.height,
        });
        canvas.clipPath = clipPath;

        setFabricCanvas(canvas);

        const handleUpdate = () => {
            if (!designZoneRef.current) return;
            designZoneRef.current.set('visible', false);

            // High-res export logic
            const originalZoom = canvas.getZoom();
            const originalVpt = canvas.viewportTransform;
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.setDimensions({ width: product.canvasSize, height: product.canvasSize });

            const dataUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 1,
                quality: 1,
                left: currentDesignZone.left,
                top: currentDesignZone.top,
                width: currentDesignZone.width,
                height: currentDesignZone.height,
            });

            canvas.setZoom(originalZoom);
            if (originalVpt) canvas.setViewportTransform(originalVpt);
            designZoneRef.current.set('visible', true);
            onUpdate(dataUrl);
        };

        const handleSelection = (e: any) => {
            const selected = e.selected?.[0];
            setSelectedObject(selected || null);
            if (selected && selected instanceof fabric.IText) {
                setTextColor(selected.fill as string);
                setFontSize(selected.fontSize || 60);
                setFontFamily(selected.fontFamily || 'Arial');
            }
        };

        canvas.on('object:modified', handleUpdate);
        canvas.on('object:added', handleUpdate);
        canvas.on('object:removed', handleUpdate);
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', () => setSelectedObject(null));

        const resizeCanvas = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            if (width === 0 || height === 0) return;

            const scale = Math.min(width / product.canvasSize, height / product.canvasSize) * 0.9;

            canvas.setDimensions({ width: width, height: height });
            const vpt: [number, number, number, number, number, number] = [scale, 0, 0, scale, (width - product.canvasSize * scale) / 2, (height - product.canvasSize * scale) / 2];
            canvas.setViewportTransform(vpt);
            canvas.renderAll();
        };

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
        };
    }, [onUpdate, product, activeViewId]);

    // --- ACTIONS ---
    const addText = () => {
        if (!fabricCanvas) return;
        const centerX = currentDesignZone.left + currentDesignZone.width / 2;
        const centerY = currentDesignZone.top + currentDesignZone.height / 2;

        // Calculate font size proportional to print area (15% of width)
        const responsiveFontSize = Math.round(currentDesignZone.width * 0.15);

        const text = new fabric.IText('YOUR TEXT', {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arial',
            fill: '#1e293b',
            fontSize: responsiveFontSize,
            fontWeight: 'bold',
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
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
                imgInstance.scaleToWidth(250);
                const centerX = currentDesignZone.left + currentDesignZone.width / 2;
                const centerY = currentDesignZone.top + currentDesignZone.height / 2;
                imgInstance.set({ left: centerX, top: centerY, originX: 'center', originY: 'center' });
                fabricCanvas.add(imgInstance);
                fabricCanvas.setActiveObject(imgInstance);
                fabricCanvas.renderAll();
                fabricCanvas.fire('object:added');
            };
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    const updateObject = (key: string, value: any) => {
        if (!fabricCanvas || !selectedObject) return;
        if (key === 'fill') setTextColor(value);
        if (key === 'fontSize') setFontSize(parseInt(value));
        if (key === 'fontFamily') setFontFamily(value);

        selectedObject.set(key, value);
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    const saveDesign = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (!fabricCanvas) return;

        setSaving(true);
        try {
            // Get Preview Image
            const dataUrl = fabricCanvas.toDataURL({
                format: 'png',
                multiplier: 0.5, // Save smaller preview
                quality: 0.8,
            });

            // Get Config
            const config = fabricCanvas.toJSON();

            const res = await fetch('/api/user/designs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    name: `Design ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                    previewImage: dataUrl,
                    config: config
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            alert('Design saved successfully!');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Failed to save design');
        } finally {
            setSaving(false);
        }
    };

    // --- UI RENDER ---
    return (
        <div className="flex h-full relative">

            {/* 1. LEFT TOOLBAR */}
            <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-20">
                <button
                    onClick={addText}
                    className="group flex flex-col items-center gap-1 w-full"
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white group-active:scale-95 shadow-sm">
                        <Type size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">Text</span>
                </button>

                <label className="group flex flex-col items-center gap-1 w-full cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white group-active:scale-95 shadow-sm">
                        <ImageIcon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                <div className="h-px w-8 bg-slate-200 my-2"></div>

                <div className="flex flex-col gap-3 items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Color</span>
                    {product.colors.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => onColorChange(c)}
                            className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-125 ${selectedColor.name === c.name ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : ''}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                        />
                    ))}
                </div>

                <div className="mt-auto">
                    <button
                        onClick={saveDesign}
                        disabled={saving}
                        className="group flex flex-col items-center gap-1 w-full"
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white group-active:scale-95 shadow-sm">
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 group-hover:text-indigo-600">Save</span>
                    </button>
                </div>
            </div>

            {/* 2. CANVAS VIEWPORT */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {/* ... existing canvas rendering ... */}
                {/* Checkered Background for "Transparency" feel */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div ref={containerRef} className="w-full h-full relative">
                    {/* The Background Image (Visual Only) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                            // Using the cutout specific to the view
                            src={activePreview.editorCutout || product.image}
                            alt="Template"
                            className="max-h-[90%] w-auto object-contain opacity-90 mix-blend-multiply"
                            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}
                        />
                    </div>
                    {/* The Fabric Canvas (Interactive) */}
                    <canvas ref={canvasRef} className="absolute inset-0" />
                </div>

                {/* Reset Action */}
                <button
                    onClick={() => {
                        fabricCanvas?.getObjects().forEach((o) => {
                            if (o !== designZoneRef.current) fabricCanvas.remove(o);
                        });
                        fabricCanvas?.fire('object:modified'); // Trigger update
                    }}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors z-30"
                    title="Clear Canvas"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* 3. FLOATING PROPERTIES PANEL */}
            {selectedObject && (
                <div className="absolute right-6 top-6 w-64 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 z-40 animate-in slide-in-from-right-4 fade-in duration-200">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                            <MousePointer2 size={12} />
                            {selectedObject instanceof fabric.IText ? 'Edit Text' : 'Edit Object'}
                        </span>
                        <button
                            onClick={() => {
                                fabricCanvas?.discardActiveObject();
                                fabricCanvas?.requestRenderAll();
                            }}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    {selectedObject instanceof fabric.IText && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Content</label>
                                <input
                                    type="text"
                                    value={(selectedObject as fabric.IText).text}
                                    onChange={(e) => updateObject('text', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Font</label>
                                <select
                                    value={fontFamily}
                                    onChange={(e) => updateObject('fontFamily', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Impact">Impact</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {['#1e293b', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateObject('fill', c)}
                                            className={`w-8 h-8 rounded-full border shadow-sm ${textColor === c ? 'ring-2 ring-indigo-500 ring-offset-1 border-transparent' : 'border-slate-200'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}