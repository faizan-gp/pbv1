'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useToast } from './Toast';
import { Product as IProduct, IProductFeature } from '@/lib/firestore/products';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, X, Check, Loader2, ArrowUp, ArrowDown, GripVertical, CheckCircle, ChevronRight, ChevronLeft, Save, FolderUp, Link2, DollarSign, Truck, Package } from 'lucide-react';
import { uploadProductImage } from '@/lib/storage';
import SizeGuideEditor from './SizeGuideEditor';
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    fileName?: string;
}

interface ProductColor {
    name: string;
    hex: string;
    images: Record<string, string>; // Map viewId -> imageUrl
    printifyVariantIds?: number[];
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
    const [category, setCategory] = useState(initialData?.category || "");
    const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
    const [categories, setCategories] = useState<any[]>([]);
    const [trending, setTrending] = useState(initialData?.trending || false);
    const [price, setPrice] = useState(initialData?.price || '');
    const [shippingCost, setShippingCost] = useState(initialData?.shippingCost || 0);
    const [shippingTime, setShippingTime] = useState(initialData?.shippingTime || '');
    const [productionTime, setProductionTime] = useState(initialData?.productionTime || '');
    const [previewExpectationImage, setPreviewExpectationImage] = useState(initialData?.previewExpectationImage || '');
    const [realExpectationImage, setRealExpectationImage] = useState(initialData?.realExpectationImage || '');
    const [printifyBlueprintId, setPrintifyBlueprintId] = useState(initialData?.printifyBlueprintId || '');
    const [printifyProviderId, setPrintifyProviderId] = useState(initialData?.printifyProviderId || '');

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.success) {
                    const categoriesArray = Object.values(data.data);
                    setCategories(categoriesArray);
                    // Default to first category if none selected
                    // @ts-ignore
                    if (!initialData?.category && categoriesArray.length > 0) {
                        // @ts-ignore
                        setCategory(categoriesArray[0].name);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch categories", e);
            }
        };
        fetchCategories();
    }, []);

    const selectedCategoryData = categories.find(c => c.name === category);

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
            return initialData.colors.map((c: any) => ({
                name: c.name,
                hex: c.hex,
                images: c.images || {},
                printifyVariantIds: c.printifyVariantIds || []
            }));
        }
        return [{ name: 'Default', hex: '#ffffff', images: {} }];
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
    const [bulletPoints, setBulletPoints] = useState<string[]>(initialData?.bulletPoints || []);
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
    const [faq, setFaq] = useState<{ question: string; answer: string }[]>(initialData?.faq || []);

    const [jsonOutput, setJsonOutput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);



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


    // HELPERS
    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    // JSON PREVIEW & SAVE LOGIC
    useEffect(() => {
        const thumbnail = listingImages.find(img => img.isThumbnail);
        const mainImage = thumbnail ? thumbnail.url : (views[0]?.editorImage || views[0]?.image || '');

        // Determine ID:
        // 1. If editing and name hasn't changed (or matches old slug), keep old ID. (Actually, if name matches old slug, re-slugifying is fine).
        // 2. If name changed, we want to update the ID (User Request).
        // However, we must be careful: if the user opens "My Shirt" (id: 123) and doesn't touch it, we shouldn't change ID to "my-shirt" automatically on save?
        // But the user SAID: "If i rename the title, the id should update as well"
        // This implies if they *rename* it.
        // If initialData.name === productName, we can keep initialData.id to be safe?
        // But if initialData.name === productName, slugify(productName) might NOT match initialData.id (legacy IDs).
        // So: If name is unchanged, keep ID. If name is changed, generate new slug.

        const isNameChanged = !isEditing || (initialData?.name !== productName);
        const generatedId = (!isNameChanged && initialData?.id)
            ? initialData.id
            : (productName ? slugify(productName) : 'new-product-id');

        const config = {
            id: generatedId,
            name: productName,
            category,
            subcategory,
            trending,
            price: Number(price),
            shippingCost: Number(shippingCost),
            shippingTime,
            productionTime,
            previewExpectationImage,
            realExpectationImage,
            image: mainImage,
            listingImages,
            shortDescription,
            fullDescription,
            features,
            bulletPoints,
            careInstructions,
            faq,
            sizeGuide,
            canvasSize: 1024,
            colors: productColors.map(c => ({
                name: c.name,
                hex: c.hex,
                images: {
                    ...views.reduce((acc, v) => ({ ...acc, [v.id]: v.image }), {}),
                    ...(c.images || {})
                },
                printifyVariantIds: c.printifyVariantIds || []
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
            })),
            printifyBlueprintId: Number(printifyBlueprintId),
            printifyProviderId: Number(printifyProviderId)
        };
        setJsonOutput(JSON.stringify(config, null, 4));
    }, [views, productName, category, subcategory, trending, price, shippingCost, shippingTime, productionTime, previewExpectationImage, realExpectationImage, listingImages, shortDescription, fullDescription, features, bulletPoints, careInstructions, faq, sizeGuide, isEditing, initialData, productColors, printifyBlueprintId, printifyProviderId]);


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
    const handleListingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetColor: string = 'All') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => uploadProductImage(file, 'listings', productName));
            const urls = await Promise.all(uploadPromises);

            setListingImages(prev => [
                ...prev,
                ...urls.map((url, i) => ({
                    url,
                    color: targetColor,
                    isThumbnail: prev.length === 0 && i === 0,
                    fileName: files[i].name // Store filename
                }))
            ]);
        } catch (error) {
            console.error("Upload failed", error);
            showToast('Failed to upload images', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBulkFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            // Group files by Color Folder
            const filesByColor: Record<string, File[]> = {};
            const colors = productColors.map(c => c.name.toLowerCase()); // Normalize for comparison

            Array.from(files).forEach(file => {
                // webkitRelativePath format: "RootFolder/ColorFolder/Image.jpg"
                const pathParts = file.webkitRelativePath.split('/');
                if (pathParts.length < 3) return; // Needs at least Root/Color/Image

                // Specifically look for the folder that matches a color
                // IMPORTANT: The structure is Root/Color/Image. 
                // Color folder is at index [1] (0-indexed).
                const colorFolder = pathParts[1].toLowerCase();

                // Check if this folder matches a product color (or "All")
                const matchingColor = productColors.find(c => c.name.toLowerCase() === colorFolder);
                const targetColor = matchingColor ? matchingColor.name : (colorFolder === 'all' ? 'All' : null);

                if (targetColor) {
                    if (!filesByColor[targetColor]) filesByColor[targetColor] = [];
                    filesByColor[targetColor].push(file);
                }
            });

            // Process each color group
            const newImages: ListingImage[] = [];

            for (const [colorName, colorFiles] of Object.entries(filesByColor)) {
                // Upload images in batches
                const uploadedUrls = await Promise.all(
                    colorFiles.map(file => uploadProductImage(file, 'listings', productName))
                );

                // Map files to URLs to identifying thumbnail candidates
                colorFiles.forEach((file, index) => {
                    const url = uploadedUrls[index];
                    const filename = file.name.toLowerCase();
                    const isListingImage = filename.includes('listing');

                    newImages.push({
                        url,
                        color: colorName,
                        isThumbnail: isListingImage, // Temporary flag, resolved later
                        fileName: file.name
                    });
                });
            }

            setListingImages(prev => {
                const combined = [...prev, ...newImages];

                // Refine Thumbnail Logic:
                // For each color group added, if there's an image flagged as 'isListingImage', make it the thumbnail? 
                // Or user said "the image with the name listing should be used for thumbnail. If not exist, then use the first image found."
                // Wait, "Thumbnail" usually refers to the MAIN product thumbnail (one per product). 
                // OR does it mean "Main image for this color"?
                // The current data model has `isThumbnail` boolean on `ListingImage`.
                // Usually only ONE image in the ENTIRE list is `isThumbnail`. 
                // IF that's the case, we should only set `isThumbnail` if no thumbnail exists yet.

                // Let's assume GLOBAL thumbnail.
                let hasGlobalThumbnail = prev.some(img => img.isThumbnail);

                if (!hasGlobalThumbnail && combined.length > 0) {
                    // Try to find one named "listing"
                    const priorityThumbnail = newImages.find(img => img.isThumbnail); // isThumbnail was set based on filename above

                    if (priorityThumbnail) {
                        // Unset others just in case (though newImages logic didn't enforce uniqueness)
                        return combined.map(img => ({
                            ...img,
                            isThumbnail: img.url === priorityThumbnail.url
                        }));
                    } else if (prev.length === 0 && newImages.length > 0) {
                        // Fallback: First image
                        combined[0].isThumbnail = true;
                    }
                } else {
                    // Ensure we don't accidentally set multiple thumbnails if we already had one
                    // The `newImages` might have `isThumbnail: true` from the filename check. 
                    // If we already have a thumbnail, force these to false.
                    if (hasGlobalThumbnail) {
                        return combined.map(img => ({
                            ...img,
                            isThumbnail: prev.some(p => p.url === img.url && p.isThumbnail)
                        }));
                    } else {
                        // We don't have a thumbnail, and maybe multiple new images have "listing" in name. 
                        // Pick the first "listing" one.
                        const firstListing = combined.find(img => img.isThumbnail);
                        if (firstListing) {
                            return combined.map(img => ({ ...img, isThumbnail: img === firstListing }));
                        } else {
                            // No listing images, pick absolute first
                            return combined.map((img, i) => ({ ...img, isThumbnail: i === 0 }));
                        }
                    }
                }

                return combined;
            });

            showToast(`Uploaded ${newImages.length} images`, 'success');

        } catch (error) {
            console.error("Bulk upload failed", error);
            showToast('Failed to upload images', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // DRAG AND DROP SETUP
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const moveListingImage = (image: ListingImage, direction: 'left' | 'right') => {
        setListingImages(prev => {
            const newList = [...prev];
            const currentIndex = newList.indexOf(image);
            if (currentIndex === -1) return prev;

            // Find swap target: next/prev item OF THE SAME COLOR
            let swapIndex = -1;
            if (direction === 'left') {
                for (let i = currentIndex - 1; i >= 0; i--) {
                    if (newList[i].color === image.color) {
                        swapIndex = i;
                        break;
                    }
                }
            } else {
                for (let i = currentIndex + 1; i < newList.length; i++) {
                    if (newList[i].color === image.color) {
                        swapIndex = i;
                        break;
                    }
                }
            }

            if (swapIndex !== -1) {
                // Swap
                [newList[currentIndex], newList[swapIndex]] = [newList[swapIndex], newList[currentIndex]];
                return newList;
            }

            return prev;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setListingImages((items) => {
                const oldIndex = items.findIndex((item) => item.url === active.id);
                const newIndex = items.findIndex((item) => item.url === over?.id);

                // 1. Perform the primary reorder
                const reorderedItems = arrayMove(items, oldIndex, newIndex);

                // 2. Identify the source color group of the moved item
                const movedItem = items[oldIndex];
                if (!movedItem || !movedItem.color || movedItem.color === 'All') {
                    // If moving in 'All' or unknown context, just return simple reorder
                    // Or if we want 'All' to also sync? Let's assume Color Variatents is the main goal.
                    return reorderedItems;
                }

                // 3. Extract the new filename sequence for this color group
                const sourceColor = movedItem.color;
                const sourceGroupItems = reorderedItems.filter(img => img.color === sourceColor);
                const sourceFilenames = sourceGroupItems.map(img => img.fileName).filter(Boolean) as string[];

                if (sourceFilenames.length === 0) return reorderedItems;

                // 4. Propagate this order to ALL other groups
                // We want to reorder other groups to match 'sourceFilenames' order as best as possible.
                // Strategy: For each other color, extract their items, sort them to match sourceFilenames index, then reconstruct the master list.

                // We'll rebuild the entire list to be safe.
                const newMasterList: ListingImage[] = [];
                const groups: Record<string, ListingImage[]> = {};

                // Group all items
                reorderedItems.forEach(img => {
                    const g = img.color || 'All';
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(img);
                });

                // Process each group
                Object.keys(groups).forEach(groupName => {
                    if (groupName === sourceColor) {
                        // Already sorted correctly in the reorderedItems, just take them
                        newMasterList.push(...groups[groupName]);
                    } else {
                        // Reorder this group to match sourceFilenames
                        const groupItems = groups[groupName];

                        // Separate items that have matching filenames and those that don't
                        const sortedMatches: ListingImage[] = [];
                        const leftovers: ListingImage[] = [];

                        // We iterate through the SOURCE pattern to determine order
                        sourceFilenames.forEach(filename => {
                            const matchIndex = groupItems.findIndex(img => img.fileName === filename);
                            if (matchIndex !== -1) {
                                sortedMatches.push(groupItems[matchIndex]);
                                // Remove from groupItems search pool locally so we don't dupe? 
                                // Actually better to mark used.
                                // But since filenames should be unique within a color group (usually), find is okay.
                            }
                        });

                        // Note: The above only picks items present in Source. 
                        // We also need items in Group that are NOT in Source (leftovers).
                        // And items in Source that are NOT in Group (ignored).

                        groupItems.forEach(img => {
                            if (!img.fileName || !sourceFilenames.includes(img.fileName)) {
                                leftovers.push(img);
                            }
                        });

                        // If the group had items that matched source, we put them in source's order.
                        // Then append leftovers.
                        // Wait, what if the group has multiple files with same name? (Unlikely for listings but possible)
                        // The simplified logic: Filter groupItems by those in sourceFilenames, sort them by sourceFilenames.indexOf(img.fileName).

                        const matches = groupItems.filter(img => img.fileName && sourceFilenames.includes(img.fileName));
                        matches.sort((a, b) => {
                            return sourceFilenames.indexOf(a.fileName!) - sourceFilenames.indexOf(b.fileName!);
                        });

                        // Reconstruct group
                        // We put matches first? Or try to preserve relative positions of leftovers?
                        // "Reorder all files based on filenames" implies the filename order is paramount.
                        // So: Matches (sorted), then Leftovers.

                        newMasterList.push(...matches, ...leftovers);
                    }
                });

                return newMasterList;
            });
        }
    };

    const assignListingImageToView = (img: ListingImage, viewId: string, bulkByFilename: boolean = false) => {
        const targetColorName = img.color;
        if (!targetColorName || targetColorName === 'All') {
            showToast('Please set a specific color for this image first', 'error');
            return;
        }

        const imagesToAssign: { color: string, url: string }[] = [];

        // 1. Assign current image
        imagesToAssign.push({ color: targetColorName, url: img.url });

        // 2. Find matching filenames if bulk mode
        if (bulkByFilename && img.fileName) {
            // Find other images with same filename in other colors
            const siblings = listingImages.filter(other =>
                other.fileName === img.fileName &&
                other.color !== 'All' &&
                other.color !== targetColorName
            );

            siblings.forEach(sib => {
                // Check if this color already has an image for this view?
                // Overwrite behavior is assumed desired.
                imagesToAssign.push({ color: sib.color, url: sib.url });
            });
        }

        setProductColors(prev => prev.map(c => {
            const assignment = imagesToAssign.find(a => a.color === c.name);
            if (assignment) {
                return {
                    ...c,
                    images: {
                        ...(c.images || {}),
                        [viewId]: assignment.url
                    }
                };
            }
            return c;
        }));

        const viewName = views.find(v => v.id === viewId)?.name || 'View';
        if (bulkByFilename && imagesToAssign.length > 1) {
            showToast(`Assigned "${img.fileName}" to ${viewName} for ${imagesToAssign.length} colors`, 'success');
        } else {
            showToast(`Assigned to ${viewName} (${targetColorName})`, 'success');
        }
    };

    const SortableListingImage = ({ img, index, colorGroup }: { img: ListingImage, index: number, colorGroup: string }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({ id: img.url });

        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const menuRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    setIsMenuOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group aspect-square touch-none">
                {/* Image Container */}
                <div className="absolute inset-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <img src={img.url} className="w-full h-full object-cover" />

                    {/* Default Overlay Actions (Visible when menu closed) */}
                    {!isMenuOpen && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                            {/* Top Row: Reorder + Actions */}
                            <div className="flex justify-between items-center bg-black/50 rounded-lg p-1 backdrop-blur-sm">
                                <button
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={() => moveListingImage(img, 'left')}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
                                    title="Move Left"
                                >
                                    <ChevronLeft size={14} />
                                </button>

                                <div className="h-4 w-px bg-white/20 mx-1" />

                                {views.length > 0 && img.color !== 'All' && (
                                    <button
                                        onPointerDown={e => e.stopPropagation()}
                                        onClick={() => setIsMenuOpen(true)}
                                        className="p-1.5 text-white/70 hover:text-blue-400 hover:bg-white/20 rounded transition-colors"
                                        title="Assign to View"
                                    >
                                        <Link2 size={14} />
                                    </button>
                                )}

                                <button
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={() => {
                                        if (img.fileName) {
                                            // Delete all images with matching filename (bulk delete)
                                            setListingImages(prev => prev.filter(item => item.fileName !== img.fileName));
                                            showToast(`Deleted all variations of ${img.fileName}`, 'success');
                                        } else {
                                            // Fallback: Delete just this specific image instance
                                            setListingImages(prev => prev.filter(item => item !== img));
                                        }
                                    }}
                                    className="p-1.5 text-white/70 hover:text-red-400 hover:bg-white/20 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>

                                <div className="h-4 w-px bg-white/20 mx-1" />

                                <button
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={() => moveListingImage(img, 'right')}
                                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
                                    title="Move Right"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>

                            {/* Bottom Row: Set Main */}
                            <div
                                onPointerDown={e => e.stopPropagation()}
                                onClick={() => toggleThumbnail(listingImages.indexOf(img))}
                                className={cn(
                                    "py-1.5 text-[10px] text-center rounded-md font-bold cursor-pointer transition-colors backdrop-blur-md select-none border shadow-sm",
                                    img.isThumbnail
                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                        : "bg-white/90 border-transparent text-gray-800 hover:bg-white"
                                )}
                            >
                                {img.isThumbnail ? 'Thumbnail' : 'Set as Main'}
                            </div>
                        </div>
                    )}

                    {/* View Assignment Overlay Menu (Covers Image) */}
                    {isMenuOpen && (
                        <div
                            className="absolute inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-200"
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assign to View</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded p-0.5 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                                {views.map(v => (
                                    <div key={v.id} className="mb-1">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    assignListingImageToView(img, v.id, false);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="flex-1 text-left px-2 py-1.5 rounded-l text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between group/item"
                                            >
                                                <span className="truncate">{v.name}</span>
                                            </button>
                                            {img.fileName && (
                                                <button
                                                    onClick={() => {
                                                        assignListingImageToView(img, v.id, true);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="px-2 py-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-700 rounded-r border-l border-white transition-colors"
                                                    title={`Assign "${img.fileName}" to ${v.name} for ALL colors`}
                                                >
                                                    <span className="text-[10px] font-bold">ALL</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const toggleThumbnail = (index: number) => {
        setListingImages(prev => prev.map((img, i) => ({ ...img, isThumbnail: i === index })));
    };
    const updateImageColor = (index: number, color: string) => {
        setListingImages(prev => prev.map((img, i) => i === index ? { ...img, color } : img));
    };

    const addProductColor = () => {
        setProductColors(prev => [...prev, { name: 'New Color', hex: '#000000', images: {} }]);
    };

    const updateProductColor = (index: number, field: keyof ProductColor, value: any) => {
        setProductColors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const removeProductColor = (index: number) => {
        if (productColors.length <= 1) {
            showToast('You must have at least one color', 'error');
            return;
        }
        setProductColors(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'editor' | 'preview') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadProductImage(file, 'views', productName);
            setViews(prev => prev.map(v => v.id === activeViewId ? { ...v, [type === 'editor' ? 'editorImage' : 'image']: url } : v));
        } catch (error) {
            console.error("Upload failed", error);
            showToast('Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colorIndex: number, viewId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadProductImage(file, 'views', productName);
            setProductColors(prev => prev.map((c, i) => {
                if (i === colorIndex) {
                    return {
                        ...c,
                        images: {
                            ...(c.images || {}),
                            [viewId]: url
                        }
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("Upload failed", error);
            showToast('Failed to upload color variant image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const addView = () => {
        const newId = `view - ${views.length + 1} `;
        setViews(prev => [...prev, { ...defaultView, id: newId, name: `View ${views.length + 1} ` }]);
        setActiveViewId(newId);
    };

    const handleBulkColorVariantUploadForView = async (e: React.ChangeEvent<HTMLInputElement>, targetViewId: string, targetViewName: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const filesToUpload: { file: File, colorIndex: number }[] = [];
            const foundColors: string[] = [];

            // 1. Analyze files to find matches
            Array.from(files).forEach(file => {
                // Expected: Root/ColorName/ViewName.ext
                const pathParts = file.webkitRelativePath.split('/');
                if (pathParts.length < 3) return;

                const colorNameFolder = pathParts[1].toLowerCase(); // e.g., "black"
                const fileName = pathParts[pathParts.length - 1].toLowerCase(); // e.g., "front view.png"
                const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')); // e.g., "front view"

                // Check 1: Does Color Match?
                const matchedColorIndex = productColors.findIndex(c => c.name.toLowerCase() === colorNameFolder);
                if (matchedColorIndex === -1) return;

                // Check 2: Does View Name Match?
                if (nameWithoutExt !== targetViewName.trim().toLowerCase()) return;

                filesToUpload.push({ file, colorIndex: matchedColorIndex });
                if (!foundColors.includes(productColors[matchedColorIndex].name)) {
                    foundColors.push(productColors[matchedColorIndex].name);
                }
            });

            if (filesToUpload.length === 0) {
                showToast(`No matching images found for view: "${targetViewName}"`, 'error');
                return;
            }

            // 2. Upload and Update
            const uploadPromises = filesToUpload.map(({ file }) => uploadProductImage(file, 'views', productName));
            const uploadedUrls = await Promise.all(uploadPromises);

            // 3. Batch Update State
            setProductColors(prev => {
                const newColors = [...prev];
                filesToUpload.forEach((item, idx) => {
                    const url = uploadedUrls[idx];
                    const color = newColors[item.colorIndex];

                    newColors[item.colorIndex] = {
                        ...color,
                        images: {
                            ...(color.images || {}),
                            [targetViewId]: url
                        }
                    };
                });
                return newColors;
            });

            showToast(`Updated variants for: ${foundColors.join(', ')}`, 'success');

        } catch (error) {
            console.error("Bulk upload failed", error);
            showToast('Failed to bulk upload color variants', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBulkColorJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (!Array.isArray(json)) {
                    showToast('Invalid JSON format: Expected an array', 'error');
                    return;
                }

                const newColors: ProductColor[] = [];
                let invalidCount = 0;

                json.forEach((item: any) => {
                    if (item.name && item.hex) {
                        newColors.push({
                            name: item.name,
                            hex: item.hex,
                            images: {}
                        });
                    } else {
                        invalidCount++;
                    }
                });

                if (newColors.length === 0) {
                    showToast('No valid colors found in JSON', 'error');
                    return;
                }

                setProductColors(prev => {
                    // Filter out "Default" if it's the only one and untouched? 
                    // Or just append. Let's append, user can delete.
                    // Actually, if we are doing a bulk load, maybe we want to avoid duplicates?
                    // Let's just append for now as per plan.
                    return [...prev, ...newColors];
                });

                showToast(`Added ${newColors.length} colors${invalidCount > 0 ? ` (${invalidCount} invalid skipped)` : ''}`, 'success');

            } catch (error) {
                console.error("JSON parse error", error);
                showToast('Failed to parse JSON file', 'error');
            }
        };
        reader.readAsText(file);
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
                                <button onClick={handleSave} disabled={isSaving || isUploading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                                    {isSaving ? 'Saving...' : 'Save Product'} <Save size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-300" style={{ width: `${((currentStep - 1) / 3) * 100}% ` }}></div>

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
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none">
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                                    </select>

                                    <select
                                        value={subcategory}
                                        onChange={(e) => setSubcategory(e.target.value)}
                                        disabled={!category}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none disabled:opacity-50"
                                    >
                                        <option value="">{category ? 'Select Subcategory' : 'Select Category First'}</option>
                                        {selectedCategoryData?.subcategories && Object.values(selectedCategoryData.subcategories).map((sub: any) => (
                                            <option key={sub.name || sub} value={sub.name || sub}>{sub.name || sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <input type="checkbox" id="trending" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="trending" className="text-sm font-medium text-gray-900 cursor-pointer select-none">Mark as Trending Product</label>
                            </div>

                            {/* Pricing & Shipping */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Cost ($)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={shippingCost}
                                            onChange={(e) => setShippingCost(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Shipping Time</label>
                                    <div className="relative">
                                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={shippingTime}
                                            onChange={(e) => setShippingTime(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                            placeholder="e.g. 3-5 Business Days"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Production Time</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={productionTime}
                                            onChange={(e) => setProductionTime(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                            placeholder="e.g. 1-3 Business Days"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Printify Integration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 mt-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Printify Blueprint ID</label>
                                    <input
                                        type="number"
                                        value={printifyBlueprintId}
                                        onChange={(e) => setPrintifyBlueprintId(e.target.value)}
                                        placeholder="e.g. 1097"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Found in Printify URL when editing product</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Printify Provider ID</label>
                                    <input
                                        type="number"
                                        value={printifyProviderId}
                                        onChange={(e) => setPrintifyProviderId(e.target.value)}
                                        placeholder="e.g. 29"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Provider ID for fulfillment</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Colors */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900">Product Colors</h4>
                                <button onClick={addProductColor} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                                    <Plus size={14} /> Add Color
                                </button>
                                <label className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                                    <FolderUp size={14} /> Import JSON
                                    <input
                                        type="file"
                                        accept=".json,application/json"
                                        className="hidden"
                                        onChange={handleBulkColorJsonUpload}
                                    />
                                </label>
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
                                                onChange={(e) => updateProductColor(idx, 'hex', `#${e.target.value} `)}
                                                placeholder="HEX"
                                                className="w-full bg-transparent outline-none text-sm uppercase font-mono"
                                            />
                                        </div>
                                        {/* Variant IDs Input */}
                                        <div className="flex-1 min-w-[120px]">
                                            <input
                                                type="text"
                                                value={color.printifyVariantIds?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow user to type, only convert to array for storage
                                                    // Simplified: Just store comma separate in state logic? 
                                                    // No, our interface says number[].
                                                    // Improved: Parse on change but handle trailing comma or partials? 
                                                    // Actually, storing as string temporarily might be better or parse robustly.
                                                    // Let's parse robustly:
                                                    const ids = val.split(',').map(s => s.trim()).filter(s => !isNaN(Number(s)) && s !== '').map(Number);
                                                    updateProductColor(idx, 'printifyVariantIds', ids);
                                                }}
                                                placeholder="Variant IDs (e.g. 123, 456)"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                                title="Comma-separated Printify Variant IDs"
                                            />
                                        </div>
                                        <button onClick={() => removeProductColor(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Listing Images Grouped by Color */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Listing Images</h4>
                                        <p className="text-sm text-gray-500">Upload shots for specific colors. Drag to reorder.</p>
                                    </div>
                                    <label className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold text-indigo-700 cursor-pointer transition-colors border border-indigo-200">
                                        <FolderUp size={14} />
                                        <span>Bulk Upload</span>
                                        <input
                                            type="file"
                                            {...{ webkitdirectory: "", directory: "" } as any}
                                            className="hidden"
                                            onChange={handleBulkFolderUpload}
                                        />
                                    </label>
                                </div>

                                {/* General / All Colors Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-bold text-gray-700">General / All Colors</h5>
                                        <label className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline flex items-center gap-1">
                                            <Plus size={14} /> Add Images
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleListingImageUpload(e, 'All')} />
                                        </label>
                                    </div>
                                    <SortableContext
                                        items={listingImages.filter(img => img.color === 'All').map(img => img.url)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {listingImages.filter(img => img.color === 'All').map((img, i) => (
                                                <SortableListingImage key={img.url} img={img} index={i} colorGroup="All" />
                                            ))}
                                            {listingImages.filter(img => img.color === 'All').length === 0 && (
                                                <div className="col-span-full py-4 text-center text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                                    No general images
                                                </div>
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>

                                {/* Per-Color Sections */}
                                {productColors.map((color, idx) => (
                                    <div key={idx} className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color.hex }}></div>
                                                <h5 className="text-sm font-bold text-gray-700">{color.name}</h5>
                                            </div>
                                            <label className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline flex items-center gap-1">
                                                <Plus size={14} /> Add {color.name} Images
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleListingImageUpload(e, color.name)} />
                                            </label>
                                        </div>
                                        <SortableContext
                                            items={listingImages.filter(img => img.color === color.name).map(img => img.url)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {listingImages.filter(img => img.color === color.name).map((img, i) => (
                                                    <SortableListingImage key={img.url} img={img} index={i} colorGroup={color.name} />
                                                ))}
                                                {listingImages.filter(img => img.color === color.name).length === 0 && (
                                                    <div className="col-span-full py-4 text-center text-xs text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                                        No images for {color.name}
                                                    </div>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </div>
                                ))}
                            </div>
                        </DndContext>
                    </div >
                )
                }

                {/* STEP 2: VISUAL EDITOR */}
                {
                    currentStep === 2 && (
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
                                    {activeViewsConfig(views, activeViewId, setViews, handleImageUpload, productColors, handleColorImageUpload, handleBulkColorVariantUploadForView)}
                                </div>
                            </div>

                            {/* CANVAS */}
                            <div className="flex-1 relative bg-[#09090b] flex flex-col items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear - gradient(#fff 1px, transparent 1px), linear - gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

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
                    )
                }

                {/* STEP 3: RICH DETAILS */}
                {
                    currentStep === 3 && (
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

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900">Key Benefits (Bullet Points)</h4>
                                    <button onClick={() => setBulletPoints([...bulletPoints, ''])} className="text-xs text-indigo-600 font-medium">+ Add</button>
                                </div>
                                <div className="space-y-3">
                                    {bulletPoints.map((bp, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={bp}
                                                onChange={(e) => { const n = [...bulletPoints]; n[i] = e.target.value; setBulletPoints(n) }}
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                                placeholder="e.g. Made from 100% Cotton"
                                            />
                                            <button onClick={() => setBulletPoints(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 p-2"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4">Print Expectation Images (Onboarding)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Digital Preview (Fake)</label>
                                            <label className="block w-full h-32 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer overflow-hidden relative group">
                                                {previewExpectationImage ? <img src={previewExpectationImage} className="w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Upload Digital Preview</div>}
                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        const url = await uploadProductImage(e.target.files[0], 'onboarding', productName);
                                                        setPreviewExpectationImage(url);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Real Print (Reality)</label>
                                            <label className="block w-full h-32 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer overflow-hidden relative group">
                                                {realExpectationImage ? <img src={realExpectationImage} className="w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Upload Real Print</div>}
                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        const url = await uploadProductImage(e.target.files[0], 'onboarding', productName);
                                                        setRealExpectationImage(url);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900">Features</h4>
                                        <button onClick={() => setFeatures([...features, { title: '', description: '' }])} className="text-xs text-indigo-600 font-medium">+ Add</button>
                                    </div>
                                    <div className="space-y-3">
                                        {features.map((f, i) => (
                                            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                                <div className="flex gap-2 items-start">
                                                    {/* Feature Image Upload */}
                                                    <div className="shrink-0">
                                                        <label className="block w-10 h-10 border border-dashed border-gray-300 rounded overflow-hidden cursor-pointer hover:border-indigo-400 relative bg-white">
                                                            {f.image ? (
                                                                <img src={f.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                                    <Plus size={14} />
                                                                </div>
                                                            )}
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    if (e.target.files?.[0]) {
                                                                        const url = await uploadProductImage(e.target.files[0], 'features', productName);
                                                                        const n = [...features];
                                                                        n[i].image = url;
                                                                        setFeatures(n);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <input type="text" placeholder="Title" value={f.title} onChange={(e) => { const n = [...features]; n[i].title = e.target.value; setFeatures(n) }} className="w-full bg-transparent text-sm font-bold placeholder-gray-400 outline-none" />
                                                        <textarea placeholder="Description" value={f.description} onChange={(e) => { const n = [...features]; n[i].description = e.target.value; setFeatures(n) }} className="w-full bg-transparent text-xs text-gray-600 resize-none outline-none h-10" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => {
                                                                if (i === 0) return;
                                                                const n = [...features];
                                                                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                                                                setFeatures(n);
                                                            }}
                                                            disabled={i === 0}
                                                            className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                                                        >
                                                            <ArrowUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (i === features.length - 1) return;
                                                                const n = [...features];
                                                                [n[i + 1], n[i]] = [n[i], n[i + 1]];
                                                                setFeatures(n);
                                                            }}
                                                            disabled={i === features.length - 1}
                                                            className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                                                        >
                                                            <ArrowDown size={14} />
                                                        </button>
                                                        <button onClick={() => setFeatures(prev => prev.filter((_, idx) => idx !== i))} className="p-1 hover:bg-red-50 rounded text-red-500 pt-1">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
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

                            {/* FAQ EDITOR */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900">Freq. Asked Questions</h4>
                                    <button onClick={() => setFaq([...faq, { question: '', answer: '' }])} className="text-xs text-indigo-600 font-medium">+ Add Question</button>
                                </div>
                                <div className="space-y-4">
                                    {faq.map((item, i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 relative group">
                                            <button
                                                onClick={() => setFaq(prev => prev.filter((_, idx) => idx !== i))}
                                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded transition-colors"
                                                title="Remove FAQ"
                                            >
                                                <X size={14} />
                                            </button>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Question</label>
                                                <input
                                                    type="text"
                                                    value={item.question}
                                                    onChange={(e) => { const n = [...faq]; n[i].question = e.target.value; setFaq(n); }}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                                    placeholder="e.g. How do I wash this?"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Answer</label>
                                                <textarea
                                                    value={item.answer}
                                                    onChange={(e) => { const n = [...faq]; n[i].answer = e.target.value; setFaq(n); }}
                                                    className="w-full h-20 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                                                    placeholder="Provide a helpful answer..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {faq.length === 0 && (
                                        <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                            No FAQs added. <br />
                                            <button onClick={() => setFaq([
                                                { question: "How do I create my custom print t-shirt?", answer: "Just open our online designer, upload your artwork (or add text), position it the way you want, preview your design, then place the order. We’ll print and produce it for you." },
                                                { question: "Can I add my own logo or brand design?", answer: "Yes. You can upload your logo, graphics, or full design and make a custom print t-shirt for personal use, business merch, events, or gifts." },
                                                { question: "What t-shirt is used for printing?", answer: "We print on the Comfort Colors 1717 garment-dyed t-shirt, made with 100% ring-spun U.S. cotton and a soft-washed, premium feel." },
                                                { question: "What does “garment-dyed” mean?", answer: "Garment-dyed means the shirt is dyed after it’s constructed. This gives it a softer texture and a rich, lived-in color tone." },
                                                { question: "Is this t-shirt thick or lightweight?", answer: "It’s heavyweight—6.1 oz/yd²—so it feels premium, holds shape well, and is great for everyday wear." },
                                                { question: "Will the shirt shrink after washing?", answer: "It’s pre-shrunk and designed to have minimal shrinkage with proper care. For best results, wash cold and tumble dry low." },
                                                { question: "What sizes are available?", answer: "Sizes typically range from S to 4XL (4XL availability depends on the printing partner and color choice)." },
                                                { question: "How does the fit feel?", answer: "The Comfort Colors 1717 has a relaxed fit—comfortable and slightly roomier than a fitted tee." },
                                                { question: "Are there side seams on this shirt?", answer: "No. It’s made with a seamless tubular body, which helps the shirt keep its shape and gives it a clean look." },
                                                { question: "How many colors can I choose from?", answer: "You can choose from 58 colors, so you can match your custom print design to your exact vibe." },
                                                { question: "How do I wash and care for my custom printed shirt?", answer: "Machine wash cold (max 30°C / 90°F). Do not bleach. Tumble dry low. Iron/steam low (avoid ironing directly on the print). Do not dry clean." },
                                                { question: "Can I order one shirt only, or do I need a bulk order?", answer: "You can order one custom print t-shirt or place a bulk order—whatever you need." },
                                                { question: "Can I print on the front and back?", answer: "If your designer supports multiple print areas, yes—front, back, and more (availability depends on your selected print options)." },
                                                { question: "Is this good for business merch and event shirts?", answer: "Definitely. The premium feel, durable stitching, and huge color range make it a strong choice for brand merch, team shirts, events, and creator drops." },
                                                { question: "Where are these shirts made?", answer: "The Comfort Colors 1717 shirts are made in Honduras." }
                                            ])} className="text-indigo-600 font-bold hover:underline mt-2">
                                                Add Defaults
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* STEP 4: SIZE GUIDE & REVIEW */}
                {
                    currentStep === 4 && (
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
                    )
                }

            </div>
        </div >
    );
}

// Extracted UI helper for Step 2 Sidebar to keep main component cleaner
function activeViewsConfig(
    views: ViewConfig[],
    activeViewId: string,
    setViews: Function,
    handleImageUpload: Function,
    productColors: ProductColor[],
    handleColorImageUpload: Function,
    handleBulkColorVariantUploadForView: Function
) {
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

            {/* Color Variants Overrides */}
            {productColors && productColors.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            Color Variants <span className="text-gray-300 font-normal normal-case">(For this view)</span>
                        </label>
                        <label className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                            <FolderUp size={12} />
                            Bulk Upload
                            <input
                                type="file"
                                className="hidden"
                                multiple
                                // @ts-ignore
                                webkitdirectory=""
                                onChange={(e) => handleBulkColorVariantUploadForView(e, activeViewId, activeView.name)}
                            />
                        </label>
                    </div>
                    <div className="space-y-2">
                        {productColors.map((color, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: color.hex }} title={color.name}></div>
                                <label className="flex-1 h-8 border border-gray-200 rounded hover:border-indigo-300 cursor-pointer overflow-hidden relative bg-gray-50 flex items-center px-2">
                                    {color.images?.[activeViewId] ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="w-4 h-4 rounded-sm bg-gray-200 shrink-0 overflow-hidden">
                                                <img src={color.images[activeViewId]} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[10px] text-gray-600 truncate flex-1">Image Set</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400">Upload {color.name} variant...</span>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleColorImageUpload(e, idx, activeViewId)} />
                                </label>
                                {color.images?.[activeViewId] && (
                                    <button
                                        onClick={() => {
                                            // Quick hack to delete: Reuse handle but create a cleaner deleter if needed. 
                                            // Passing setProductColors might be needed for deletion if we want it here.
                                            // For now, let's keep it simple: Just upload overrides.
                                        }}
                                        className="hidden text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">CSS Transform</label>
                <input type="text" placeholder="rotate(-2deg)" value={activeView.cssTransform || ''} onChange={(e) => setViews((p: any) => p.map((v: any) => v.id === activeViewId ? { ...v, cssTransform: e.target.value } : v))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono" />
            </div>
        </div>
    );
}
