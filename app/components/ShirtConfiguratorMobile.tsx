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
    ArrowUp, ArrowDown, ArrowRight, ArrowLeft as ArrowL, ArrowRight as ArrowR, Minus, Plus, Maximize2, ChevronDown, RefreshCcw, RotateCcw,
    Bold, Italic, Underline, Sliders, Eye, Edit3, Keyboard, Layers, Truck, Sparkles, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ShirtConfiguratorProps {
    product: any;
    editCartId?: string | null;
    cartUserId?: string | null;
    viewOnly?: boolean;
    initialColor?: string | null;
}

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartData } from '@/lib/firestore/carts';
import { useToast } from './Toast';
import { Lock, Unlock } from 'lucide-react';

const TABS = [
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'size', label: 'Size', icon: Ruler },
];

export default function ShirtConfiguratorMobile({ product, editCartId, cartUserId, viewOnly, initialColor }: ShirtConfiguratorProps) {
    const router = useRouter();
    const { addToCart, updateItem, items: cartItems } = useCart();
    const editorRef = useRef<DesignEditorRef>(null);
    const { showToast } = useToast();

    // Read Only State
    const [isReadOnly, setIsReadOnly] = useState(!!viewOnly);

    // 1. Resolve Local Cart Item
    const localCartItem = React.useMemo(() => {
        if (!editCartId || cartUserId) return null; // Ignore local if remote user specified
        return cartItems.find(item => item.id === editCartId);
    }, [editCartId, cartItems, cartUserId]);

    // 2. Fetch Remote Cart Item (Async)
    const [fetchedCartItem, setFetchedCartItem] = useState<any | null>(null);

    React.useEffect(() => {
        if (cartUserId && editCartId) {
            const fetchRemoteCart = async () => {
                try {
                    const cartRef = doc(db, 'carts', cartUserId);
                    const snap = await getDoc(cartRef);
                    if (snap.exists()) {
                        const data = snap.data() as CartData;
                        const item = data.items.find(i => i.id === editCartId);
                        if (item) {
                            setFetchedCartItem(item);
                            // Hydrate State
                            if (item.designState) setDesignStates(item.designState);
                            if (item.options.color) {
                                const colorObj = product.colors.find((c: any) => c.name === item.options.color) || product.colors[0];
                                setSelectedColor(colorObj);
                            }
                            if (item.options.size) setSelectedSize(item.options.size);
                            if (item.previews) setDesignPreviews(item.previews);
                            setActiveTab('text'); // Go to edit mode
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch remote cart item", err);
                    showToast("Failed to load customer design", "error");
                }
            };
            fetchRemoteCart();
        }
    }, [cartUserId, editCartId, product.colors, showToast]);

    const activeItem = fetchedCartItem || localCartItem;

    // --- STATE ---
    const [activeTab, setActiveTab] = useState(activeItem || editCartId ? 'text' : 'color'); // If editing, go to edit mode
    const [selectedColor, setSelectedColor] = useState(() => {
        if (localCartItem?.options.color) {
            return product.colors.find((c: any) => c.name === localCartItem.options.color) || product.colors[0];
        }
        if (initialColor) {
            return product.colors.find((c: any) => c.name === initialColor) || product.colors[0];
        }
        return product.colors?.[0] || { name: 'White', hex: '#fff', images: {} };
    });

    const [selectedSize, setSelectedSize] = useState<string>(localCartItem?.options.size || '');
    const [extraColors, setExtraColors] = useState<string[]>([]); // Multi-color add
    const [measurementUnit, setMeasurementUnit] = useState<'imperial' | 'metric'>('imperial');
    const [isAdding, setIsAdding] = useState(false);

    // Canvas & View
    const [designStates, setDesignStates] = useState<Record<string, any>>(localCartItem?.designState || {});
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
        setMockupImages([]); // Invalidate mockups
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

    // --- MOCKUP GENERATION ---
    const [mockupImages, setMockupImages] = useState<any[]>([]);
    const [isGeneratingMockups, setIsGeneratingMockups] = useState(false);
    const [isMockupModalOpen, setIsMockupModalOpen] = useState(false);

    const generateMockups = async () => {
        setIsGeneratingMockups(true);
        setMockupImages([]); // Clear previous

        try {
            // 1. Force capture current state from Editor
            const currentState = editorRef.current?.exportState();
            let currentDesignStates = { ...designStates };
            let designDataUrl = designPreviews[activeViewId];

            if (currentState) {
                console.log("DEBUG: Captured fresh state for", activeViewId);
                currentDesignStates = {
                    ...currentDesignStates,
                    [activeViewId]: currentState.jsonState
                };
                // Use fresh data URL
                designDataUrl = currentState.dataUrl;

                // Also update local preview state to stay in sync
                setDesignStates(prev => ({ ...prev, [activeViewId]: currentState.jsonState }));
                setDesignPreviews(prev => ({ ...prev, [activeViewId]: currentState.dataUrl }));
            }

            if (!designDataUrl) {
                showToast("Design is empty", "error");
                setIsGeneratingMockups(false);
                return;
            }

            // Get blueprint/provider IDs
            const blueprintId = product.printifyBlueprintId || 949; // Fallback to Pacific Tee
            const providerId = product.printifyProviderId || 47; // Fallback to Print Geek

            // Variant logic similar to Desktop
            let variantId = 79389; // Default
            if (selectedColor.printifyVariantIds && selectedColor.printifyVariantIds.length > 0) {
                variantId = selectedColor.printifyVariantIds[0];
            } else {
                // Fallback map logic (simplified here or duplicated from desktop if needed)
                // For now assuming the color object has the IDs or we use default
            }

            console.log("Generating Mobile Mockups", { blueprintId, providerId, variantId });

            const response = await fetch('/api/mockup/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    design: {
                        imageBase64: designDataUrl,
                        printPosition: activeViewId === 'back' ? 'back' : 'front'
                    },
                    product: {
                        blueprintId,
                        providerId
                    },
                    options: {
                        variantId
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Mockup API Failed");
            }

            const data = await response.json();

            if (data.mockups) {
                setMockupImages(data.mockups);
                setIsMockupModalOpen(true); // Auto open modal on success
            }

        } catch (error) {
            console.error("Mobile Mockup Generation Error", error);
            showToast("Failed to generate mockups. Check console.", "error");
        } finally {
            setIsGeneratingMockups(false);
        }
    };

    const generateDesignOverlay = async (viewId: string) => {
        const designUrl = designPreviews[viewId];
        if (!designUrl) return null;

        return new Promise<string | null>((resolve) => {
            const canvas = document.createElement('canvas');
            const size = 600; // Reduced size for Cart storage efficiency
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(null); return; }

            const imgDesign = new Image();
            imgDesign.crossOrigin = 'anonymous';
            imgDesign.onload = () => {
                const activePreview = product.previews.find((p: any) => p.id === viewId) || product.previews[0];
                const zone = activePreview.previewZone || product.designZone;

                // Scale Logic: Map design zone coordinates to our new canvas size
                const scaleFactor = size / product.canvasSize;

                const targetLeft = zone.left * scaleFactor;
                const targetTop = zone.top * scaleFactor;
                const targetWidth = zone.width * scaleFactor;
                const targetHeight = zone.height * scaleFactor;

                ctx.drawImage(imgDesign, targetLeft, targetTop, targetWidth, targetHeight);
                resolve(canvas.toDataURL('image/png'));
            };
            imgDesign.onerror = () => resolve(null);
            imgDesign.src = designUrl;
        });
    };

    // Helper: Generate Composite Preview
    const generateCompositePreview = async (baseImageUrl: string, designOverlayUrl: string | null) => {
        if (!designOverlayUrl) return baseImageUrl;

        return new Promise<string>((resolve) => {
            const canvas = document.createElement('canvas');
            const size = 600;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(baseImageUrl); return; }

            const imgBase = new Image();
            imgBase.crossOrigin = 'anonymous';
            imgBase.onload = () => {
                // Draw Base (Contain)
                const scale = Math.min(size / imgBase.width, size / imgBase.height);
                const w = imgBase.width * scale;
                const h = imgBase.height * scale;
                const x = (size - w) / 2;
                const y = (size - h) / 2;
                ctx.drawImage(imgBase, x, y, w, h);

                // Draw Design Overlay
                const imgOverlay = new Image();
                imgOverlay.crossOrigin = 'anonymous';
                imgOverlay.onload = () => {
                    ctx.drawImage(imgOverlay, 0, 0, size, size);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                imgOverlay.onerror = () => resolve(baseImageUrl);
                imgOverlay.src = designOverlayUrl;
            };
            imgBase.onerror = () => resolve(baseImageUrl);
            imgBase.src = baseImageUrl;
        });
    };

    const handleAddToCart = async (isUpdate: boolean = false) => {
        if (!selectedSize) {
            setActiveTab('size');
            return;
        }
        setIsAdding(true);

        try {
            // 1. Get Base Image
            const baseImage = selectedColor.images[activeViewId] || selectedColor.images['front'] || product.image;

            // 2. Generate Design Overlay
            const designOverlay = await generateDesignOverlay(activeViewId);

            // 3. Generate Composite
            const compositePreview = await generateCompositePreview(baseImage, designOverlay);

            const cartPayload = {
                productId: product.id, name: product.name, price: product.price, quantity: 1,
                image: compositePreview || baseImage,
                previews: designOverlay ? { [activeViewId]: designOverlay } : undefined,
                designState: designStates,
                options: { color: selectedColor.name, size: selectedSize },
                shippingCost: product.shippingCost
            };

            if (isUpdate && editCartId) {
                updateItem(editCartId, cartPayload);
            } else {
                addToCart(cartPayload);
            }

            // 4. Process Extra Colors
            if (extraColors.length > 0) {
                const extraPromises = extraColors.map(async (colorName) => {
                    const colorObj = product.colors.find((c: any) => c.name === colorName);
                    if (!colorObj) return;

                    const extraBaseImage = colorObj.images[activeViewId] || colorObj.images['front'] || product.image;
                    const extraComposite = await generateCompositePreview(extraBaseImage, designOverlay);

                    addToCart({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: extraComposite || extraBaseImage,
                        previews: designOverlay ? { [activeViewId]: designOverlay } : undefined,
                        designState: designStates,
                        options: { color: colorName, size: selectedSize },
                        shippingCost: product.shippingCost
                    });
                });
                await Promise.all(extraPromises);
            }

            router.push("/cart");
        } catch (error) {
            console.error("Mobile Add/Update Failed", error);
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-white overflow-hidden font-sans overscroll-none touch-none z-[100]">

            {/* ====================================================================
                TOP SECTION: CANVAS (60% Height)
               ==================================================================== */}
            <div className="h-[60%] shrink-0 relative bg-[#F3F4F6] flex flex-col">

                {/* Header (Floating on top of canvas bg) */}
                <div className="absolute top-0 left-0 right-0 z-30 pt-safe px-4 pt-4 flex justify-between items-start pointer-events-none">
                    <Link href="/products" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-700 pointer-events-auto active:scale-95 transition-transform">
                        <ArrowLeft size={20} />
                    </Link>

                    {/* Product Info (Centered) */}
                    <div className="flex-1 flex flex-col items-center pt-2 px-2 pointer-events-auto">
                        <span className="text-xs font-bold text-slate-900 shadow-sm bg-white/80 backdrop-blur px-2 py-0.5 rounded-full mb-1">{product.name}</span>
                        <div className="flex items-center gap-1 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm">
                            <span className="text-[10px] font-bold text-slate-700">${(product.price || 29.99).toFixed(2)}</span>
                            {(product.shippingCost !== undefined || product.shippingTime) && (
                                <span className="text-[8px] text-slate-500 border-l border-slate-300 pl-1 ml-1 leading-none">
                                    <Truck size={8} className="inline mr-0.5" />
                                    {product.shippingCost ? `$${product.shippingCost}` : 'Free'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="bg-white/90 backdrop-blur shadow-sm rounded-lg p-1 flex items-center gap-1">
                            {/* Editor Toggle (Optional now since we are always in editor mostly? Or keep it to toggle controls?) 
                                Actually, if we remove 'Preview' mode button, we might just want to be in Editor mode always 
                                until 'Preview Mockups' is clicked. 
                                User asked to "remove the preview button". 
                                I'll keep "Edit" as a visual indicator or reset, but remove the toggle to the old preview.
                            */}
                            <div className={cn("px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-white shadow-sm flex items-center gap-1")}>
                                <Edit3 size={12} />
                                Edit
                            </div>

                            <div className="w-px bg-slate-200 mx-1 my-0.5" />

                            <button
                                onClick={() => {
                                    if (mockupImages.length === 0) generateMockups();
                                    setIsMockupModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
                            >
                                <Sparkles size={12} />
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Stage */}
                <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
                    {/* Background Noise/Grid */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

                    {/* Editor Layer */}
                    <div className={cn("absolute inset-0 z-20 transition-opacity duration-300", viewMode === 'editor' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
                        <DesignEditor
                            ref={editorRef}
                            product={product}
                            activeViewId={activeViewId}
                            onUpdate={handleDesignUpdate}
                            initialState={designStates[activeViewId]}
                            onSelectionChange={handleSelectionChange}
                            readOnly={isReadOnly}
                        />
                    </div>

                    {/* ADMIN CONTROLS - Mobile */}
                    {(cartUserId || viewOnly) && (
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={() => setIsReadOnly(!isReadOnly)}
                                className={cn(
                                    "flex items-center justify-center p-3 rounded-full shadow-lg transition-all",
                                    isReadOnly
                                        ? "bg-slate-900 text-white hover:bg-slate-800"
                                        : "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                                )}
                            >
                                {isReadOnly ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                        </div>
                    )}
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
                                onClick={() => {
                                    setActiveViewId(view.id);
                                    setSelectedElement(null); // Clear properties on view change
                                }}
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
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            {/* Style & Align Row */}
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex justify-between bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                    <button
                                                        onClick={() => updateProperty('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                                                        className={cn("flex-1 py-2 flex items-center justify-center rounded transition-colors", selectedElement.fontWeight === 'bold' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}
                                                    >
                                                        <Bold size={18} />
                                                    </button>
                                                    <div className="w-px bg-slate-200 my-1" />
                                                    <button
                                                        onClick={() => updateProperty('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                                                        className={cn("flex-1 py-2 flex items-center justify-center rounded transition-colors", selectedElement.fontStyle === 'italic' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}
                                                    >
                                                        <Italic size={18} />
                                                    </button>
                                                    <div className="w-px bg-slate-200 my-1" />
                                                    <button
                                                        onClick={() => updateProperty('underline', !selectedElement.underline)}
                                                        className={cn("flex-1 py-2 flex items-center justify-center rounded transition-colors", selectedElement.underline ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}
                                                    >
                                                        <Underline size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Spacing & Curvature & Opacity */}
                                            <div className="space-y-4">
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
                                    </div>
                                )}

                                {selectedElement.type === 'image' && (
                                    <div className="space-y-6">
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
                            {/* Primary Action (Add To Cart) - Always visible in Nav Mode */}
                            <div className="flex gap-2">
                                {editCartId ? (
                                    <>
                                        <button
                                            onClick={() => handleAddToCart(true)}
                                            disabled={isAdding}
                                            className="h-8 px-3 bg-indigo-600 text-white rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all"
                                            title="Update Cart"
                                        >
                                            {isAdding ? <span className="text-[10px] font-bold">...</span> : <RefreshCw size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleAddToCart(false)}
                                            disabled={isAdding}
                                            className="h-8 px-3 bg-slate-900 text-white rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all"
                                            title="Save as New"
                                        >
                                            {isAdding ? <span className="text-[10px] font-bold">...</span> : <ShoppingBag size={14} />}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleAddToCart(false)}
                                        disabled={isAdding}
                                        className="h-8 px-4 bg-slate-900 text-white rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all"
                                    >
                                        {isAdding ? <span className="text-[10px] font-bold">...</span> : <><ShoppingBag size={12} /><span className="text-[10px] font-bold">Add to Cart</span></>}
                                    </button>
                                )}
                            </div>
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
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    {/* Unit Toggle */}
                                    <div className="flex justify-center">
                                        <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                                            <button onClick={() => setMeasurementUnit('imperial')} className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", measurementUnit === 'imperial' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Imperial</button>
                                            <button onClick={() => setMeasurementUnit('metric')} className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", measurementUnit === 'metric' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Metric</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {product.sizeGuide?.[measurementUnit]?.map((s: any) => (
                                            <button key={s.size} onClick={() => setSelectedSize(s.size)} className={cn("p-4 rounded-xl border text-left transition-all", selectedSize === s.size ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
                                                <div className="text-lg font-bold">{s.size}</div>
                                                <div className={cn("text-xs opacity-80", selectedSize === s.size ? "text-slate-300" : "text-slate-400")}>
                                                    {s.width} {measurementUnit === 'imperial' ? '"' : 'cm'} x {s.length} {measurementUnit === 'imperial' ? '"' : 'cm'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Multi-Color Variants */}
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Also add in these colors?</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {product.colors.filter((c: any) => c.name !== selectedColor.name).map((c: any) => {
                                                const isSelected = extraColors.includes(c.name);
                                                return (
                                                    <button
                                                        key={c.name}
                                                        onClick={() => setExtraColors(prev =>
                                                            prev.includes(c.name)
                                                                ? prev.filter(x => x !== c.name)
                                                                : [...prev, c.name]
                                                        )}
                                                        className={cn("relative rounded-lg overflow-hidden border transition-all group", isSelected ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2" : "border-slate-200")}
                                                    >
                                                        <div className="aspect-[4/5] relative bg-slate-50">
                                                            <img src={c.images[activeViewId] || c.images['front']} className="w-full h-full object-contain mix-blend-multiply" />
                                                        </div>
                                                        <div className="p-1 bg-white text-[10px] font-bold text-center truncate">{c.name}</div>
                                                        {isSelected && <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm"><Check size={10} strokeWidth={3} /></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
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

            {/* MOBILE MOCKUP MODAL */}
            {isMockupModalOpen && (
                <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
                    {/* Header */}
                    <div className="shrink-0 h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-white/90 backdrop-blur top-0 sticky z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Sparkles size={16} /></div>
                            <span className="font-bold text-slate-800">AI Mockups</span>
                        </div>
                        <button onClick={() => setIsMockupModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-20">
                        {isGeneratingMockups ? (
                            <div className="h-full flex flex-col items-center justify-center pb-20">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                                <h4 className="font-bold text-slate-800">Animating...</h4>
                                <p className="text-xs text-slate-400 mt-2">Generating realistic previews</p>
                            </div>
                        ) : mockupImages.length > 0 ? (
                            <div className="space-y-4">
                                {mockupImages.map((mock: any, idx) => (
                                    <div key={idx} className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group">
                                        <img src={mock.src} className="w-full h-full object-contain p-4" />
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                            {mock.position}
                                        </div>
                                        <div className="absolute bottom-3 right-3 flex gap-2">
                                            <a href={mock.src} download={`mockup-${idx}.png`} className="p-2 bg-white text-slate-800 rounded-full shadow-md active:scale-90 transition-transform">
                                                <Share2 size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-8 pb-8 px-4">
                                    <button onClick={generateMockups} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <Sparkles size={16} /> Regenerate
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-60 pb-20">
                                <Sparkles size={32} className="text-slate-300 mb-2" />
                                <p className="text-sm">No mockups yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

// Subcomponents
function NudgeBtn({ icon: Icon, onClick }: any) {
    return <button onClick={onClick} className="w-full h-9 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 active:bg-slate-50 flex items-center justify-center shadow-sm active:shadow-none transition-all"><Icon size={14} /></button>
}
