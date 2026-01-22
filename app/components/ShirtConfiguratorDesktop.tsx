'use client';

import React, { useState, useRef } from 'react';
import DesignEditor, { DesignEditorRef } from './DesignEditorDesktop';
import ProductPreview from './ProductPreview';
import FontPicker from './FontPicker';
import SizeChartModal from './SizeChartModal';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag, ArrowLeft, Check, Sparkles, Share2,
    Palette, Type, Image as ImageIcon, Ruler, ChevronRight, Eye, Edit3, Trash2,
    ArrowUp, ArrowDown, ArrowRight, Minus, Plus, Maximize2, ChevronDown, RefreshCcw, RefreshCw, X,
    Bold, Italic, Underline, Sliders, Smartphone
} from 'lucide-react';
import { useToast } from './Toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { trackEvent, fbTrackCustom } from '@/lib/analytics';

import { getVariantId } from '@/lib/printify-map';

interface ShirtConfiguratorProps {
    product: any;
    editCartId?: string | null;
    cartUserId?: string | null;
    viewOnly?: boolean;
    initialColor?: string | null;
    initialModel?: string | null;
}

const STEPS = [
    { id: 'color', label: 'Color', icon: Palette, description: 'Choose your base' },
    { id: 'text', label: 'Text', icon: Type, description: 'Add custom text' },
    { id: 'image', label: 'Graphics', icon: ImageIcon, description: 'Upload logos' },
    { id: 'size', label: 'Size', icon: Ruler, description: 'Perfect fit' },
];

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartData } from '@/lib/firestore/carts';
import { Lock, Unlock } from 'lucide-react';

export default function ShirtConfiguratorDesktop({ product, editCartId, cartUserId, viewOnly, initialColor, initialModel }: ShirtConfiguratorProps) {
    const router = useRouter();
    const { addToCart, updateItem, items: cartItems } = useCart();
    const { showToast } = useToast();
    const editorRef = useRef<DesignEditorRef>(null);

    const isPhoneCase = product.models && product.models.length > 0;

    // Dynamic Steps to swap Color for Model
    const isAOP = React.useMemo(() => product.colors?.some((c: any) => c.isBackground), [product.colors]);

    // Dynamic Steps: 
    // 1. Swap Color for Model if Phone Case
    // 2. Remove Color if AOP
    const steps = React.useMemo(() => {
        let filtered = STEPS;
        if (isAOP) {
            filtered = filtered.filter(s => s.id !== 'color');
        }
        return filtered.map(s => {
            if (s.id === 'color' && isPhoneCase) {
                return { ...s, label: 'Model', icon: Smartphone, description: 'Choose your model' };
            }
            return s;
        });
    }, [isPhoneCase, isAOP]);

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

    // Track Editor Open
    React.useEffect(() => {
        if (!viewOnly) {
            trackEvent('design_editor_open', {
                product_id: product.id,
                product_name: product.name,
                source: editCartId ? 'cart_edit' : 'fresh'
            });
        }
    }, []);

    const activeItem = fetchedCartItem || localCartItem;

    const [designStates, setDesignStates] = useState<Record<string, any>>(localCartItem?.designState || {});
    // Previews will be regenerated by the editor based on state or we could load them? 
    // Actually, editor will trigger onUpdate when it loads state, so setDesignPreviews will happen naturally.
    const [designPreviews, setDesignPreviews] = useState<Record<string, string>>({});

    // Mockup Generation State
    const [mockupImages, setMockupImages] = useState<any[]>([]);
    const [isGeneratingMockups, setIsGeneratingMockups] = useState(false);
    const [isMockupModalOpen, setIsMockupModalOpen] = useState(false);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

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
    const [selectedModel, setSelectedModel] = useState<string>(() => {
        if (localCartItem?.options.model) return localCartItem.options.model;
        if (initialModel) return initialModel;
        return product.models?.[0]?.id || '';
    });
    const [extraColors, setExtraColors] = useState<string[]>([]); // Multi-color add
    const [measurementUnit, setMeasurementUnit] = useState<'imperial' | 'metric'>('imperial');
    const [activeViewId, setActiveViewId] = useState(product.previews[0].id);
    const [currentStep, setCurrentStep] = useState(editCartId ? 1 : 0); // Start at Design step if editing
    const [isAdding, setIsAdding] = useState(false);
    const [viewModeOverride, setViewModeOverride] = useState<'editor' | 'preview' | null>(null);

    const isColorStep = steps[currentStep]?.id === 'color';
    const activeViewMode = viewModeOverride ?? (isColorStep ? 'preview' : 'editor');

    const handleDesignUpdate = React.useCallback((data: { dataUrl: string; jsonState: any }) => {
        console.log("DEBUG: handleDesignUpdate in ShirtConfigurator", { viewId: activeViewId, dataUrlLength: data.dataUrl?.length });
        setDesignPreviews(prev => ({ ...prev, [activeViewId]: data.dataUrl }));
        setDesignStates(prev => ({ ...prev, [activeViewId]: data.jsonState }));
        // Invalidate mockups when design changes so "Preview" always regenerates
        setMockupImages([]);
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

    // Helper: Generate Composite Preview
    const generateCompositePreview = async (baseImageUrl: string, designOverlayUrl: string) => {
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
                // Draw Base
                ctx.drawImage(imgBase, 0, 0, size, size);

                // Draw Design Overlay
                const imgOverlay = new Image();
                imgOverlay.crossOrigin = 'anonymous';
                imgOverlay.onload = () => {
                    ctx.drawImage(imgOverlay, 0, 0, size, size);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for smaller size
                };
                imgOverlay.onerror = () => resolve(baseImageUrl); // Fallback
                imgOverlay.src = designOverlayUrl;
            };
            imgBase.onerror = () => resolve(baseImageUrl); // Fallback
            imgBase.src = baseImageUrl;
        });
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
                const zone = activePreview.editorZone || product.designZone;

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

    const generateMockups = async (manualTrigger: boolean = false) => {
        if (!manualTrigger && typeof manualTrigger !== 'object') {
            // Guard against any auto-calls (React events might pass object/event as first arg, so we need to be careful. 
            // Actually, if called by onClick={generateMockups}, the first arg is the Event object (truthy).
            // If called by `generateMockups()`, first arg is undefined (falsy).
            // The user says it IS called automatically. 
            // If I change signature to `manualTrigger: boolean`, and it's called with no args, it is undefined/false.
            return [];
        }
        if (manualTrigger) {
            trackEvent('ai_generate_art', { product_id: product.id });
            fbTrackCustom('AIGenerate', { product_id: product.id });
        }

        // Default to T-shirt (706) if not specified
        const blueprintId = product?.printifyBlueprintId || 949; // Default 949 (Unisex Tee)
        const providerId = product?.printifyProviderId || 47; // Default 25 (Monster Digital) or 47

        // Determine Variant ID based on Model or Color
        // 1. Try Selected Model (Phone Cases etc.)
        // 2. Try Selected Color (T-Shirts etc.)
        // 3. Fallback to default
        let variantId = 79389; // Default fallback

        const activeModel = product.models?.find((m: any) => m.id === selectedModel);

        if (activeModel && activeModel.printifyVariantIds && activeModel.printifyVariantIds.length > 0) {
            variantId = activeModel.printifyVariantIds[0];
        } else if (selectedColor.printifyVariantIds && selectedColor.printifyVariantIds.length > 0) {
            variantId = selectedColor.printifyVariantIds[0];
        } else {
            const mappedId = getVariantId(blueprintId, selectedColor.name);
            if (mappedId) variantId = mappedId;
        }

        console.log("DEBUG: Generating Mockups with Config", { blueprintId, providerId, variantId, color: selectedColor.name });

        setIsGeneratingMockups(true);
        setMockupImages([]);

        try {
            // 1. Force capture current state from Editor
            const currentState = editorRef.current?.exportState();
            let currentDesignPreviews = { ...designPreviews };

            console.log("DEBUG: generateMockups Start", {
                activeViewId,
                currentPreviewsKeys: Object.keys(currentDesignPreviews),
                editorExport: currentState ? "Captured" : "Null"
            });

            if (currentState) {
                // Update the preview for the active view with fresh data
                currentDesignPreviews[activeViewId] = currentState.dataUrl;

                // Also update local React state to stay in sync
                setDesignStates(prev => ({ ...prev, [activeViewId]: currentState.jsonState }));
                setDesignPreviews(prev => ({ ...prev, [activeViewId]: currentState.dataUrl }));
            }

            // 1b. Get designs for All Views dynamically
            const designsMap: Record<string, any> = {};

            if (product.previews && Array.isArray(product.previews)) {
                product.previews.forEach((preview: any) => {
                    const viewId = preview.id;
                    if (currentDesignPreviews[viewId]) {
                        designsMap[viewId] = {
                            imageBase64: currentDesignPreviews[viewId],
                            printPosition: viewId
                        };
                    }
                });
            }

            // Fallback: If no designs found via previews (e.g. legacy data), try direct keys
            if (Object.keys(designsMap).length === 0) {
                Object.keys(currentDesignPreviews).forEach(viewId => {
                    designsMap[viewId] = {
                        imageBase64: currentDesignPreviews[viewId],
                        printPosition: viewId
                    };
                });
            }

            // Debug: Check if we have what we expect
            console.log("DEBUG: DesignsMap Construction", {
                activeViewId,
                hasFront: !!currentDesignPreviews['front'],
                hasBack: !!currentDesignPreviews['back'],
                designsMapKeys: Object.keys(designsMap),
                designsMap: designsMap
            });

            if (Object.keys(designsMap).length === 0) {
                showToast("Design is empty", "error");
                setIsGeneratingMockups(false);
                return [];
            }

            console.log("Generating Mockups", {
                blueprintId,
                providerId,
                variantId,
                selectedModel,
                activeModelId: activeModel?.id,
                designCount: Object.keys(designsMap).length,
                totalCameras: product.printifyCameras?.length,
                filteredCameras: product.printifyCameras?.filter((c: any) => c.variant_id === variantId)?.length,
                sampleCamera: product.printifyCameras?.[0]
            });

            const response = await fetch('/api/mockup/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    designs: designsMap,
                    product: {
                        blueprintId,
                        providerId,
                        printifyCameras: product.printifyCameras?.filter((c: any) => !c.variant_id || c.variant_id === variantId)
                    },
                    options: {
                        variantId,
                        backgroundColor: selectedColor.hex
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                setMockupImages(result.mockups);
                if (manualTrigger) showToast("Mockups generated!", "success");
                return result.mockups;
            } else {
                throw new Error(result.error);
            }

        } catch (error: any) {
            console.error("Mockup generation failed:", error);
            showToast(error.message || "Failed to generate mockups", "error");
            return [];
        } finally {
            setIsGeneratingMockups(false);
        }
    };

    // Trigger generation when entering preview mode


    const handleAddToCart = async (isUpdate: boolean = false) => {
        if (!selectedSize) { showToast('Please select a size', 'error'); return; }
        setIsAdding(true);

        try {
            // 1. Get Base Image (Secure HTTP URL)
            const baseImage = selectedColor.images[activeViewId] || selectedColor.images['front'] || product.image;

            // 2. Generate Design Overlay (Data URL) - Keep this for restoration
            const designOverlay = await generateDesignOverlay(activeViewId);
            console.log("DEBUG: Generated Design Overlay", { length: designOverlay?.length, activeViewId, previewsAvailable: Object.keys(designPreviews) });

            // 3. Ensure we have a Mockup for Thumbnail
            let thumbnailImage = (mockupImages && mockupImages.length > 0) ? mockupImages[0].src : null;

            if (!thumbnailImage) {
                // Auto-generate if missing
                showToast("Generating high-quality thumbnail...", "info");
                try {
                    const generated = await generateMockups(true); // Pass true to force execution
                    if (generated && generated.length > 0) {
                        thumbnailImage = generated[0].src;
                    }
                } catch (e) {
                    console.error("Thumbnail generation failed", e);
                }
            }

            // Fallback to composite if still no mockup
            if (!thumbnailImage) {
                const compositePreview = await generateCompositePreview(baseImage, designOverlay || '');
                thumbnailImage = compositePreview || baseImage;
            }

            const cartPayload = {
                productId: product.id, name: product.name, price: product.price, quantity: 1,
                image: thumbnailImage,
                previews: designOverlay ? { [activeViewId]: designOverlay } : undefined,
                designState: designStates, // Save full design state
                options: { color: selectedColor.name, size: selectedSize },
                shippingCost: product.shippingCost
            };

            // Main Item Add/Update
            if (isUpdate && editCartId) {
                updateItem(editCartId, cartPayload);
            } else {
                addToCart(cartPayload);
            }

            // Handle Extra Colors (Always Add New)
            if (extraColors.length > 0) {
                for (const colorName of extraColors) {
                    const extraColor = product.colors.find((c: any) => c.name === colorName);
                    if (!extraColor) continue;

                    const extraBaseImage = extraColor.images[activeViewId] || extraColor.images['front'];

                    // We reuse the SAME design overlay because it's transparent!
                    // Unless the user wants to customize per-color? No, assumption is "Same Design, Different Color"

                    addToCart({
                        productId: product.id, name: product.name, price: product.price, quantity: 1,
                        image: extraBaseImage,
                        previews: designOverlay ? { [activeViewId]: designOverlay } : undefined,
                        designState: designStates,
                        options: { color: colorName, size: selectedSize },
                        shippingCost: product.shippingCost
                    });
                }
            }

            showToast("Added to cart!", "success");

            // Track Save/Add
            trackEvent('design_save', {
                product_id: product.id,
                variant: selectedModel || selectedColor.name,
                total_value: product.price, // Approximate
                is_update: isUpdate
            });

            router.push("/cart");
        } catch (error) {
            console.error("Error adding to cart:", error);
            showToast("Failed to add to cart", "error");
            setIsAdding(false);
        }
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
                            <div>
                                <h1 className="font-bold text-slate-900 leading-tight">{product.name}</h1>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500 font-medium">${(product.price || 29.99).toFixed(2)} USD</p>
                                    {(product.shippingCost !== undefined || product.shippingTime) && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <p className="text-[10px] text-slate-400">
                                                {product.shippingCost ? `$${product.shippingCost} Shipping` : 'Free Shipping'}
                                                {product.shippingTime && ` (${product.shippingTime})`}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6">
                            <div className="flex justify-between items-center relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                                {steps.map((step, idx) => {
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
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{steps[currentStep].label}</h2>
                                    <p className="text-sm text-slate-500">{steps[currentStep].description}</p>
                                </div>

                                {steps[currentStep].id === 'color' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        {isPhoneCase ? (
                                            // PHONE CASE - MODEL SELECTION
                                            <>
                                                <div className="text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                                                    Selected: <span className="font-bold text-slate-900">{product.models?.find((m: any) => m.id === selectedModel)?.name || 'None'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {product.models?.map((m: any) => (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => setSelectedModel(m.id)}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group flex flex-col items-center gap-3",
                                                                selectedModel === m.id
                                                                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                                                                    : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <div className="w-full aspect-[3/4] rounded-lg bg-white border border-slate-100 p-2 relative overflow-hidden">
                                                                <img
                                                                    src={m.images?.[activeViewId] || m.image || product.image}
                                                                    alt={m.name}
                                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                                />
                                                            </div>
                                                            <div className="font-bold text-slate-900 text-sm text-center">{m.name}</div>
                                                            {selectedModel === m.id && (
                                                                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white">
                                                                    <Check size={12} strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            // T-SHIRT - COLOR SELECTION
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                )}

                                {steps[currentStep].id === 'text' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <button onClick={() => { editorRef.current?.addText(); setViewModeOverride('editor'); }} className="w-full p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Type size={24} /></div>
                                                <div><h3 className="font-bold text-slate-900">Add Text Layer</h3><p className="text-xs text-slate-500 mt-1">Click to add, then edit on canvas.</p></div>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {steps[currentStep].id === 'image' && (
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

                                {steps[currentStep].id === 'size' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        {/* Unit Toggle & Size Chart */}
                                        <div className="flex justify-between items-center mb-2">
                                            <button
                                                onClick={() => setIsSizeChartOpen(true)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                            >
                                                <Ruler size={14} /> Size Chart
                                            </button>

                                            <div className="text-[10px] uppercase font-bold text-slate-400">
                                                Select Size
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {product.sizeGuide?.[measurementUnit]?.map((s: any) => (
                                                <button key={s.size} onClick={() => setSelectedSize(s.size)} className={cn("p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center h-20", selectedSize === s.size ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                                                    <div className="text-xl font-bold">{s.size}</div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Multi-Color Variants - Hidden for AOP */}
                                        {!isAOP && (
                                            <div className="mt-8 pt-6 border-t border-slate-100">
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Also add in these colors?</h3>
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
                                                                className={cn("relative rounded-lg overflow-hidden border transition-all group", isSelected ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2" : "border-slate-200 hover:border-indigo-300")}
                                                            >
                                                                <div className="aspect-[4/5] relative bg-slate-50">
                                                                    <img src={c.images[activeViewId] || c.images['front']} className="w-full h-full object-contain mix-blend-multiply" />
                                                                </div>
                                                                <div className="p-2 bg-white text-xs font-bold text-center truncate">{c.name}</div>
                                                                {isSelected && <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm"><Check size={12} strokeWidth={3} /></div>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Mockup Button - Placed in Scrollable Area */}
                                        <div className="mt-8 pt-6 border-t border-slate-100 pb-4">
                                            <button
                                                onClick={() => {
                                                    if (mockupImages.length === 0) generateMockups(true);
                                                    setIsMockupModalOpen(true);
                                                }}
                                                className="w-full h-12 rounded-xl bg-white border border-indigo-200 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Sparkles size={16} /> Preview Mockups
                                            </button>
                                            <p className="text-center text-xs text-slate-400 mt-2">View generic preview on model</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-white">
                            <div className="flex gap-4">
                                {currentStep === steps.length - 1 ? (
                                    <div className="flex-1 flex gap-3">
                                        {editCartId ? (
                                            <>
                                                <button onClick={() => handleAddToCart(true)} disabled={isAdding} className="flex-1 h-14 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200">
                                                    {isAdding ? <span className="animate-pulse">Updating...</span> : <><RefreshCw size={20} /> Update Cart</>}
                                                </button>
                                                <button onClick={() => handleAddToCart(false)} disabled={isAdding} className="flex-1 h-14 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                                                    {isAdding ? <span className="animate-pulse">...</span> : <><ShoppingBag size={20} /> Save as New</>}
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleAddToCart(false)} disabled={isAdding} className="flex-1 h-14 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                                                {isAdding ? <span className="animate-pulse">Processing...</span> : <><ShoppingBag size={20} /> Add to Cart</>}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 h-14 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200">Next Step <ChevronRight size={20} /></button>
                                )}
                            </div>

                            {/* Persistent AI Mockup Button - Removed as duplicate */}
                        </div>
                    </>
                )}
            </aside>

            {/* RIGHT MAIN CANVAS */}
            <main className="flex-1 relative bg-slate-100 flex flex-col overflow-hidden">

                {/* Top Toolbar (Desktop) */}
                <div className="absolute top-4 right-4 z-40 flex gap-2">
                    <button
                        onClick={() => {
                            if (mockupImages.length === 0) generateMockups(true);
                            setIsMockupModalOpen(true);
                        }}
                        className="h-10 px-4 bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg text-slate-700 font-bold text-xs hover:bg-white hover:text-indigo-600 transition-all flex items-center gap-2"
                    >
                        <Sparkles size={14} /> Preview Mockups
                    </button>
                    {(cartUserId || viewOnly) && (
                        <button
                            onClick={() => setIsReadOnly(!isReadOnly)}
                            className={cn(
                                "flex items-center gap-2 px-4 h-10 rounded-lg font-bold text-xs shadow-lg transition-all",
                                isReadOnly
                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                    : "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                            )}
                        >
                            {isReadOnly ? <Lock size={14} /> : <Unlock size={14} />}
                            {isReadOnly ? "Locked" : "Editing"}
                        </button>
                    )}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-12 pb-0">
                    <div className="relative w-full h-full max-w-[800px] max-h-[800px] transition-all duration-500 flex flex-col">
                        <div className="flex-1 relative">
                            {/* Design Editor */}
                            <div className={cn("absolute inset-0 z-20 transition-opacity duration-300", activeViewMode === 'editor' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
                                <DesignEditor
                                    ref={editorRef}
                                    product={product}
                                    activeViewId={activeViewId}
                                    onUpdate={handleDesignUpdate}
                                    initialState={designStates[activeViewId]}
                                    onSelectionChange={handleSelectionChange}
                                    selectedColor={selectedColor}
                                    readOnly={isReadOnly}
                                    selectedModel={selectedModel}
                                    useRealPreview={currentStep === 0}
                                />
                            </div>

                            {/* Standard Preview (Not AI) */}
                            <div className={cn("absolute inset-0 transition-opacity duration-300", activeViewMode === 'preview' ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                                <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative">
                                    <ProductPreview designTextureUrl={designPreviews[activeViewId]} product={product} selectedColor={selectedColor} activeViewId={activeViewId} onViewChange={setActiveViewId} minimal={true} selectedModel={selectedModel} />
                                </div>
                            </div>
                        </div>

                        {/* --- VIEW THUMBNAIL STRIP --- */}
                        <div className="h-28 flex items-center justify-center gap-4 py-6 z-20">
                            {product.previews.map((view: any) => (
                                <button key={view.id} onClick={() => {
                                    // Capture current state before switching
                                    const currentState = editorRef.current?.exportState();
                                    if (currentState) {
                                        console.log("DEBUG: Saving state before switch", activeViewId);
                                        setDesignStates(prev => ({ ...prev, [activeViewId]: currentState.jsonState }));
                                        setDesignPreviews(prev => ({ ...prev, [activeViewId]: currentState.dataUrl }));
                                    }
                                    setActiveViewId(view.id);
                                    setSelectedElement(null);
                                }} className={cn("group flex flex-col items-center gap-2 transition-all opacity-70 hover:opacity-100", activeViewId === view.id ? "opacity-100 scale-105" : "")}>
                                    <div className={cn("w-14 h-14 rounded-xl border-2 overflow-hidden bg-white shadow-sm transition-colors", activeViewId === view.id ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-slate-200 group-hover:border-slate-300")}>
                                        {/* DEBUG: Thumbnail Render */}
                                        {console.warn("DEBUG: Thumbnail Render", {
                                            viewId: view.id,
                                            hasColorImage: !!selectedColor.images?.[view.id],
                                            colorImageKeys: Object.keys(selectedColor.images || {}),
                                            fallbackViewImage: view.image,
                                            finalSrc: selectedColor.images?.[view.id] || view.image || product.image
                                        }) as any}
                                        <img
                                            src={
                                                (product.models?.find((m: any) => m.id === selectedModel)?.images?.[view.id]) ||
                                                (product.models?.find((m: any) => m.id === selectedModel)?.image) ||
                                                selectedColor.images?.[view.id] ||
                                                view.image ||
                                                product.image
                                            }
                                            alt={view.name}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    </div>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", activeViewId === view.id ? "text-indigo-600" : "text-slate-400")}>{view.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main >

            {/* MOCKUP MODAL OVERLAY */}
            {isMockupModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Modal Content */}
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        {/* Header */}
                        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Sparkles size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">AI Mockups</h3>
                                    <p className="text-xs text-slate-400">High-resolution realistic previews</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMockupModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 bg-slate-50 relative overflow-hidden">
                            {isGeneratingMockups ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6" />
                                    <h4 className="text-lg font-bold text-slate-700 mb-2">Generating Mockups...</h4>
                                    <p className="text-slate-400 text-sm max-w-xs text-center">This may take a few seconds. We are mapping your design onto realistic 3D models.</p>
                                </div>
                            ) : mockupImages.length > 0 ? (
                                <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {mockupImages.map((mock: any, idx) => (
                                            <div key={idx} className="group relative aspect-square bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden cursor-zoom-in">
                                                <img src={mock.src} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />

                                                {/* Label */}
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
                                                    {mock.position}
                                                </div>

                                                {/* Actions */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                    <a href={mock.src} download={`mockup-${idx}.png`} className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg" title="Download">
                                                        <Share2 size={20} />
                                                    </a>
                                                    <button onClick={() => window.open(mock.src, '_blank')} className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg" title="View Full">
                                                        <Eye size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Footer utilized for Regen */}
                                    <div className="mt-12 flex justify-center pb-8">
                                        <button onClick={() => generateMockups(true)} className="bg-slate-900 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-600 transition-all font-bold flex items-center gap-3 active:scale-95">
                                            <Sparkles size={18} /> Regenerate All Views
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                    <Sparkles size={48} className="text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium">No mockups generated yet.</p>
                                    <button onClick={() => generateMockups(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Try Generating Now</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} product={product} />
        </div >
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