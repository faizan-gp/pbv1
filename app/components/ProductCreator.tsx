'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useToast } from './Toast';
import { IProduct, IProductFeature } from '@/models/Product';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical } from 'lucide-react'; // Assuming lucide-react is available or use SVGs

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

interface ProductCreatorProps {
    initialData?: any; // Using any for flexibility with Mongoose document vs raw JSON
    isEditing?: boolean;
}

export default function ProductCreator({ initialData, isEditing = false }: ProductCreatorProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    // Initialize state with initialData if provided
    const [productName, setProductName] = useState(initialData?.name || 'New Product');

    // Map initial views or default to front view
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
            // Find corresponding images if they exist in the colors array for the default color
            // This is a simplification; a robust app might need complex mapping
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
    const [category, setCategory] = useState(initialData?.category || "Men's Clothing");
    const [trending, setTrending] = useState(initialData?.trending || false);
    const [listingImages, setListingImages] = useState<string[]>(initialData?.listingImages || []);

    // Rich Details State
    const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
    const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
    const [features, setFeatures] = useState<IProductFeature[]>(initialData?.features || []);
    const [careInstructions, setCareInstructions] = useState<string[]>(initialData?.careInstructions || []);
    const [sizeGuide, setSizeGuide] = useState(initialData?.sizeGuide || {
        metric: [
            { size: 'S', width: '45.7', length: '71.1', sleeve: '85' },
            { size: 'M', width: '50.8', length: '73.7', sleeve: '87.6' },
            { size: 'L', width: '55.9', length: '76.2', sleeve: '90.2' },
            { size: 'XL', width: '61', length: '78.7', sleeve: '92.7' },
            { size: '2XL', width: '66', length: '81.3', sleeve: '95.3' },
        ],
        imperial: [
            { size: 'S', width: '18', length: '28', sleeve: '33.5' },
            { size: 'M', width: '20', length: '29', sleeve: '34.5' },
            { size: 'L', width: '22', length: '30', sleeve: '35.5' },
            { size: 'XL', width: '24', length: '31', sleeve: '36.5' },
            { size: '2XL', width: '26', length: '32', sleeve: '37.5' },
        ]
    });

    // UI Tab State
    const [activeTab, setActiveTab] = useState<'config' | 'details'>('config');

    const [jsonOutput, setJsonOutput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Categories based on Printify
    const CATEGORIES = [
        "Men's Clothing",
        "Women's Clothing",
        "Kids' Clothing",
        "Accessories",
        "Home & Living",
    ];

    const CANVAS_SIZE = 1024;

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

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
        };
    }, []);

    // Handle Active View Change, View Mode & Canvas Updates
    useEffect(() => {
        if (!fabricCanvas) return;

        const activeView = views.find(v => v.id === activeViewId);
        if (!activeView) return;

        fabricCanvas.clear();
        fabricCanvas.backgroundColor = 'transparent';

        // Helper to create zone rects
        const createZoneRect = (zone: Zone, strokeColor: string, fillColor: string, id: string, label: string, visible: boolean) => {
            const rect = new fabric.Rect({
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: 2,
                cornerColor: '#ffffff',
                cornerStrokeColor: strokeColor,
                borderColor: strokeColor,
                cornerSize: 10,
                transparentCorners: false,
                selectable: visible, // Only selectable if visible
                evented: visible,
                hasControls: visible,
                hasBorders: visible,
                visible: visible, // Visibility toggle
                data: { id },
                strokeDashArray: [6, 6],
                borderOpacityWhenMoving: 0.8,
            });

            const text = new fabric.Text(label, {
                left: zone.left,
                top: zone.top - 24,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                fill: strokeColor,
                selectable: false,
                evented: false,
                visible: visible,
                data: { id: `${id}-label` },
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: 4,
            });

            return { rect, text };
        };

        // Editor Zone (Blue) - Visible ONLY in Editor Mode
        const editor = createZoneRect(
            activeView.editorZone,
            '#3b82f6', // blue-500
            'rgba(59, 130, 246, 0.1)',
            'editor-zone',
            'EDITOR ZONE',
            viewMode === 'editor'
        );
        fabricCanvas.add(editor.rect, editor.text);

        // Preview Zone (Green) - Visible ONLY in Preview Mode
        const preview = createZoneRect(
            activeView.previewZone,
            '#22c55e', // green-500
            'rgba(34, 197, 94, 0.1)',
            'preview-zone',
            'PREVIEW ZONE',
            viewMode === 'preview'
        );
        fabricCanvas.add(preview.rect, preview.text);

        // Event Listeners for updating state
        const updateState = () => {
            const editorObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone') as fabric.Rect;
            const previewObj = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone') as fabric.Rect;

            // Update labels pos
            const editorLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'editor-zone-label') as fabric.Text;
            const previewLabel = fabricCanvas.getObjects().find(o => (o as any).data?.id === 'preview-zone-label') as fabric.Text;

            if (editorObj && editorLabel && editorObj.visible) {
                editorLabel.set({ left: editorObj.left, top: (editorObj.top || 0) - 24 });
            }
            if (previewObj && previewLabel && previewObj.visible) {
                previewLabel.set({ left: previewObj.left, top: (previewObj.top || 0) - 24 });
            }

            // Sync state
            setViews(prev => prev.map(v => {
                if (v.id === activeViewId) {
                    const updatedView = { ...v };

                    if (editorObj && viewMode === 'editor') {
                        updatedView.editorZone = {
                            left: Math.round(editorObj.left || 0),
                            top: Math.round(editorObj.top || 0),
                            width: Math.round((editorObj.width || 0) * (editorObj.scaleX || 1)),
                            height: Math.round((editorObj.height || 0) * (editorObj.scaleY || 1)),
                        };
                    }

                    if (previewObj && viewMode === 'preview') {
                        updatedView.previewZone = {
                            left: Math.round(previewObj.left || 0),
                            top: Math.round(previewObj.top || 0),
                            width: Math.round((previewObj.width || 0) * (previewObj.scaleX || 1)),
                            height: Math.round((previewObj.height || 0) * (previewObj.scaleY || 1)),
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
    }, [fabricCanvas, activeViewId, viewMode]); // Re-run when viewMode changes

    // Update JSON Output
    useEffect(() => {
        // Fallback: If no explicit editor image, use generic image or nothing
        // Structure needs to match Mongoose schema
        const config = {
            id: isEditing && initialData?.id ? initialData.id : productName.toLowerCase().replace(/\s+/g, '-'), // Keep ID if editing
            name: productName,
            category,
            trending,
            image: views[0]?.editorImage || views[0]?.image || '', // Prefer Editor Image (Cutout) for main 'image' field
            listingImages,
            shortDescription,
            fullDescription,
            features,
            careInstructions,
            sizeGuide,
            canvasSize: CANVAS_SIZE,
            // Create a default color entry that contains the preview images
            colors: [{
                name: 'Default',
                hex: '#ffffff',
                images: views.reduce((acc, v) => ({ ...acc, [v.id]: v.image }), {})
            }],
            designZone: views[0]?.editorZone,
            previews: views.map(v => ({
                id: v.id,
                name: v.name,
                editorZone: v.editorZone,
                previewZone: v.previewZone,
                displacementMap: v.displacementMap,
                shadowMap: v.shadowMap,
                editorCutout: v.editorImage, // Explicitly save editor cutout
                cssTransform: v.cssTransform
            }))
        };
        setJsonOutput(JSON.stringify(config, null, 4));
    }, [views, productName, category, trending, listingImages, shortDescription, fullDescription, features, careInstructions, sizeGuide, isEditing, initialData]);


    const handleListingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (f) => {
                const result = f.target?.result as string;
                if (result) {
                    setListingImages(prev => [...prev, result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeListingImage = (index: number) => {
        setListingImages(prev => prev.filter((_, i) => i !== index));
    };


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'editor' | 'preview') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (f) => {
            const result = f.target?.result as string;
            setViews(prev => prev.map(v =>
                v.id === activeViewId
                    ? { ...v, [type === 'editor' ? 'editorImage' : 'image']: result }
                    : v
            ));
        };
        reader.readAsDataURL(file);
    };

    const addView = () => {
        const newId = `view-${views.length + 1}`;
        setViews(prev => [...prev, {
            id: newId,
            name: `View ${views.length + 1}`,
            image: '',
            editorImage: '',
            editorZone: { left: 312, top: 262, width: 400, height: 500 },
            previewZone: { left: 312, top: 262, width: 400, height: 500 },
        }]);
        setActiveViewId(newId);
    };

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
                showToast(isEditing ? 'Product updated successfully!' : 'Product created successfully!', 'success');
                if (!isEditing) {
                    // Reset form only if creating
                    setProductName('');
                    setViews([defaultView]);
                    setActiveViewId('front');
                    setJsonOutput('');
                    setTrending(false);
                } else {
                    router.refresh(); // Refresh if editing to update server data
                }
            } else {
                showToast(data.error || 'Failed to save product', 'error');
            }
        } catch (e) {
            showToast('An error occurred while saving', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const activeView = views.find(v => v.id === activeViewId);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white text-gray-900 font-sans">
            {/* Left Sidebar: Controls */}
            <div className="w-full lg:w-80 bg-gray-50 border-r border-gray-200 flex flex-col z-20 shadow-xl">
                {/* Sidebar Header */}
                <div className="p-5 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">{isEditing ? 'Edit Product' : 'Configurator'}</h2>
                            <div className="text-[10px] text-gray-500 font-mono mt-1">v2.2.0</div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'config' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'details' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Details & SEO
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    {activeTab === 'config' ? (
                        <>
                            {/* SECTION 1: Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Settings</h3>
                                </div>
                                {/* Product Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="e.g. Premium Cotton Tee"
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-400 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-900"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="trending"
                                            checked={trending}
                                            onChange={(e) => setTrending(e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                        <label htmlFor="trending" className="text-xs font-medium text-gray-900 cursor-pointer select-none">Trending Product</label>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200/50" />

                            {/* SECTION: Listing Gallery */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Listing Gallery</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {listingImages.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={img} alt={`Listing ${i}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeListingImage(i)}
                                                    className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-purple-400 transition-all text-gray-400 hover:text-purple-500">
                                            <span className="text-2xl">+</span>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleListingImageUpload} />
                                        </label>
                                    </div>
                                    <div className="text-[10px] text-gray-400">Add extra images for the product page.</div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200/50" />

                            {/* SECTION 2: Views */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Views</h3>
                                    </div>
                                    <button
                                        onClick={addView}
                                        className="text-[10px] px-2 py-1 bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                        <span className="text-emerald-600 text-lg leading-none">+</span> New
                                    </button>
                                </div>

                                {/* View Tabs */}
                                <div className="grid grid-cols-2 gap-2">
                                    {views.map(view => (
                                        <button
                                            key={view.id}
                                            onClick={() => setActiveViewId(view.id)}
                                            className={`relative px-3 py-2 text-xs font-medium rounded-md text-left transition-all border ${activeViewId === view.id
                                                ? 'bg-white border-indigo-500/50 text-indigo-600 ring-1 ring-indigo-500/20 shadow-sm'
                                                : 'bg-gray-100 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                }`}
                                        >
                                            <span className="truncate block">{view.name}</span>
                                            {activeViewId === view.id && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full box-shadow" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Active View Details */}
                                {activeView && (
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4 shadow-sm">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-medium text-gray-500">VIEW LABEL</label>
                                            <input
                                                type="text"
                                                value={activeView.name}
                                                onChange={(e) => setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, name: e.target.value } : v))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-900 focus:border-indigo-500 outline-none"
                                            />
                                        </div>

                                        {/* EDITOR IMAGE INPUT (CUTOUT) */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-medium text-blue-600">EDITOR IMAGE (CUTOUT)</label>
                                                <span className="text-[10px] text-gray-500">For 2D Editor</span>
                                            </div>
                                            <label className="relative group flex flex-col items-center justify-center w-full h-16 border border-gray-300 border-dashed rounded cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all overflow-hidden bg-gray-50/50">
                                                {activeView.editorImage ? (
                                                    <>
                                                        <img src={activeView.editorImage} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="editor-v" />
                                                        <div className="relative z-10 flex items-center gap-1.5 text-blue-600 text-xs font-medium bg-white/90 px-2 py-1 rounded shadow-sm">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2"><polyline points="20 6 9 17 4 12" /></svg>
                                                            Set
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <span className="text-[10px] text-gray-400 group-hover:text-gray-600">Upload SVG/PNG</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'editor')} />
                                            </label>
                                        </div>

                                        {/* PREVIEW IMAGE INPUT (REAL) */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-medium text-emerald-600">PREVIEW IMAGE (REAL)</label>
                                                <span className="text-[10px] text-gray-500">For 3D Preview</span>
                                            </div>
                                            <label className="relative group flex flex-col items-center justify-center w-full h-16 border border-gray-300 border-dashed rounded cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all overflow-hidden bg-gray-50/50">
                                                {activeView.image ? (
                                                    <>
                                                        <img src={activeView.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="preview-v" />
                                                        <div className="relative z-10 flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-white/90 px-2 py-1 rounded shadow-sm">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2"><polyline points="20 6 9 17 4 12" /></svg>
                                                            Set
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <span className="text-[10px] text-gray-400 group-hover:text-gray-600">Upload Photo</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'preview')} />
                                            </label>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-medium text-gray-500">CSS TRANSFORM</label>
                                            <input
                                                type="text"
                                                value={activeView.cssTransform || ''}
                                                placeholder="rotate(-2deg)"
                                                onChange={(e) => setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, cssTransform: e.target.value } : v))}
                                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-600 placeholder-gray-400 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* DETAILS TAB CONTENT */
                        <div className="space-y-6">
                            {/* Short Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Description</label>
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder="Brief summary for top of page..."
                                    className="w-full h-20 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-900 resize-none"
                                />
                            </div>

                            {/* Full Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About Product</label>
                                <textarea
                                    value={fullDescription}
                                    onChange={(e) => setFullDescription(e.target.value)}
                                    placeholder="Detailed product story..."
                                    className="w-full h-32 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-gray-900 resize-none"
                                />
                            </div>

                            <div className="h-px bg-gray-200/50" />

                            {/* Features */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Key Features</label>
                                    <button
                                        onClick={() => setFeatures([...features, { title: '', description: '', icon: 'check' }])}
                                        className="text-indigo-600 text-xs font-medium hover:underline"
                                    >
                                        + Add Feature
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {features.map((feature, i) => (
                                        <div key={i} className="flex gap-2 items-start bg-gray-50 p-2 rounded border border-gray-200">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Feature Title"
                                                    value={feature.title}
                                                    onChange={(e) => {
                                                        const newFeatures = [...features];
                                                        newFeatures[i].title = e.target.value;
                                                        setFeatures(newFeatures);
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                                                />
                                                <textarea
                                                    placeholder="Description"
                                                    value={feature.description}
                                                    onChange={(e) => {
                                                        const newFeatures = [...features];
                                                        newFeatures[i].description = e.target.value;
                                                        setFeatures(newFeatures);
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs resize-none h-12"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-200/50" />

                            {/* Care Instructions */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Care Instructions</label>
                                    <button
                                        onClick={() => setCareInstructions([...careInstructions, ''])}
                                        className="text-indigo-600 text-xs font-medium hover:underline"
                                    >
                                        + Add Instruction
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {careInstructions.map((inst, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inst}
                                                onChange={(e) => {
                                                    const newCare = [...careInstructions];
                                                    newCare[i] = e.target.value;
                                                    setCareInstructions(newCare);
                                                }}
                                                className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-xs"
                                            />
                                            <button
                                                onClick={() => setCareInstructions(careInstructions.filter((_, idx) => idx !== i))}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-200 bg-white space-y-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:translate-y-px"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
                            </>
                        )}
                    </button>

                    <details className="group">
                        <summary className="text-[10px] uppercase text-gray-500 cursor-pointer hover:text-gray-700 list-none flex justify-center items-center gap-1">
                            <span>Raw Data</span>
                        </summary>
                        <div className="absolute left-[340px] bottom-5 w-80 p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50">
                            <h4 className="text-[10px] font-bold text-zinc-500 mb-2 uppercase">Debug Output</h4>
                            <textarea readOnly value={jsonOutput} className="w-full h-40 bg-zinc-950 text-[10px] text-zinc-400 font-mono p-2 rounded border border-zinc-800 resize-none outline-none" />
                        </div>
                    </details>
                </div>
            </div >

            {/* Main Canvas Area */}
            < div className="flex-1 relative bg-[#09090b] flex flex-col items-center justify-center overflow-hidden" >

                {/* Canvas Background Pattern */}
                < div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }
                    }
                />

                {/* Toolbar / Mode Switcher */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/95 backdrop-blur border border-zinc-800 p-1 rounded-full shadow-2xl z-30">
                    <button
                        onClick={() => setViewMode('editor')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-xs font-medium ${viewMode === 'editor'
                            ? 'bg-zinc-800 text-blue-400 shadow-sm border border-zinc-700/50'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${viewMode === 'editor' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-current opacity-20'}`}></div>
                        Editor Zone
                    </button>
                    <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-xs font-medium ${viewMode === 'preview'
                            ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/50'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${viewMode === 'preview' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-current opacity-20'}`}></div>
                        Preview Zone
                    </button>
                </div>

                {/* Workspace */}
                <div className="relative z-10 p-10 flex items-center justify-center w-full h-full">
                    <div className="transform scale-[0.45] md:scale-[0.55] lg:scale-[0.65] xl:scale-[0.75] transition-transform origin-center">
                        <div className="bg-white rounded-lg shadow-2xl ring-1 ring-zinc-800 overflow-hidden relative" style={{ width: '1024px', height: '1024px' }}>

                            {/* Image Layer - Dynamic based on Mode */}
                            {/* Editor Mode Image */}
                            <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'editor' ? 'opacity-100' : 'opacity-0'}`}>
                                {activeView?.editorImage ? (
                                    <img src={activeView.editorImage} className="w-full h-full object-contain pointer-events-none select-none opacity-90" alt="editor-bg" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-300">
                                        <div className="text-center">
                                            <p className="text-xs font-medium mb-1">No Editor Image</p>
                                            <p className="text-[10px]">Upload "Editor Image" to see guide</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Preview Mode Image */}
                            <div className={`absolute inset-0 transition-opacity duration-300 ${viewMode === 'preview' ? 'opacity-100' : 'opacity-0'}`}>
                                {activeView?.image ? (
                                    <img src={activeView.image} className="w-full h-full object-contain pointer-events-none select-none" alt="preview-bg" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-300">
                                        <div className="text-center">
                                            <p className="text-xs font-medium mb-1">No Preview Image</p>
                                            <p className="text-[10px]">Upload "Preview Image" to see context</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Interactive Canvas */}
                            <div className="absolute inset-0 w-full h-full">
                                <canvas ref={canvasRef} className="w-full h-full" />
                            </div>
                        </div>

                        {/* Size Indicator */}
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-zinc-500 text-xs font-mono tracking-widest uppercase bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                            Canvas: 1024px × 1024px
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
