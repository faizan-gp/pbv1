'use client';

import React, { useState, useRef } from 'react';
import DesignEditor, { DesignEditorRef } from './DesignEditorDesktop';
import ProductPreview from './ProductPreview';
import FontPicker from './FontPicker';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag, ArrowLeft, Check, Sparkles, Share2,
    Palette, Type, Image as ImageIcon, Ruler, ChevronRight, Eye, Edit3, Trash2,
    ArrowUp, ArrowDown, ArrowRight, Minus, Plus, Maximize2, ChevronDown, RefreshCcw, RefreshCw, X,
    Bold, Italic, Underline, Sliders
} from 'lucide-react';
import { useToast } from './Toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ShirtConfiguratorProps {
    product: any;
}

const STEPS = [
    { id: 'color', label: 'Color', icon: Palette, description: 'Choose your base' },
    { id: 'text', label: 'Text', icon: Type, description: 'Add custom text' },
    { id: 'image', label: 'Graphics', icon: ImageIcon, description: 'Upload logos' },
    { id: 'size', label: 'Size', icon: Ruler, description: 'Perfect fit' },
];

export default function ShirtConfiguratorDesktop({ product }: ShirtConfiguratorProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const editorRef = useRef<DesignEditorRef>(null);

    const [designStates, setDesignStates] = useState<Record<string, any>>({});
    const [designPreviews, setDesignPreviews] = useState<Record<string, string>>({});
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || { name: 'White', hex: '#fff', images: {} });
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [viewModeOverride, setViewModeOverride] = useState<'editor' | 'preview' | null>(null);

    const activeViewMode = viewModeOverride ?? (currentStep === 0 || currentStep === 3 ? 'preview' : 'editor');

    const handleDesignUpdate = React.useCallback((data: { dataUrl: string; jsonState: any }) => {
        setDesignPreviews(prev => ({ ...prev, [activeViewId]: data.dataUrl }));
        setDesignStates(prev => ({ ...prev, [activeViewId]: data.jsonState }));
    }, [activeViewId]);

    // --- Selection & Properties Logic ---
    const [selectedElement, setSelectedElement] = useState<any | null>(null);

    const handleSelectionChange = React.useCallback((selection: any | null) => {
        setSelectedElement(selection);
    }, []);

    const updateProperty = (key: string, value: any) => {
        editorRef.current?.updateObject(key, value);
        // Optimistically update local state so UI feels responsive
        setSelectedElement((prev: any) => prev ? { ...prev, [key]: value } : null);
    };

    const modifySelection = (action: 'move' | 'scale' | 'rotate' | 'delete', val?: number, y?: number) => {
        editorRef.current?.modify(action, val, y);
        if (action === 'delete') setSelectedElement(null);
    };

    const handleAddToCart = () => {
        if (!selectedSize) { showToast('Please select a size', 'error'); return; }
        setIsAdding(true);
        setTimeout(() => {
            addToCart({
                productId: product.id, name: product.name, price: 29.99, quantity: 1,
                image: designPreviews['front'] || selectedColor.images['front'],
                options: { color: selectedColor.name, size: selectedSize }
            });
            router.push("/cart");
        }, 800);
    };

    return (
        <div className="flex h-screen w-full bg-[#FAFAFA] text-slate-900 font-sans overflow-hidden">
            {/* LEFT SIDEBAR */}
            <aside className="w-[420px] flex flex-col bg-white border-r border-slate-100 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                {selectedElement ? (
                    // --- PROPERTIES PANEL ---
                    <>
                        <div className="h-20 px-8 flex items-center justify-between border-b border-slate-50 shrink-0">
                            <div className="flex items-center gap-3 text-slate-800 font-bold">
                                {selectedElement.type === 'i-text' ? <Type size={20} className="text-indigo-600" /> : <ImageIcon size={20} className="text-purple-600" />}
                                <span className="text-sm tracking-tight uppercase">PROPERTIES</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => modifySelection('delete')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Layer"><Trash2 size={18} /></button>
                                <button onClick={() => editorRef.current?.deselect()} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Close Properties"><X size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                            {selectedElement.type === 'i-text' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Content</label>
                                        <input
                                            type="text"
                                            value={selectedElement.text || ''}
                                            onChange={(e) => updateProperty('text', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Typography</label>
                                        <div className="relative">
                                            <div className="relative z-50">
                                                <FontPicker
                                                    currentFont={selectedElement.fontFamily || 'Arial'}
                                                    onFontSelect={(font) => updateProperty('fontFamily', font)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">Color</label>
                                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">{selectedElement.fill}</span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-3">
                                            <label className="col-span-1 aspect-square rounded-full shadow-inner ring-1 ring-black/5 relative cursor-pointer hover:scale-105 transition-transform bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center group">
                                                <input type="color" value={selectedElement.fill as string || '#000000'} onChange={(e) => updateProperty('fill', e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                                                <Palette size={16} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                            </label>
                                            {['#1e293b', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f97316'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => updateProperty('fill', c)}
                                                    className={cn(
                                                        "col-span-1 aspect-square rounded-full shadow-sm border border-slate-100 transition-all",
                                                        selectedElement.fill === c ? "ring-2 ring-indigo-500 ring-offset-2 scale-110" : "hover:scale-110"
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        {/* ... (existing bold/italic/align controls) ... */}
                                        <div className="flex justify-between gap-2">
                                            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                <button
                                                    onClick={() => updateProperty('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                                                    className={cn("p-1.5 rounded transition-colors", selectedElement.fontWeight === 'bold' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-800")}
                                                >
                                                    <Bold size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateProperty('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                                                    className={cn("p-1.5 rounded transition-colors", selectedElement.fontStyle === 'italic' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-800")}
                                                >
                                                    <Italic size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateProperty('underline', !selectedElement.underline)}
                                                    className={cn("p-1.5 rounded transition-colors", selectedElement.underline ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-800")}
                                                >
                                                    <Underline size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">Curvature (Arch)</label>
                                                <span className="text-[10px] text-slate-500">{selectedElement.curvature || 0}°</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-60"
                                                max="60"
                                                step="5"
                                                value={selectedElement.curvature || 0}
                                                onChange={(e) => updateProperty('curvature', parseInt(e.target.value))}
                                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">Letter Spacing</label>
                                                <span className="text-[10px] text-slate-500">{Math.round((selectedElement.charSpacing || 0))}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-50"
                                                max="300"
                                                step="10"
                                                value={selectedElement.charSpacing || 0}
                                                onChange={(e) => updateProperty('charSpacing', parseInt(e.target.value))}
                                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Opacity Control for all elements */}
                                    <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">Opacity</label>
                                            <span className="text-[10px] text-slate-500">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={selectedElement.opacity ?? 1}
                                            onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedElement.type === 'image' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                    {/* Opacity & Radius Control for Images */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">Corner Radius</label>
                                                <span className="text-[10px] text-slate-500">{selectedElement.cornerRadius || 0}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={selectedElement.cornerRadius || 0}
                                                onChange={(e) => updateProperty('cornerRadius', parseInt(e.target.value))}
                                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-bold uppercase text-slate-400">Opacity</label>
                                                <span className="text-[10px] text-slate-500">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={selectedElement.opacity ?? 1}
                                                onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Common Transform Controls */}
                            <div className="space-y-5 pt-6 mt-6 border-t border-slate-100">
                                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1"><Maximize2 size={10} /> Transform</label>
                                <div className="flex flex-col items-center gap-2 pb-2">
                                    <NudgeBtn icon={ArrowUp} onClick={() => modifySelection('move', 0, -5)} />
                                    <div className="flex gap-2">
                                        <NudgeBtn icon={ArrowLeft} onClick={() => modifySelection('move', -5, 0)} />
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        </div>
                                        <NudgeBtn icon={ArrowRight} onClick={() => modifySelection('move', 5, 0)} />
                                    </div>
                                    <NudgeBtn icon={ArrowDown} onClick={() => modifySelection('move', 0, 5)} />
                                </div>

                                <div className="space-y-3">
                                    <SegmentedControl label="SCALE" onMinus={() => modifySelection('scale', -0.05)} onPlus={() => modifySelection('scale', 0.05)} />
                                    <SegmentedControl label="ROTATE" iconMinus={<RefreshCcw size={12} />} iconPlus={<RefreshCw size={12} />} onMinus={() => modifySelection('rotate', -15)} onPlus={() => modifySelection('rotate', 15)} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // --- WIZARD STEPS ---
                    <>
                        <div className="h-20 px-8 flex items-center gap-4 border-b border-slate-50">
                            <Link href="/products" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"><ArrowLeft size={20} /></Link>
                            <div><h1 className="font-bold text-slate-900 leading-tight">{product.name}</h1><p className="text-xs text-slate-500 font-medium">$29.99 USD</p></div>
                        </div>

                        <div className="px-8 py-6">
                            <div className="flex justify-between items-center relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                                {STEPS.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isActive = idx === currentStep;
                                    const isPast = idx < currentStep;
                                    return (
                                        <button key={step.id} onClick={() => setCurrentStep(idx)} className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all bg-white relative group", isActive ? "border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-100" : isPast ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-slate-300")}>
                                            {isPast ? <Check size={16} strokeWidth={3} /> : <Icon size={18} />}
                                            <span className="absolute -bottom-8 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100 z-50">{step.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                            <div className="space-y-6">
                                <div className="text-left">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{STEPS[currentStep].label}</h2>
                                    <p className="text-sm text-slate-500">{STEPS[currentStep].description}</p>
                                </div>

                                {currentStep === 0 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                                            Selected: <span className="font-bold text-slate-900">{selectedColor.name}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            {product.colors?.map((c: any) => (
                                                <button key={c.name} onClick={() => setSelectedColor(c)} className={cn("aspect-square rounded-xl border flex items-center justify-center relative transition-all group", selectedColor.name === c.name ? "border-indigo-600 ring-1 ring-indigo-600 ring-offset-2" : "border-slate-200 hover:border-slate-300")}>
                                                    <div className="w-full h-full m-1 rounded-lg shadow-inner" style={{ backgroundColor: c.hex }} />
                                                    {selectedColor.name === c.name && <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl"><Check className="text-white drop-shadow-md" strokeWidth={3} size={20} /></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <button onClick={() => { editorRef.current?.addText(); setViewModeOverride('editor'); }} className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Type size={24} /></div>
                                                <div><h3 className="font-bold text-slate-900">Add Text Layer</h3><p className="text-xs text-slate-500 mt-1">Click to add, then edit on canvas.</p></div>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <label className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group text-left block cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><ImageIcon size={24} /></div>
                                                <div><h3 className="font-bold text-slate-900">Upload Image</h3><p className="text-xs text-slate-500 mt-1">Support for PNG, JPG (Max 5MB)</p></div>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    const reader = new FileReader();
                                                    reader.onload = (f) => f.target?.result && editorRef.current?.addImage(f.target.result as string);
                                                    reader.readAsDataURL(e.target.files[0]);
                                                    setViewModeOverride('editor');
                                                }
                                            }} />
                                        </label>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {product.sizeGuide?.imperial?.map((s: any) => (
                                                <button key={s.size} onClick={() => setSelectedSize(s.size)} className={cn("p-4 rounded-xl border text-left transition-all", selectedSize === s.size ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
                                                    <div className="text-lg font-bold">{s.size}</div>
                                                    <div className={cn("text-xs opacity-80", selectedSize === s.size ? "text-slate-300" : "text-slate-400")}>{s.width}" x {s.length}"</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-white">
                            <div className="flex gap-4">
                                {currentStep === STEPS.length - 1 ? (
                                    <button onClick={handleAddToCart} disabled={isAdding} className="flex-1 h-14 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                                        {isAdding ? <span className="animate-pulse">Processing...</span> : <><ShoppingBag size={20} /> Add to Cart</>}
                                    </button>
                                ) : (
                                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 h-14 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200">Next Step <ChevronRight size={20} /></button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </aside>

            {/* RIGHT MAIN CANVAS */}
            <main className="flex-1 relative bg-slate-100 flex flex-col overflow-hidden">
                <div className="absolute top-6 right-6 z-30 flex gap-2">
                    <div className="bg-white rounded-full shadow-sm p-1 border border-slate-200 flex">
                        <button onClick={() => setViewModeOverride('editor')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2", activeViewMode === 'editor' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                            <Edit3 size={14} /> Editor
                        </button>
                        <button onClick={() => setViewModeOverride('preview')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2", activeViewMode === 'preview' ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                            <Eye size={14} /> Preview
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-12 pb-0">
                    <div className="relative w-full h-full max-w-[800px] max-h-[800px] transition-all duration-500 flex flex-col">
                        <div className="flex-1 relative">
                            <div className={cn("absolute inset-0 transition-opacity duration-300", activeViewMode === 'editor' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                                <DesignEditor ref={editorRef} onUpdate={handleDesignUpdate} product={product} activeViewId={activeViewId} initialState={designStates[activeViewId]} hideToolbar={true} onSelectionChange={handleSelectionChange} selectedColor={selectedColor} />
                            </div>
                            <div className={cn("absolute inset-0 transition-opacity duration-300", activeViewMode === 'preview' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                                <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                                    <ProductPreview designTextureUrl={designPreviews[activeViewId]} product={product} selectedColor={selectedColor} activeViewId={activeViewId} onViewChange={setActiveViewId} minimal={true} />
                                </div>
                            </div>
                        </div>

                        {/* --- VIEW THUMBNAIL STRIP (Replaces Dots) --- */}
                        <div className="h-28 flex items-center justify-center gap-4 py-6 z-20">
                            {product.previews.map((view: any) => (
                                <button key={view.id} onClick={() => setActiveViewId(view.id)} className={cn("group flex flex-col items-center gap-2 transition-all opacity-70 hover:opacity-100", activeViewId === view.id ? "opacity-100 scale-105" : "")}>
                                    <div className={cn("w-14 h-14 rounded-xl border-2 overflow-hidden bg-white shadow-sm transition-colors", activeViewId === view.id ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-slate-200 group-hover:border-slate-300")}>
                                        <img src={selectedColor.images?.[view.id] || view.image || product.image} alt={view.name} className="w-full h-full object-contain p-1" />
                                    </div>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", activeViewId === view.id ? "text-indigo-600" : "text-slate-400")}>{view.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Subcomponents
function NudgeBtn({ icon: Icon, onClick }: any) {
    return <button onClick={onClick} className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 active:bg-indigo-50 flex items-center justify-center transition-all shadow-sm"><Icon size={16} /></button>
}

function SegmentedControl({ label, onMinus, onPlus, iconMinus, iconPlus }: any) {
    return (
        <div className="flex w-full h-10 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <button onClick={onMinus} className="w-10 flex items-center justify-center hover:bg-slate-50 text-slate-500 border-r border-slate-100 active:bg-slate-100 transition-colors">
                {iconMinus || <Minus size={14} />}
            </button>
            <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                {label}
            </div>
            <button onClick={onPlus} className="w-10 flex items-center justify-center hover:bg-slate-50 text-slate-500 border-l border-slate-100 active:bg-slate-100 transition-colors">
                {iconPlus || <Plus size={14} />}
            </button>
        </div>
    )
}