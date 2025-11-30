'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

import { Product } from '../data/products';

interface DesignEditorProps {
    onUpdate: (dataUrl: string) => void;
    product: Product;
}

export default function DesignEditor({ onUpdate, product }: DesignEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const designZoneRef = useRef<fabric.Rect | null>(null);

    // State for selected object properties
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [textColor, setTextColor] = useState<string>('#333333');
    const [fontSize, setFontSize] = useState<number>(60);
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [borderRadius, setBorderRadius] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // 1. Initialize Canvas
        // Start with the full size, we'll scale it down immediately
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
        });

        // 2. Add the "Print Area" Guide
        const designZone = new fabric.Rect({
            left: product.designZone.left,
            top: product.designZone.top,
            width: product.designZone.width,
            height: product.designZone.height,
            fill: 'transparent',
            stroke: '#3b82f6', // Blue for better visibility
            strokeWidth: 2,
            strokeDashArray: [10, 5],
            selectable: false,
            evented: false,
        });

        canvas.add(designZone);
        designZoneRef.current = designZone;

        // 3. Set Global Clip Path
        // This ensures EVERYTHING is clipped to the design zone
        const clipPath = new fabric.Rect({
            left: product.designZone.left,
            top: product.designZone.top,
            width: product.designZone.width,
            height: product.designZone.height,
        });
        canvas.clipPath = clipPath;

        setFabricCanvas(canvas);

        // 4. Handle Updates
        const handleUpdate = () => {
            if (!designZoneRef.current) return;

            // 1. Hide guidelines
            designZoneRef.current.set('visible', false);

            // 2. Export at High Resolution (Multiplier is key!)
            // We need to reset zoom to 1 before exporting to get the full resolution
            const originalZoom = canvas.getZoom();
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            const originalVpt = canvas.viewportTransform;

            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // Reset zoom/pan
            canvas.setDimensions({ width: product.canvasSize, height: product.canvasSize });

            const dataUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 1, // We are already at full size
                quality: 1,
                // CROP TO DESIGN ZONE
                left: product.designZone.left,
                top: product.designZone.top,
                width: product.designZone.width,
                height: product.designZone.height,
            });

            // Restore zoom/dimensions
            canvas.setZoom(originalZoom);
            canvas.setDimensions({ width: originalWidth, height: originalHeight });
            if (originalVpt) canvas.setViewportTransform(originalVpt);

            // 3. Show guidelines
            designZoneRef.current.set('visible', true);

            onUpdate(dataUrl);
        };

        // 5. Handle Selection
        const handleSelection = (e: any) => {
            const selected = e.selected?.[0];
            setSelectedObject(selected || null);

            if (selected) {
                if (selected instanceof fabric.IText) {
                    setTextColor(selected.fill as string);
                    setFontSize(selected.fontSize || 60);
                    setFontFamily(selected.fontFamily || 'Arial');
                }
                // Check for custom borderRadius property
                // @ts-ignore - Custom property
                setBorderRadius(selected.borderRadius || 0);
            }
        };

        const handleSelectionCleared = () => {
            setSelectedObject(null);
            setBorderRadius(0);
        };

        canvas.on('object:modified', handleUpdate);
        canvas.on('object:added', handleUpdate);
        canvas.on('object:removed', handleUpdate);

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelectionCleared);

        // 6. Handle Resizing
        const resizeCanvas = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            if (width === 0 || height === 0) return;

            // Calculate scale based on the fixed logical size
            const scale = width / product.canvasSize;

            canvas.setDimensions({ width: width, height: height });
            canvas.setZoom(scale);
            canvas.renderAll();
        };

        const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
        };
    }, [onUpdate, product]);

    const addText = () => {
        if (!fabricCanvas) return;
        // Center in design zone
        const centerX = product.designZone.left + product.designZone.width / 2;
        const centerY = product.designZone.top + product.designZone.height / 2;

        const text = new fabric.IText('Design Here', {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arial',
            fill: '#333333',
            fontSize: 60,
            fontWeight: 'bold',
            // clipPath removed, using canvas.clipPath
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
        // Trigger manual update
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
                // Scale image to reasonable size
                imgInstance.scaleToWidth(200);

                // Center in design zone
                const centerX = product.designZone.left + product.designZone.width / 2;
                const centerY = product.designZone.top + product.designZone.height / 2;

                imgInstance.set({
                    left: centerX,
                    top: centerY,
                    originX: 'center',
                    originY: 'center',
                });
                fabricCanvas.add(imgInstance);
                fabricCanvas.setActiveObject(imgInstance);
                fabricCanvas.renderAll();
                fabricCanvas.fire('object:added');
            };
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    const updateSelectedObject = (key: string, value: any) => {
        if (!fabricCanvas || !selectedObject) return;

        if (key === 'fill') setTextColor(value);
        if (key === 'fontSize') setFontSize(parseInt(value));
        if (key === 'fontFamily') setFontFamily(value);
        if (key === 'borderRadius') {
            const radius = parseInt(value);
            setBorderRadius(radius);

            if (selectedObject instanceof fabric.Image) {
                // @ts-ignore - Custom property
                selectedObject.set('borderRadius', radius);

                if (radius > 0) {
                    const clipRect = new fabric.Rect({
                        width: selectedObject.width,
                        height: selectedObject.height,
                        rx: radius,
                        ry: radius,
                        originX: 'center',
                        originY: 'center',
                    });
                    selectedObject.set('clipPath', clipRect);
                } else {
                    selectedObject.set('clipPath', undefined);
                }
            }
        } else {
            selectedObject.set(key, value);
        }

        fabricCanvas.renderAll();
        fabricCanvas.fire('object:modified');
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] lg:h-[600px] bg-gray-50 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Canvas Area - Takes available space */}
            <div className="relative flex-1 bg-[url('/grid.png')] overflow-hidden flex items-center justify-center p-4 lg:p-8 order-1 lg:order-2">
                <div ref={containerRef} className="relative w-full max-w-md lg:max-w-xl max-h-full aspect-square shadow-2xl rounded-2xl overflow-hidden bg-white mx-auto">
                    {/* Background Shirt Image */}
                    <img
                        src={product.image}
                        alt="Product Base"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    />
                    <canvas ref={canvasRef} className="absolute inset-0 z-10" />
                </div>

                {/* Reset Button - Floating Top Right */}
                <button
                    onClick={() => {
                        fabricCanvas?.getObjects().forEach((o) => {
                            if (o !== designZoneRef.current) fabricCanvas.remove(o);
                        });
                        fabricCanvas?.renderAll();
                        const dataUrl = fabricCanvas?.toDataURL({
                            format: 'png',
                            multiplier: 1,
                            left: product.designZone.left,
                            top: product.designZone.top,
                            width: product.designZone.width,
                            height: product.designZone.height,
                        }) || '';
                        onUpdate(dataUrl);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full border border-gray-200 shadow-sm hover:bg-red-50 transition-colors"
                    title="Reset Design"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>

            {/* Controls Area - Bottom Sheet on Mobile, Sidebar on Desktop */}
            <div className="bg-white border-t lg:border-t-0 lg:border-r border-gray-200 z-30 order-2 lg:order-1 w-full lg:w-80 flex flex-col transition-all duration-300 ease-in-out">

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Design Editor
                    </h3>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

                    {/* Primary Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={addText}
                            className="flex flex-col items-center justify-center p-4 gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all group active:scale-95"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                <span className="text-xl font-serif font-bold">T</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Add Text</span>
                        </button>

                        <label className="flex flex-col items-center justify-center p-4 gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer group active:scale-95">
                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>

                    {/* Selected Object Properties */}
                    {selectedObject ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    {selectedObject instanceof fabric.IText ? 'Text Properties' : 'Image Properties'}
                                </h4>
                                <button
                                    onClick={() => {
                                        fabricCanvas?.discardActiveObject();
                                        fabricCanvas?.requestRenderAll();
                                        setSelectedObject(null);
                                    }}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Deselect
                                </button>
                            </div>

                            {/* Text Properties */}
                            {selectedObject instanceof fabric.IText && (
                                <>
                                    {/* Color Picker */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => updateSelectedObject('fill', c)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${textColor === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                                <input
                                                    type="color"
                                                    value={textColor}
                                                    onChange={(e) => updateSelectedObject('fill', e.target.value)}
                                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Font Size */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-medium text-gray-500">Size</label>
                                            <span className="text-xs font-medium text-gray-900">{fontSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="200"
                                            value={fontSize}
                                            onChange={(e) => updateSelectedObject('fontSize', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>

                                    {/* Font Family */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500">Font</label>
                                        <div className="relative">
                                            <select
                                                value={fontFamily}
                                                onChange={(e) => updateSelectedObject('fontFamily', e.target.value)}
                                                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="Arial">Arial</option>
                                                <option value="Helvetica">Helvetica</option>
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Courier New">Courier New</option>
                                                <option value="Verdana">Verdana</option>
                                                <option value="Georgia">Georgia</option>
                                                <option value="Impact">Impact</option>
                                                <option value="Comic Sans MS">Comic Sans</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Image Properties */}
                            {selectedObject instanceof fabric.Image && (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-medium text-gray-500">Border Radius</label>
                                        <span className="text-xs font-medium text-gray-900">{borderRadius}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={borderRadius}
                                        onChange={(e) => updateSelectedObject('borderRadius', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden lg:flex flex-col items-center justify-center h-40 text-gray-400 text-center p-4 border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-sm">Select an object to edit properties</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}