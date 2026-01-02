'use client';

import React, { useState, useRef } from 'react';
import DesignEditor, { DesignEditorRef } from './DesignEditorMobile';
import ProductPreview from './ProductPreview';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Palette, Type, Image as ImageIcon, Ruler, ChevronRight, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ShirtConfiguratorProps {
    product: any;
}

const STEPS = [
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'size', label: 'Size', icon: Ruler },
];

export default function ShirtConfiguratorMobile({ product }: ShirtConfiguratorProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const editorRef = useRef<DesignEditorRef>(null);

    const [designStates, setDesignStates] = useState<Record<string, any>>({});
    const [designPreviews, setDesignPreviews] = useState<Record<string, string>>({});
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || { name: 'White', hex: '#fff', images: {} });
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [currentStep, setCurrentStep] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);
    const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');

    const handleDesignUpdate = (data: { dataUrl: string; jsonState: any }) => {
        setDesignPreviews(prev => ({ ...prev, [activeViewId]: data.dataUrl }));
        setDesignStates(prev => ({ ...prev, [activeViewId]: data.jsonState }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            if (currentStep === 0) setViewMode('editor');
        } else {
            setIsAdding(true);
            setTimeout(() => {
                addToCart({
                    productId: product.id, name: product.name, price: 29.99, quantity: 1,
                    image: designPreviews['front'] || selectedColor.images['front'],
                    options: { color: selectedColor.name, size: selectedSize }
                });
                router.push("/cart");
            }, 800);
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-white overflow-hidden relative font-sans">

            {/* 1. Header & Icon Wizard */}
            <div className="shrink-0 z-30 bg-white">
                <header className="flex items-center px-4 py-3 border-b border-slate-50">
                    <Link href="/products" className="p-2 -ml-2 text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
                    <div className="ml-2">
                        <h1 className="text-sm font-bold text-slate-900 leading-tight">{product.name}</h1>
                        <p className="text-[10px] text-slate-500 font-bold">$29.99 USD</p>
                    </div>
                </header>

                {/* Step Icons with Connecting Line */}
                <div className="py-6 px-8 relative">
                    <div className="absolute top-1/2 left-10 right-10 h-[1px] bg-slate-100 -z-10" />
                    <div className="flex justify-between items-center">
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = idx === currentStep;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(idx)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border transition-all bg-white z-10",
                                        isActive
                                            ? "border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.1)] scale-110"
                                            : "border-slate-200 text-slate-300"
                                    )}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-white p-6 pb-24">

                {/* STEP 0: COLOR */}
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Color</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Choose your base: <span className="font-bold text-indigo-600">{selectedColor.name}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {product.colors?.map((c: any) => (
                                <button
                                    key={c.name}
                                    onClick={() => setSelectedColor(c)}
                                    className={cn(
                                        "aspect-square rounded-xl flex items-center justify-center relative transition-all active:scale-95",
                                        selectedColor.name === c.name
                                            ? "ring-2 ring-indigo-600 ring-offset-2"
                                            : "hover:ring-1 hover:ring-slate-200"
                                    )}
                                >
                                    <div className="w-full h-full rounded-lg shadow-sm border border-black/5" style={{ backgroundColor: c.hex }} />
                                    {selectedColor.name === c.name && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-black/20 backdrop-blur-[1px] rounded-lg w-full h-full flex items-center justify-center">
                                                <Check className="text-white drop-shadow-md" strokeWidth={3} size={24} />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEPS 1 & 2: TEXT & IMAGE (With Preview) */}
                {(currentStep === 1 || currentStep === 2) && (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">

                        {/* Text specific UI */}
                        {currentStep === 1 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Text</h2>
                                <button
                                    onClick={() => { editorRef.current?.addText(); setViewMode('editor'); }}
                                    className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all active:scale-[0.99] group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Type size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-slate-900">Add Text Layer</div>
                                        <div className="text-xs text-slate-500">Click to add, then edit on canvas</div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Image specific UI */}
                        {currentStep === 2 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Image</h2>
                                <label className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/50 transition-all active:scale-[0.99] group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-slate-900">Upload Image</div>
                                        <div className="text-xs text-slate-500">Supports PNG, JPG</div>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            const r = new FileReader();
                                            r.onload = (f) => { if (f.target?.result) { editorRef.current?.addImage(f.target.result as string); setViewMode('editor'); } };
                                            r.readAsDataURL(e.target.files[0]);
                                        }
                                    }} />
                                </label>
                            </div>
                        )}

                        {/* Canvas Preview Area */}
                        <div className="flex-1 relative bg-slate-100 rounded-2xl overflow-hidden shadow-inner min-h-[320px] border border-slate-200">
                            <div className={cn("absolute inset-0 z-10", viewMode === 'editor' ? 'visible' : 'invisible')}>
                                <DesignEditor ref={editorRef} onUpdate={handleDesignUpdate} product={product} activeViewId={activeViewId} initialState={designStates[activeViewId]} />
                            </div>
                            <div className={cn("absolute inset-0 z-20 flex items-center justify-center bg-white", viewMode === 'preview' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
                                <ProductPreview designTextureUrl={designPreviews[activeViewId]} product={product} selectedColor={selectedColor} activeViewId={activeViewId} onViewChange={setActiveViewId} className="h-full w-full object-contain" />
                            </div>

                            {/* Toggle */}
                            <div className="absolute top-4 right-4 flex gap-2 z-30">
                                <button onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')} className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                    <Edit3 size={12} /> {viewMode === 'editor' ? 'Preview' : 'Edit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: SIZE */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                        <div><h2 className="text-xl font-bold text-slate-900">Select Size</h2><p className="text-sm text-slate-500 mt-1">Standard US Sizing</p></div>
                        <div className="grid grid-cols-2 gap-3">
                            {product.sizeGuide?.imperial?.map((s: any) => (
                                <button key={s.size} onClick={() => setSelectedSize(s.size)} className={cn("h-14 border rounded-xl font-bold text-sm flex items-center justify-between px-4 transition-all", selectedSize === s.size ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-600 border-slate-200")}>
                                    <span>{s.size}</span>
                                    <span className={cn("text-xs font-normal", selectedSize === s.size ? "text-slate-400" : "text-slate-400")}>{s.width}" x {s.length}"</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Bottom Action Bar (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-40 pb-safe">
                <button
                    onClick={handleNext}
                    className={cn("w-full h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-xl text-lg active:scale-[0.98] transition-transform", currentStep === STEPS.length - 1 ? "bg-slate-900 shadow-slate-200" : "bg-indigo-600 shadow-indigo-200")}
                >
                    {currentStep === STEPS.length - 1 ? (isAdding ? 'Processing...' : 'Add to Cart') : <>Next Step <ChevronRight size={20} /></>}
                </button>
            </div>
        </div>
    );
}