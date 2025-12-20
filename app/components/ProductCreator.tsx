'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useToast } from './Toast';
import { IProduct, IProductFeature } from '@/models/Product';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, CheckCircle, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import SizeGuideEditor from './SizeGuideEditor';
import { cn } from '@/lib/utils';

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
    editorImage?: string;
}

interface ListingImage {
    url: string;
    color: string;
    isThumbnail: boolean;
}

interface ProductColor {
    name: string;
    hex: string;
}

interface ProductCreatorProps {
    initialData?: any;
    isEditing?: boolean;
}

const STEPS = [
    { id: 1, title: 'Basic Info', desc: 'Name & Category' },
    { id: 2, title: 'Visual Editor', desc: 'Configure Views' },
    { id: 3, title: 'Rich Details', desc: 'Story & Features' },
    { id: 4, title: 'Review', desc: 'Size Guide & Save' },
];

export default function ProductCreator({ initialData, isEditing = false }: ProductCreatorProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    // WIZARD STATE
    const [currentStep, setCurrentStep] = useState(1);

    // DATA STATE
    const [productName, setProductName] = useState(initialData?.name || '');
    const [category, setCategory] = useState(initialData?.category || "Men's Clothing");
    const [trending, setTrending] = useState(initialData?.trending || false);

    // BACKWARD COMPATIBILITY: Handle old string[] or new ListingImage[]
    const [listingImages, setListingImages] = useState<ListingImage[]>(() => {
        if (!initialData?.listingImages) return [];
        if (typeof initialData.listingImages[0] === 'string') {
            return initialData.listingImages.map((url: string) => ({ url, color: 'All', isThumbnail: false }));
        }
        return initialData.listingImages;
    });

    const [productColors, setProductColors] = useState<ProductColor[]>(() => {
        if (initialData?.colors && initialData.colors.length > 0) {
            return initialData.colors.map((c: any) => ({ name: c.name, hex: c.hex }));
        }
        return [{ name: 'Default', hex: '#ffffff' }];
    });

    // VIEW STATE
    const defaultView = {
        id: 'front',
        name: 'Front View',
        image: '',
        editorImage: '',
        editorZone: { left: 312, top: 262, width: 400, height: 500 },
        previewZone: { left: 312, top: 262, width: 400, height: 500 },
    };

    const initializeViews = (): ViewConfig[] => {
        if (!initialData || !initialData.previews || initialData.previews.length === 0) {
            return [defaultView];
        }
        return initialData.previews.map((preview: any) => {
            const defaultColor = initialData.colors?.[0];
            const previewImage = defaultColor?.images?.[preview.id] || '';
            return {
                id: preview.id,
                name: preview.name,
                image: previewImage,
                editorImage: preview.editorCutout || '',
                editorZone: preview.editorZone,
                previewZone: preview.previewZone,
                displacementMap: preview.displacementMap,
                shadowMap: preview.shadowMap,
                cssTransform: preview.cssTransform,
            };
        });
    };

    const [views, setViews] = useState<ViewConfig[]>(initializeViews);
    const [activeViewId, setActiveViewId] = useState<string>(views[0]?.id || 'front');
    const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

    // RICH DETAILS STATE
    const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
    const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
    const [features, setFeatures] = useState<IProductFeature[]>(initialData?.features || []);
    const [careInstructions, setCareInstructions] = useState<string[]>(initialData?.careInstructions || []);
    const [sizeGuide, setSizeGuide] = useState(initialData?.sizeGuide || {
        metric: [
            { size: 'S', width: '45.7', length: '71.1' },
            { size: 'M', width: '50.8', length: '73.7' },
            { size: 'L', width: '55.9', length: '76.2' },
            { size: 'XL', width: '61', length: '78.7' },
            { size: '2XL', width: '66', length: '81.3' },
        ],
        imperial: [
            { size: 'S', width: '18', length: '28' },
            { size: 'M', width: '20', length: '29' },
            { size: 'L', width: '22', length: '30' },
            { size: 'XL', width: '24', length: '31' },
            { size: '2XL', width: '26', length: '32' },
        ]
    });

    const [jsonOutput, setJsonOutput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const CATEGORIES = [
        "Men's Clothing",
        "Women's Clothing",
        "Kids' Clothing",
        "Accessories",
        "Home & Living",
    ];

    const CANVAS_SIZE = 1024;

    // --- FABRIC JS LOGIC (Only runs when canvas is present) ---
    useEffect(() => {
        if (!canvasRef.current || currentStep !== 2) return;

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
            setFabricCanvas(null);
        };
    }, [currentStep]);

    useEffect(() => {
        if (!fabricCanvas || currentStep !== 2) return;

        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        fabricCanvas.clear();
        fabricCanvas.backgroundColor = 'transparent';

        const createZoneRect = (zone: Zone, strokeColor: string, fillColor: string, id: string, label: string, visible: boolean) => {
            const rect = new fabric.Rect({
                left: zone.left, top: zone.top, width: zone.width, height: zone.height,
                fill: fillColor, stroke: strokeColor, strokeWidth: 2,
                cornerColor: '#ffffff', cornerStrokeColor: strokeColor, borderColor: strokeColor,
                cornerSize: 10, transparentCorners: false,
                selectable: visible, evented: visible, hasControls: visible, hasBorders: visible,
                visible: visible, data: { id }, strokeDashArray: [6, 6], borderOpacityWhenMoving: 0.8,
            });

            const text = new fabric.Text(label, {
                left: zone.left, top: zone.top - 24,
                fontSize: 14, fontFamily: 'Inter, sans-serif', fill: strokeColor,
                selectable: false, evented: false, visible: visible,
                data: { id: `${id}-label` }, fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.9)', padding: 4,
            });

            return { rect, text };
        };

        const editor = createZoneRect(activeView.editorZone, '#3b82f6', 'rgba(59, 130, 246, 0.1)', 'editor-zone', 'EDITOR ZONE', viewMode === 'editor');
        fabricCanvas.add(editor.rect, editor.text);

        const preview = createZoneRect(activeView.previewZone, '#22c55e', 'rgba(34, 197, 94, 0.1)', 'preview-zone', 'PREVIEW ZONE', viewMode === 'preview');
        fabricCanvas.add(preview.rect, preview.text);

        const updateState = () => {
            const editorObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone') as fabric.Rect;
            const previewObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone') as fabric.Rect;
            const editorLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone-label') as fabric.Text;
            const previewLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone-label') as fabric.Text;

            if (editorObj && editorLabel && editorObj.visible) {
                // @ts-ignore
                editorLabel.set({ left: editorObj.left, top: (editorObj.top || 0) - 24 });
            }
            if (previewObj && previewLabel && previewObj.visible) {
                // @ts-ignore
                previewLabel.set({ left: previewObj.left, top: (previewObj.top || 0) - 24 });
            }

            setViews(prev => prev.map(v => {
                if (v.id === activeViewId) {
                    const updatedView = { ...v };
                    if (editorObj && viewMode === 'editor') {
                        updatedView.editorZone = {
                            // @ts-ignore
                            left: Math.round(editorObj.left || 0), top: Math.round(editorObj.top || 0),
                            // @ts-ignore
                            width: Math.round((editorObj.width || 0) * (editorObj.scaleX || 1)), height: Math.round((editorObj.height || 0) * (editorObj.scaleY || 1)),
                        };
                    }
                    if (previewObj && viewMode === 'preview') {
                        updatedView.previewZone = {
                            // @ts-ignore
                            left: Math.round(previewObj.left || 0), top: Math.round(previewObj.top || 0),
                            // @ts-ignore
                            width: Math.round((previewObj.width || 0) * (previewObj.scaleX || 1)), height: Math.round((previewObj.height || 0) * (previewObj.scaleY || 1)),
                        };
                    }
                    return updatedView;
                }
                return v;
            }));
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
    }, [fabricCanvas, activeViewId, viewMode, currentStep]);


    // JSON PREVIEW & SAVE LOGIC
    useEffect(() => {
        const thumbnail = listingImages.find(img => img.isThumbnail);
        const mainImage = thumbnail ? thumbnail.url : (views[0]?.editorImage || views[0]?.image || '');

        const config = {
            id: isEditing && initialData?.id ? initialData.id : productName.toLowerCase().replace(/\s+/g, '-'),
            name: productName,
            category,
            trending,
            image: mainImage,
            listingImages,
            shortDescription,
            fullDescription,
            features,
            careInstructions,
            sizeGuide,
            canvasSize: 1024,
            colors: productColors.map(c => ({
                name: c.name,
                hex: c.hex,
                images: views.reduce((acc, v) => ({ ...acc, [v.id]: v.image }), {})
            })),
            designZone: views[0]?.editorZone,
            previews: views.map(v => ({
                id: v.id,
                name: v.name,
                editorZone: v.editorZone,
                previewZone: v.previewZone,
                displacementMap: v.displacementMap,
                shadowMap: v.shadowMap,
                editorCutout: v.editorImage,
                cssTransform: v.cssTransform
            }))
        };
        setJsonOutput(JSON.stringify(config, null, 4));
    }, [views, productName, category, trending, listingImages, shortDescription, fullDescription, features, careInstructions, sizeGuide, isEditing, initialData, productColors]);


    const handleSave = async () => {
        if (!productName.trim()) {
            showToast('Please enter a product name', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const payload = JSON.parse(jsonOutput);
            const url = isEditing ? `/api/products/${initialData.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                showToast(isEditing ? 'Product updated!' : 'Product created!', 'success');
                if (!isEditing) {
                    setProductName('');
                    setViews([defaultView]);
                    setActiveViewId('front');
                    setCurrentStep(1);
                } else {
                    router.refresh();
                }
            } else {
                showToast(data.error || 'Failed to save', 'error');
            }
        } catch (e) {
            showToast('Error saving product', 'error');
        } finally {
            setIsSaving(false);
        }
    };


    // HELPERS
    const handleListingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (f) => {
                const result = f.target?.result as string;
                if (result) {
                    setListingImages(prev => [...prev, { url: result, color: 'All', isThumbnail: prev.length === 0 }]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const toggleThumbnail = (index: number) => {
        setListingImages(prev => prev.map((img, i) => ({ ...img, isThumbnail: i === index })));
    };

    const updateImageColor = (index: number, color: string) => {
        setListingImages(prev => prev.map((img, i) => i === index ? { ...img, color } : img));
    };

    const addProductColor = () => {
        setProductColors(prev => [...prev, { name: 'New Color', hex: '#000000' }]);
    };

    const updateProductColor = (index: number, field: keyof ProductColor, value: string) => {
        setProductColors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const removeProductColor = (index: number) => {
        if (productColors.length <= 1) {
            showToast('You must have at least one color', 'error');
            return;
        }
        setProductColors(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'editor' | 'preview') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            const result = f.target?.result as string;
            setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, [type === 'editor' ? 'editorImage' : 'image']: result } : v));
        };
        reader.readAsDataURL(file);
    };

    const addView = () => {
        const newId = `view-${views.length + 1}`;
        setViews(prev => [...prev, { ...defaultView, id: newId, name: `View ${views.length + 1}` }]);
        setActiveViewId(newId);
    };

    const activeView = views.find(v => v.id === activeViewId);

    // Render Steps
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50 text-gray-900 font-sans">

            {/* WIZARD HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 z-40">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
                            <p className="text-sm text-gray-500">Follow the steps to configure your product.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">Back</button>
                            {currentStep < 4 ? (
                                <button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">Next <ChevronRight size={16} /></button>
                            ) : (
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                                    {isSaving ? 'Saving...' : 'Save Product'} <Save size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-300" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

                        {STEPS.map((step) => (
                            <div key={step.id} onClick={() => setCurrentStep(step.id)} className={cn("flex flex-col items-center gap-2 cursor-pointer group", currentStep === step.id ? "opacity-100" : "opacity-60 hover:opacity-100")}>
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-4",
                                    currentStep >= step.id ? "bg-indigo-600 border-white text-white shadow-md" : "bg-gray-200 border-white text-gray-500",
                                    currentStep === step.id && "ring-2 ring-indigo-600 ring-offset-2"
                                )}>
                                    {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs font-bold text-gray-900">{step.title}</span>
                                    <span className="hidden sm:block text-[10px] text-gray-500">{step.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WIZARD CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* STEP 1: BASIC INFO */}
                {currentStep === 1 && (
                    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Let's start with the basics</h3>
                            <p className="text-gray-500">Define your product identity.</p>
                        </div>

                        <div className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Vintage Wash Tee" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <input type="checkbox" id="trending" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="trending" className="text-sm font-medium text-gray-900 cursor-pointer select-none">Mark as Trending Product</label>
                            </div>
                        </div>

                        {/* Product Colors */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900">Product Colors</h4>
                                <button onClick={addProductColor} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                    <Plus size={14} /> Add Color
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">Define the available colors and their hex codes.</p>
                            <div className="space-y-3">
                                {productColors.map((color, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color.hex }}></div>
                                        <input
                                            type="text"
                                            value={color.name}
                                            onChange={(e) => updateProductColor(idx, 'name', e.target.value)}
                                            placeholder="Color Name"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        />
                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-32">
                                            <span className="text-gray-400 text-sm">#</span>
                                            <input
                                                type="text"
                                                value={color.hex.replace('#', '')}
                                                onChange={(e) => updateProductColor(idx, 'hex', `#${e.target.value}`)}
                                                placeholder="HEX"
                                                className="w-full bg-transparent outline-none text-sm uppercase font-mono"
                                            />
                                        </div>
                                        <button onClick={() => removeProductColor(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Listing Images */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <h4 className="font-bold text-gray-900">Listing Images</h4>
                            <p className="text-sm text-gray-500">Upload additional shots and link them to colors.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {listingImages.map((img, i) => (
                                    <div key={i} className="flex gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50 relative group">
                                        <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={img.url} alt="listing" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Link to Color</label>
                                                <select
                                                    value={img.color}
                                                    onChange={(e) => updateImageColor(i, e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 outline-none"
                                                >
                                                    <option value="All">All Colors</option>
                                                    {productColors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div onClick={() => toggleThumbnail(i)} className="flex items-center gap-2 cursor-pointer select-none">
                                                <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-all", img.isThumbnail ? "border-indigo-600 bg-indigo-600" : "border-gray-300 bg-white")}>
                                                    {img.isThumbnail && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <span className={cn("text-xs font-medium", img.isThumbnail ? "text-indigo-600" : "text-gray-500")}>Set as Thumbnail</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setListingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-[4/1] sm:aspect-auto border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all min-h-[120px]">
                                    <Plus className="text-gray-400 mb-2" />
                                    <span className="text-xs font-medium text-gray-500">Add Images</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleListingImageUpload} />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: VISUAL EDITOR */}
                {currentStep === 2 && (
                    <div className="flex flex-col lg:flex-row h-full">
                        {/* SIDEBAR */}
                        <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col z-20">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-xs uppercase text-gray-500 tracking-wider">Configuration</h3>
                                <button onClick={addView} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 text-indigo-600">+ Add View</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div className="grid grid-cols-2 gap-2">
                                    {views.map(view => (
                                        <button key={view.id} onClick={() => setActiveViewId(view.id)} className={cn("text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all", activeViewId === view.id ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}>
                                            {view.name}
                                        </button>
                                    ))}
                                </div>
                                {activeViewsConfig(views, activeViewId, setViews, handleImageUpload)}
                            </div>
                        </div>

                        {/* CANVAS */}
                        <div className="flex-1 relative bg-[#09090b] flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

                            <div className="absolute top-6 flex gap-2 z-30">
                                <button onClick={() => setViewMode('editor')} className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2", viewMode === 'editor' ? "bg-zinc-800 text-blue-400 border border-zinc-700" : "text-zinc-500")}>
                                    <div className={cn("w-2 h-2 rounded-full", viewMode === 'editor' ? "bg-blue-500" : "bg-zinc-600")} /> Editor Zone
                                </button>
                                <button onClick={() => setViewMode('preview')} className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2", viewMode === 'preview' ? "bg-zinc-800 text-green-400 border border-zinc-700" : "text-zinc-500")}>
                                    <div className={cn("w-2 h-2 rounded-full", viewMode === 'preview' ? "bg-green-500" : "bg-zinc-600")} /> Preview Zone
                                </button>
                            </div>

                            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-zinc-800 bg-[#111]" style={{ width: 600, height: 600 }}>
                                {activeView && (
                                    <img
                                        src={viewMode === 'editor' && activeView.editorImage ? activeView.editorImage : activeView.image}
                                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-100"
                                        alt="background"
                                    />
                                )}
                                <div className="absolute inset-0 w-full h-full origin-top-left" style={{ transform: 'scale(0.5859375)', width: 1024, height: 1024 }}>
                                    <canvas ref={canvasRef} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: RICH DETAILS */}
                {currentStep === 3 && (
                    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">Tell your product's story</h3>
                            <p className="text-gray-500">Add rich details to engage customers.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Catchy summary..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Story</label>
                                <textarea value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Detailed description..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900">Features</h4>
                                    <button onClick={() => setFeatures([...features, { title: '', description: '', icon: 'check' }])} className="text-xs text-indigo-600 font-medium">+ Add</button>
                                </div>
                                <div className="space-y-3">
                                    {features.map((f, i) => (
                                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                            <input type="text" placeholder="Title" value={f.title} onChange={(e) => { const n = [...features]; n[i].title = e.target.value; setFeatures(n) }} className="w-full bg-transparent text-sm font-bold placeholder-gray-400 outline-none" />
                                            <textarea placeholder="Description" value={f.description} onChange={(e) => { const n = [...features]; n[i].description = e.target.value; setFeatures(n) }} className="w-full bg-transparent text-xs text-gray-600 resize-none outline-none h-10" />
                                            <button onClick={() => setFeatures(prev => prev.filter((_, idx) => idx !== i))} className="text-[10px] text-red-500">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900">Care Instructions</h4>
                                    <button onClick={() => setCareInstructions([...careInstructions, ''])} className="text-xs text-indigo-600 font-medium">+ Add</button>
                                </div>
                                <div className="space-y-3">
                                    {careInstructions.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input type="text" value={c} onChange={(e) => { const n = [...careInstructions]; n[i] = e.target.value; setCareInstructions(n) }} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="e.g. Machine wash cold" />
                                            <button onClick={() => setCareInstructions(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 p-2"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: SIZE GUIDE & REVIEW */}
                {currentStep === 4 && (
                    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">Size Guide & Review</h3>
                            <p className="text-gray-500">Configure sizing and verify data before saving.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-6">Size Char Configuration</h4>
                            <SizeGuideEditor data={sizeGuide} onChange={setSizeGuide} />
                        </div>

                        <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl overflow-hidden">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4">JSON Payload Preview</h4>
                            <pre className="text-[10px] text-zinc-400 font-mono overflow-auto max-h-60 custom-scrollbar">
                                {jsonOutput}
                            </pre>
                        </div>
                    </div>
                )}

            </div>
        </div >
    );
}

// Extracted UI helper for Step 2 Sidebar to keep main component cleaner
function activeViewsConfig(views: ViewConfig[], activeViewId: string, setViews: Function, handleImageUpload: Function) {
    const activeView = views.find(v => v.id === activeViewId);
    if (!activeView) return null;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">View Name</label>
                <input type="text" value={activeView.name} onChange={(e) => setViews((p: any) => p.map((v: any) => v.id === activeViewId ? { ...v, name: e.target.value } : v))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-500 uppercase">Editor Image (Cutout)</label>
                <label className="block w-full h-20 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer overflow-hidden relative group">
                    {activeView.editorImage ? <img src={activeView.editorImage} className="w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">Upload Cutout</div>}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'editor')} />
                </label>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-green-500 uppercase">Preview Image (Realistic)</label>
                <label className="block w-full h-20 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer overflow-hidden relative group">
                    {activeView.image ? <img src={activeView.image} className="w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">Upload Photo</div>}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'preview')} />
                </label>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">CSS Transform</label>
                <input type="text" placeholder="rotate(-2deg)" value={activeView.cssTransform || ''} onChange={(e) => setViews((p: any) => p.map((v: any) => v.id === activeViewId ? { ...v, cssTransform: e.target.value } : v))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono" />
            </div>
        </div>
    );
}
