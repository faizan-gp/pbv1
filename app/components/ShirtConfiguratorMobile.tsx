'use client';

import React, { useState, useRef, useCallback } from 'react';
import DesignEditor, { DesignEditorRef } from './DesignEditorMobile';
import ProductPreview from './ProductPreview';
import FontPicker from './FontPicker';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Check, Palette, Type, Image as ImageIcon, Ruler,
    ChevronRight, ShoppingBag, Trash2, X, RefreshCw,
    ArrowUp, ArrowDown, ArrowLeft as ArrowL, ArrowRight as ArrowR,
    Minus, Plus, Eye, Edit3, Keyboard, Layers,
    RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ShirtConfiguratorProps {
    product: any;
}

const TABS = [
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'size', label: 'Size', icon: Ruler },
];

export default function ShirtConfiguratorMobile({ product }: ShirtConfiguratorProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const editorRef = useRef<DesignEditorRef>(null);

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('color');
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || { name: 'White', hex: '#fff', images: {} });
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    // Canvas & View
    const [designStates, setDesignStates] = useState<Record<string, any>>({});
    const [designPreviews, setDesignPreviews] = useState<Record<string, string>>({});
    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);
    const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

    // Selection
    const [selectedElement, setSelectedElement] = useState<any | null>(null);

    // --- EFFECT: Auto-Switch View Mode ---
    React.useEffect(() => {
        if (activeTab === 'color' || activeTab === 'size') {
            setViewMode('preview');
        } else if (activeTab === 'text' || activeTab === 'image') {
            setViewMode('editor');
        }
    }, [activeTab]);

    // --- HANDLERS ---
    const handleDesignUpdate = useCallback((data: { dataUrl: string; jsonState: any }) => {
        console.log("DEBUG: Parent Received Update", {
            viewId: activeViewId,
            dataUrlLen: data.dataUrl.length,
            state: data.jsonState
        });
        setDesignPreviews(prev => ({ ...prev, [activeViewId]: data.dataUrl }));
        setDesignStates(prev => ({ ...prev, [activeViewId]: data.jsonState }));
    }, [activeViewId]);

    const handleSelectionChange = useCallback((selection: any | null) => {
        setSelectedElement(selection);
        if (selection) setViewMode('editor');
    }, []);

    const updateProperty = (key: string, value: any) => {
        editorRef.current?.updateObject(key, value);
        setSelectedElement((prev: any) => prev ? { ...prev, [key]: value } : null);
    };

    const modifySelection = (action: 'move' | 'scale' | 'rotate' | 'delete', val?: number, y?: number) => {
        editorRef.current?.modify(action, val, y);
        if (action === 'delete') setSelectedElement(null);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            setActiveTab('size');
            return;
        }
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
        <div className="flex flex-col h-[100dvh] bg-white overflow-hidden font-sans">

            {/* ====================================================================
                TOP SECTION: CANVAS (60% Height)
               ==================================================================== */}
            <div className="h-[60%] shrink-0 relative bg-[#F3F4F6] flex flex-col">

                {/* Header (Floating on top of canvas bg) */}
                <div className="absolute top-0 left-0 right-0 z-30 pt-safe px-4 pt-4 flex justify-between items-start pointer-events-none">
                    <Link href="/products" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-700 pointer-events-auto active:scale-95 transition-transform">
                        <ArrowLeft size={20} />
                    </Link>

                    {/* View Switcher */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="bg-white/90 backdrop-blur shadow-sm rounded-lg p-1 flex">
                            <button onClick={() => setViewMode('editor')} className={cn("px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", viewMode === 'editor' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400")}>
                                Edit
                            </button>
                            <button onClick={() => setViewMode('preview')} className={cn("px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", viewMode === 'preview' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400")}>
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Stage */}
                <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
                    {/* Background Noise/Grid */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

                    {/* Editor View */}
                    <div className={cn("absolute inset-0 z-10 transition-opacity duration-300", viewMode === 'editor' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                        <DesignEditor
                            ref={editorRef}
                            onUpdate={handleDesignUpdate}
                            product={product}
                            activeViewId={activeViewId}
                            initialState={designStates[activeViewId]}
                            onSelectionChange={handleSelectionChange}
                        />
                    </div>

                    {/* Preview View */}
                    <div className={cn("absolute inset-0 z-20 bg-[#F3F4F6] flex items-center justify-center transition-opacity duration-300", viewMode === 'preview' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                        <ProductPreview
                            designTextureUrl={designPreviews[activeViewId]}
                            product={product}
                            selectedColor={selectedColor}
                            activeViewId={activeViewId}
                            onViewChange={setActiveViewId}
                            className="h-full w-full object-contain p-8"
                        />
                    </div>

                    {/* Front/Back Toggles (Floating Bottom Right of Canvas) */}
                    <div className="absolute right-4 bottom-4 flex gap-2 z-20 pointer-events-auto">
                        {product.previews.map((view: any) => (
                            <button
                                key={view.id}
                                onClick={() => setActiveViewId(view.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full border shadow-sm text-[10px] font-bold transition-all active:scale-95",
                                    activeViewId === view.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-500"
                                )}
                            >
                                {view.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ====================================================================
                BOTTOM SECTION: TOOLS (40% Height) - SCROLLABLE
               ==================================================================== */}
            <div className="h-[40%] shrink-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex flex-col relative">

                {/* SCENARIO A: PROPERTIES MODE (Object Selected) */}
                {selectedElement && viewMode === 'editor' ? (
                    <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-200">
                        {/* 1. Tool Header */}
                        <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white">
                            <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-2">
                                {selectedElement.type === 'i-text' ? <Type size={14} /> : <ImageIcon size={14} />}
                                Properties
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => modifySelection('delete')} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                                <button onClick={() => editorRef.current?.deselect()} className="p-1.5 bg-slate-100 text-slate-500 rounded hover:bg-slate-200"><X size={16} /></button>
                            </div>
                        </div>

                        {/* 2. Scrollable Properties Area */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-6">
                                {selectedElement.type === 'i-text' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Text & Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={selectedElement.text || ''}
                                                    onChange={(e) => updateProperty('text', e.target.value)}
                                                    className="flex-1 px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-indigo-500 outline-none"
                                                />
                                                <div className="relative w-10 h-10 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                    <input type="color" value={selectedElement.fill} onChange={(e) => updateProperty('fill', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    <div className="w-full h-full" style={{ backgroundColor: selectedElement.fill }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Typography</label>
                                            <div className="relative z-50">
                                                <FontPicker
                                                    currentFont={selectedElement.fontFamily || 'Arial'}
                                                    onFontSelect={(font) => updateProperty('fontFamily', font)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Common Transforms */}
                                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase text-center block">Move</label>
                                        <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                                            <div /> <NudgeBtn icon={ArrowUp} onClick={() => modifySelection('move', 0, -2)} /> <div />
                                            <NudgeBtn icon={ArrowL} onClick={() => modifySelection('move', -2, 0)} />
                                            <div className="w-full aspect-square bg-slate-200/50 rounded-md" />
                                            <NudgeBtn icon={ArrowR} onClick={() => modifySelection('move', 2, 0)} />
                                            <div /> <NudgeBtn icon={ArrowDown} onClick={() => modifySelection('move', 0, 2)} /> <div />
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-center">
                                        <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-1">
                                            <button onClick={() => modifySelection('scale', -0.05)} className="p-1.5 hover:bg-slate-50 rounded"><Minus size={14} /></button>
                                            <span className="text-[10px] font-bold text-slate-500">Size</span>
                                            <button onClick={() => modifySelection('scale', 0.05)} className="p-1.5 hover:bg-slate-50 rounded"><Plus size={14} /></button>
                                        </div>
                                        <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-1">
                                            <button onClick={() => modifySelection('rotate', -15)} className="p-1.5 hover:bg-slate-50 rounded"><RefreshCcw size={14} /></button>
                                            <span className="text-[10px] font-bold text-slate-500">Rot</span>
                                            <button onClick={() => modifySelection('rotate', 15)} className="p-1.5 hover:bg-slate-50 rounded"><RefreshCw size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SCENARIO B: NAVIGATION MODE (Default) */
                    <div className="flex flex-col h-full">

                        {/* 1. Header Area (Shows Selection Summary) */}
                        <div className="shrink-0 h-12 border-b border-slate-100 flex items-center justify-between px-4 bg-white">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {activeTab === 'color' ? 'Select Color' :
                                        activeTab === 'text' ? 'Typography' :
                                            activeTab === 'image' ? 'Upload' : 'Dimensions'}
                                </span>
                                {activeTab === 'color' && <span className="text-xs font-bold text-slate-800">{selectedColor.name}</span>}
                                {activeTab === 'size' && <span className="text-xs font-bold text-slate-800">{selectedSize || 'None Selected'}</span>}
                            </div>

                            {/* Primary Action (Add To Cart) - Always visible in Nav Mode */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="h-8 px-4 bg-slate-900 text-white rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all"
                            >
                                {isAdding ? <span className="text-[10px] font-bold">...</span> : <><ShoppingBag size={12} /><span className="text-[10px] font-bold">Add to Cart</span></>}
                            </button>
                        </div>

                        {/* 2. Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">

                            {activeTab === 'color' && (
                                <div className="grid grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-2">
                                    {product.colors?.map((c: any) => (
                                        <button key={c.name} onClick={() => setSelectedColor(c)} className={cn("aspect-square rounded-full flex items-center justify-center relative transition-transform active:scale-90", selectedColor.name === c.name ? "ring-2 ring-indigo-600 ring-offset-2" : "border border-slate-200")}>
                                            <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex }} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'text' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <button onClick={() => { editorRef.current?.addText(); setViewMode('editor'); }} className="w-full h-16 bg-white border border-indigo-100 hover:border-indigo-300 rounded-xl flex items-center justify-between px-4 text-indigo-900 active:scale-[0.98] transition-all shadow-sm group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><Type size={20} /></div>
                                            <div className="text-left">
                                                <span className="font-bold text-sm block">Add New Text</span>
                                                <span className="text-[10px] text-slate-400">Click to add layer</span>
                                            </div>
                                        </div>
                                        <Plus size={18} className="text-slate-300 group-hover:text-indigo-500" />
                                    </button>
                                </div>
                            )}

                            {activeTab === 'image' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="w-full h-16 bg-white border border-purple-100 hover:border-purple-300 rounded-xl flex items-center justify-between px-4 text-purple-900 active:scale-[0.98] transition-all shadow-sm cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600"><ImageIcon size={20} /></div>
                                            <div className="text-left">
                                                <span className="font-bold text-sm block">Upload Image</span>
                                                <span className="text-[10px] text-slate-400">PNG or JPG</span>
                                            </div>
                                        </div>
                                        <Plus size={18} className="text-slate-300 group-hover:text-purple-500" />
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

                            {activeTab === 'size' && (
                                <div className="grid grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2">
                                    {product.sizeGuide?.imperial?.map((s: any) => (
                                        <button key={s.size} onClick={() => setSelectedSize(s.size)} className={cn("h-12 border rounded-lg font-bold text-sm transition-all active:scale-95", selectedSize === s.size ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600")}>{s.size}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Bottom Tab Bar (Sticky) */}
                        <div className="h-16 border-t border-slate-100 flex items-center justify-around bg-white shrink-0 pb-safe">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn("flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors", isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600")}
                                    >
                                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Subcomponents
function NudgeBtn({ icon: Icon, onClick }: any) {
    return <button onClick={onClick} className="w-full h-9 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 active:bg-slate-50 flex items-center justify-center shadow-sm active:shadow-none transition-all"><Icon size={14} /></button>
}
