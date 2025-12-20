'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import {
    Type, Image as ImageIcon, RotateCcw, MousePointer2, ChevronDown,
    Save, Loader2, X, Palette, Trash2, Smartphone, Monitor,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus, Plus, Move
} from 'lucide-react';
import { Product, ProductColor } from '../data/products';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, or I will use template literals

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
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [saving, setSaving] = useState(false);

    // UI State for Mobile Drawers
    const [activeMobileTab, setActiveMobileTab] = useState<'none' | 'colors'>('none');

    // Derived Logic
    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];
    const currentDesignZone = activePreview.editorZone || product.designZone;

    // --- CANVAS INITIALIZATION LOGIC (Unchanged) ---
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Dispose previous canvas if exists to prevent duplicates
        if (fabricCanvas) {
            fabricCanvas.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selectionColor: 'rgba(79, 70, 229, 0.1)',
            selectionBorderColor: '#4f46e5',
            selectionLineWidth: 1,
            // Mobile Touch Improvements
            allowTouchScrolling: true,
        });

        // Make control handles bigger for touch
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#4f46e5',
            borderColor: '#4f46e5',
            cornerSize: 12, // Bigger for touch
            padding: 10,
            cornerStyle: 'circle',
            borderDashArray: [4, 4],
            touchCornerSize: 24, // Much bigger hit area for mobile
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
            if (selected) setActiveMobileTab('none'); // Close other drawers when object selected

            if (selected && selected instanceof fabric.IText) {
                setTextColor(selected.fill as string);
                // setFontSize(selected.fontSize || 60); // Optional: Fabric handles visual resizing
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

            // Fit canvas within container with padding
            const scale = Math.min(width / product.canvasSize, height / product.canvasSize) * 0.95;

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
    }, [onUpdate, product, activeViewId]); // Removed dependencies that might cause excessive re-renders

    // --- ACTIONS ---
    const addText = () => {
        if (!fabricCanvas) return;
        const centerX = currentDesignZone.left + currentDesignZone.width / 2;
        const centerY = currentDesignZone.top + currentDesignZone.height / 2;
        const responsiveFontSize = Math.round(currentDesignZone.width * 0.15);

        const text = new fabric.IText('TEXT', {
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
                // Scale based on design zone width
                imgInstance.scaleToWidth(currentDesignZone.width * 0.6);
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
        e.target.value = ''; // Reset input
    };

    const updateObject = (key: string, value: any) => {
        if (!fabricCanvas || !selectedObject) return;
        if (key === 'fill') setTextColor(value);
        if (key === 'fontFamily') setFontFamily(value);

        selectedObject.set(key as any, value);
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    // --- FINE TUNE HELPERS ---
    const moveObject = (dx: number, dy: number) => {
        if (!fabricCanvas || !selectedObject) return;
        selectedObject.set({
            left: (selectedObject.left || 0) + dx,
            top: (selectedObject.top || 0) + dy
        });
        selectedObject.setCoords();
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    const scaleObject = (delta: number) => {
        if (!fabricCanvas || !selectedObject) return;
        const currentScale = selectedObject.scaleX || 1;
        const newScale = Math.max(0.1, currentScale + delta);
        selectedObject.scale(newScale);
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    const rotateObject = (delta: number) => {
        if (!fabricCanvas || !selectedObject) return;
        const currentAngle = selectedObject.angle || 0;
        selectedObject.rotate((currentAngle + delta) % 360);
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:modified');
    };

    const deleteSelected = () => {
        if (!fabricCanvas || !selectedObject) return;
        fabricCanvas.remove(selectedObject);
        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();
        fabricCanvas.fire('object:removed');
    };

    const saveDesign = async () => {
        if (!session) {
            router.push('/login');
            return;
        }
        if (!fabricCanvas) return;
        setSaving(true);
        try {
            const dataUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 0.5, quality: 0.8 });
            const config = fabricCanvas.toJSON();
            const res = await fetch('/api/user/designs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    name: `Design ${new Date().toLocaleDateString()}`,
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

    // --- RENDER ---
    return (
        <div className="flex flex-col md:flex-row h-[100dvh] md:h-full relative bg-slate-50 overflow-hidden">

            {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
            <div className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-6 gap-6 z-20 shadow-sm">
                <ToolButton icon={Type} label="Text" onClick={addText} />
                <label className="group flex flex-col items-center gap-1 w-full cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
                        <ImageIcon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <div className="h-px w-8 bg-slate-200 my-2"></div>

                {/* Desktop Color Picker */}
                <div className="flex flex-col gap-3 items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Colors</span>
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

                <div className="mt-auto pb-4">
                    <ToolButton icon={Save} label="Save" onClick={saveDesign} loading={saving} active />
                </div>
            </div>

            {/* 2. MAIN CANVAS AREA (Flexible) */}
            <div className="flex-1 relative flex flex-col bg-slate-100/50">
                {/* Mobile Header */}
                <div className="md:hidden h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-10">
                    <span className="font-bold text-slate-800 text-sm">{activePreview.name}</span>
                    <button
                        onClick={saveDesign}
                        disabled={saving}
                        className="text-sm font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                    </button>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]"></div>

                    <div ref={containerRef} className="w-full h-full relative z-0">
                        {/* Background Image */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <img
                                src={activePreview.editorCutout || product.image}
                                alt="Template"
                                className="max-h-[100%] max-w-[100%] w-auto h-auto object-contain opacity-90 mix-blend-multiply drop-shadow-xl"
                            />
                        </div>
                        {/* Fabric Canvas */}
                        <canvas ref={canvasRef} className="absolute inset-0" />
                    </div>

                    {/* Reset Button (Floating) */}
                    <button
                        onClick={() => {
                            fabricCanvas?.getObjects().forEach((o) => {
                                if (o !== designZoneRef.current) fabricCanvas.remove(o);
                            });
                            fabricCanvas?.fire('object:modified');
                        }}
                        className="absolute top-4 right-4 md:top-8 md:right-8 p-2.5 bg-white rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-red-500 z-10"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>

                {/* Mobile Bottom Spacer (so canvas doesn't get covered by toolbar) */}
                <div className="h-20 md:hidden" />
            </div>

            {/* 3. MOBILE BOTTOM TOOLBAR (Fixed) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 flex items-center justify-around px-2 z-30 pb-safe">
                <MobileToolBtn icon={Type} label="Text" onClick={addText} />
                <label className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                    <ImageIcon className="text-slate-600" size={24} />
                    <span className="text-[10px] font-medium text-slate-500">Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <MobileToolBtn
                    icon={Palette}
                    label="Colors"
                    onClick={() => setActiveMobileTab(activeMobileTab === 'colors' ? 'none' : 'colors')}
                    active={activeMobileTab === 'colors'}
                />
            </div>

            {/* 4. MOBILE COLOR DRAWER (Slide Up) */}
            <div className={`md:hidden fixed bottom-20 left-0 right-0 bg-white border-t border-slate-200 p-4 transition-transform duration-300 z-20 ${activeMobileTab === 'colors' ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-slate-400">Product Color</span>
                    <button onClick={() => setActiveMobileTab('none')}><X size={16} className="text-slate-400" /></button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.colors.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => onColorChange(c)}
                            className={`flex-shrink-0 w-10 h-10 rounded-full border border-slate-200 ${selectedColor.name === c.name ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                            style={{ backgroundColor: c.hex }}
                        />
                    ))}
                </div>
            </div>

            {/* 5. OBJECT PROPERTIES PANEL (Responsive) */}
            {selectedObject && (
                <div className={`
                    fixed md:absolute 
                    z-40 
                    /* Mobile Styles: Bottom Sheet */
                    bottom-0 left-0 right-0 
                    md:top-6 md:right-6 md:left-auto md:bottom-auto md:w-72
                    bg-white/95 backdrop-blur-xl md:bg-white 
                    border-t md:border border-slate-200 
                    shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-2xl md:rounded-2xl 
                    p-5 
                    animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 fade-in duration-300
                    pb-8 md:pb-5
                `}>
                    {/* Mobile Handle */}
                    <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                            <MousePointer2 size={14} />
                            {selectedObject instanceof fabric.IText ? 'Edit Text' : 'Edit Image'}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={deleteSelected} className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100">
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    fabricCanvas?.discardActiveObject();
                                    fabricCanvas?.requestRenderAll();
                                }}
                                className="p-1.5 text-slate-400 bg-slate-50 rounded-lg"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {selectedObject instanceof fabric.IText && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={(selectedObject as fabric.IText).text}
                                onChange={(e) => updateObject('text', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={fontFamily}
                                    onChange={(e) => updateObject('fontFamily', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                    <option value="Impact">Impact</option>
                                    <option value="Monaco">Monaco</option>
                                    <option value="Optima">Optima</option>
                                    <option value="Brush Script MT">Brush Script</option>
                                </select>
                                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-2">
                                    <span className="text-xs text-slate-400 mr-2">Color</span>
                                    <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: textColor }} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Color Palette</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {/* Custom Picker */}
                                    <label className="w-8 h-8 rounded-full border border-slate-200 shadow-sm overflow-hidden relative cursor-pointer hover:scale-110 transition-transform bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center group" title="Custom Color">
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => updateObject('fill', e.target.value)}
                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                        />
                                        <Palette size={14} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                    </label>

                                    {/* Presets */}
                                    {['#1e293b', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#7c3aed', '#ec4899', '#64748b'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateObject('fill', c)}
                                            className={`w-8 h-8 rounded-full border shadow-sm transition-transform ${textColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'border-slate-200 hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- FINE TUNE CONTROLS (For All Objects) --- */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Move size={12} /> Position
                            </span>
                            <span className="text-[10px] text-slate-400">Nudge</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                            <div />
                            <button onClick={() => moveObject(0, -5)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><ArrowUp size={14} /></button>
                            <div />
                            <button onClick={() => moveObject(-5, 0)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><ArrowLeft size={14} /></button>
                            <div className="flex items-center justify-center p-1"><div className="w-1 h-1 bg-slate-300 rounded-full" /></div>
                            <button onClick={() => moveObject(5, 0)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><ArrowRight size={14} /></button>
                            <div />
                            <button onClick={() => moveObject(0, 5)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><ArrowDown size={14} /></button>
                            <div />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Scale</label>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => scaleObject(-0.1)} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><Minus size={14} /></button>
                                    <button onClick={() => scaleObject(0.1)} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><Plus size={14} /></button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700">Rotate</label>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => rotateObject(-15)} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><RotateCcw size={14} /></button>
                                    <button onClick={() => rotateObject(15)} className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 flex justify-center"><RotateCcw size={14} className="scale-x-[-1]" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB COMPONENTS FOR CLEANER JSX ---

function ToolButton({ icon: Icon, label, onClick, loading, active }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="group flex flex-col items-center gap-1 w-full"
        >
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
            </div>
            <span className={`text-[10px] font-bold ${active ? 'text-indigo-600' : 'text-slate-500'} group-hover:text-indigo-600`}>{label}</span>
        </button>
    )
}

function MobileToolBtn({ icon: Icon, label, onClick, active }: any) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-95 transition-transform p-2">
            <Icon className={active ? "text-indigo-600" : "text-slate-600"} size={24} />
            <span className={`text-[10px] font-medium ${active ? "text-indigo-600 font-bold" : "text-slate-500"}`}>
                {label}
            </span>
        </button>
    )
}