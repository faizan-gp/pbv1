'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as fabric from 'fabric';
import { Product } from '../data/products';

export interface DesignEditorRef {
    addText: () => void;
    addImage: (url: string) => void;
    updateObject: (key: string, value: any) => void;
    modify: (action: 'move' | 'scale' | 'rotate' | 'delete', val?: number, y?: number) => void;
    deselect: () => void;
    exportState: () => { jsonState: any; dataUrl: string } | null;
}

interface DesignEditorProps {
    onUpdate: (data: { dataUrl: string; jsonState: any }) => void;
    product: Product;
    activeViewId: string;
    initialState?: any;
    onSelectionChange?: (selection: any | null) => void;
    readOnly?: boolean;
}

const DesignEditorMobile = forwardRef<DesignEditorRef, DesignEditorProps>(({ onUpdate, product, activeViewId, initialState, onSelectionChange, readOnly }, ref) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const designZoneRef = useRef<fabric.Rect | null>(null);

    const activePreview = product.previews.find(p => p.id === activeViewId) || product.previews[0];
    const currentDesignZone = activePreview.editorZone || product.designZone;

    // --- Read Only Effect ---
    useEffect(() => {
        if (!fabricCanvas) return;
        fabricCanvas.selection = !readOnly;
        fabricCanvas.forEachObject((obj) => {
            obj.selectable = !readOnly;
            obj.evented = !readOnly;
        });
        fabricCanvas.requestRenderAll();
        if (readOnly) {
            setFabricCanvas(fabricCanvas);
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
        }
    }, [readOnly, fabricCanvas]);

    // --- CANVAS INIT ---
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;
        let isMounted = true;

        if (fabricCanvas) {
            try { fabricCanvas.dispose(); } catch (e) { }
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            selection: !readOnly, // Initialize with correct state
            preserveObjectStacking: true,
            allowTouchScrolling: false,
        });

        // Optimization for touch
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#6366f1',
            borderColor: '#6366f1',
            cornerSize: 16,
            padding: 12,
            cornerStyle: 'circle',
            borderDashArray: [4, 4],
            touchCornerSize: 36,
        });

        const initOverlays = () => {
            if (!isMounted) return;
            const designZone = new fabric.Rect({
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height,
                fill: 'transparent', stroke: 'transparent',
                strokeWidth: 0, strokeDashArray: [8, 6],
                selectable: false, evented: false, excludeFromExport: true,
                visible: false
            });
            canvas.add(designZone);
            designZoneRef.current = designZone;

            const clipPath = new fabric.Rect({
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height,
                absolutePositioned: true,
            });
            canvas.clipPath = clipPath;
        };



        const initializeCanvas = async () => {
            if (initialState) {
                try { await canvas.loadFromJSON(initialState); } catch (e) { }
            }
            if (!isMounted) return;

            initOverlays();

            // --- SETUP EVENTS INLINED ---
            const handleUpdate = () => {
                if (!isMounted || !designZoneRef.current) return;

                // 2. RESIZE CANVAS AND RESET VIEWPORT (Critical Force Capture)
                const originalVpt = canvas.viewportTransform;
                const originalWidth = canvas.width;
                const originalHeight = canvas.height;

                canvas.setDimensions({ width: product.canvasSize, height: product.canvasSize });
                canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                canvas.renderAll();

                // 3. Capture State
                const jsonState = (canvas as any).toJSON(['id', 'layerId', 'lockMovementX', 'lockMovementY', 'selectable', 'evented', 'excludeFromExport']);
                const dataUrl = canvas.toDataURL({
                    format: 'png', multiplier: 2,
                    left: currentDesignZone.left, top: currentDesignZone.top,
                    width: currentDesignZone.width, height: currentDesignZone.height
                });

                // 4. Restore Overlay, Viewport & Dimensions
                canvas.setDimensions({ width: originalWidth, height: originalHeight });
                if (originalVpt) canvas.setViewportTransform(originalVpt);
                canvas.requestRenderAll();

                if (isMounted) onUpdate({ dataUrl, jsonState });
            };

            const handleSelection = () => {
                const selected = canvas.getActiveObject();
                if (onSelectionChange) {
                    if (selected) {
                        onSelectionChange({
                            type: selected.type,
                            text: (selected as any).text,
                            fontFamily: (selected as any).fontFamily,
                            fill: selected.fill,
                            scaleX: selected.scaleX,
                            angle: selected.angle
                        });
                    } else {
                        onSelectionChange(null);
                    }
                }
            };

            canvas.on('object:modified', handleUpdate);
            canvas.on('object:added', handleUpdate);
            canvas.on('object:removed', handleUpdate);
            canvas.on('selection:created', handleSelection);
            canvas.on('selection:updated', handleSelection);
            canvas.on('selection:cleared', () => { if (isMounted && onSelectionChange) onSelectionChange(null); });

            canvas.requestRenderAll();

            // Initial Trigger
            setTimeout(handleUpdate, 100);
        };

        initializeCanvas();
        setFabricCanvas(canvas);

        const resizeCanvas = () => {
            if (!containerRef.current || !isMounted) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            // Calculate scale based on container dimensions
            const scaleX = width / product.canvasSize;
            const scaleY = height / product.canvasSize;

            // "Contain" scaling
            const scale = Math.min(scaleX, scaleY);

            // Center Viewport
            const vpt = [scale, 0, 0, scale, (width - product.canvasSize * scale) / 2, (height - product.canvasSize * scale) / 2];

            canvas.setDimensions({ width, height });
            canvas.setViewportTransform(vpt as [number, number, number, number, number, number]);
            canvas.requestRenderAll();
        };

        const resizeObserver = new ResizeObserver(() => requestAnimationFrame(resizeCanvas));
        resizeObserver.observe(containerRef.current);

        return () => {
            isMounted = false;
            resizeObserver.disconnect();
            try { canvas.dispose(); } catch (e) { }
        };
    }, [onUpdate, product, activeViewId, onSelectionChange]);

    // --- METHODS ---
    useImperativeHandle(ref, () => ({
        addText: () => {
            if (!fabricCanvas) return;
            const text = new fabric.IText('DESIGN', {
                left: currentDesignZone.left + currentDesignZone.width / 2,
                top: currentDesignZone.top + currentDesignZone.height / 2,
                originX: 'center', originY: 'center',
                fontFamily: 'Arial', fill: '#1e293b', fontSize: currentDesignZone.width * 0.15, fontWeight: 'bold',
            });
            fabricCanvas.add(text);
            fabricCanvas.setActiveObject(text);
            fabricCanvas.fire('object:added');
        },
        addImage: (url: string) => {
            if (!fabricCanvas) return;
            fabric.Image.fromURL(url, {}, { crossOrigin: 'anonymous' }).then((img) => {
                img.scaleToWidth(currentDesignZone.width * 0.6);
                img.set({
                    left: currentDesignZone.left + currentDesignZone.width / 2,
                    top: currentDesignZone.top + currentDesignZone.height / 2,
                    originX: 'center', originY: 'center'
                });
                fabricCanvas.add(img);
                fabricCanvas.setActiveObject(img);
                fabricCanvas.fire('object:added');
            });
        },
        updateObject: (key: string, value: any) => {
            if (!fabricCanvas) return;
            const active = fabricCanvas.getActiveObject();
            if (!active) return;
            // Handle Font Family explicitly to force redraw
            if (key === 'fontFamily') {
                if (active instanceof fabric.IText || active instanceof fabric.Text) {
                    active.set('fontFamily', value);
                    active.set('dirty', true);
                    fabricCanvas.requestRenderAll();
                }
            }

            // Handle Rounded Corners for Images
            // Handle Rounded Corners for Images
            if (key === 'cornerRadius' && active.type === 'image') {
                const radius = value;
                if (radius > 0) {
                    active.set('clipPath', new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: active.width,
                        height: active.height,
                        rx: radius,
                        ry: radius,
                        originX: 'center',
                        originY: 'center'
                    }));
                } else {
                    active.set('clipPath', undefined);
                }
            }

            // Handle Curved Text (Arch)
            if (key === 'curvature' && (active.type === 'i-text' || active.type === 'text')) {
                const angle = value; // Degrees -180 to 180
                active.set('curvature', angle);

                if (angle === 0) {
                    active.set('path', undefined);
                } else {
                    const len = active.width || 200;
                    const theta = (Math.abs(angle) * Math.PI) / 180;
                    const r = len / Math.abs(theta); // approximate radius

                    const largeArc = 0;
                    const sweepFlag = angle > 0 ? 1 : 0;

                    const chord = 2 * r * Math.sin(theta / 2);
                    const sx = -chord / 2;
                    const ex = chord / 2;
                    const sy = 0;
                    const ey = 0;

                    const pathData = `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${ex} ${ey}`;

                    const path = new fabric.Path(pathData, {
                        visible: false,
                        fill: '',
                        stroke: ''
                    });

                    active.set('path', path);
                    active.set({
                        pathSide: 'center',
                        pathAlign: 'center'
                    } as any);
                }
            }

            active.set(key as any, value);
            fabricCanvas.requestRenderAll();
            fabricCanvas.setActiveObject(active);
            fabricCanvas.fire('object:modified');
        },
        modify: (action: 'move' | 'scale' | 'rotate' | 'delete', val: number = 0, y: number = 0) => {
            if (!fabricCanvas) return;
            const active = fabricCanvas.getActiveObject();
            if (!active) return;
            if (action === 'move') active.set({ left: (active.left || 0) + val, top: (active.top || 0) + y });
            if (action === 'scale') active.scale((active.scaleX || 1) + val);
            if (action === 'rotate') active.rotate((active.angle || 0) + val);
            if (action === 'delete') { fabricCanvas.remove(active); fabricCanvas.discardActiveObject(); }
            active.setCoords();
            fabricCanvas.requestRenderAll();
            fabricCanvas.fire(action === 'delete' ? 'object:removed' : 'object:modified');
        },
        deselect: () => {
            fabricCanvas?.discardActiveObject();
            fabricCanvas?.requestRenderAll();
        },
        exportState: () => {
            if (!fabricCanvas || !designZoneRef.current) return null;
            // 1. Hide Overlay
            designZoneRef.current.set('visible', false);

            // 2. RESIZE CANVAS AND RESET VIEWPORT
            const originalVpt = fabricCanvas.viewportTransform;
            const originalWidth = fabricCanvas.width;
            const originalHeight = fabricCanvas.height;

            fabricCanvas.setDimensions({ width: product.canvasSize, height: product.canvasSize });
            fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            fabricCanvas.renderAll();

            // 3. Capture State
            const jsonState = (fabricCanvas as any).toJSON(['id', 'layerId', 'lockMovementX', 'lockMovementY', 'selectable', 'evented', 'excludeFromExport']);
            const dataUrl = fabricCanvas.toDataURL({
                format: 'png', multiplier: 2,
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height
            });

            // 4. Restore
            fabricCanvas.setDimensions({ width: originalWidth, height: originalHeight });
            if (originalVpt) fabricCanvas.setViewportTransform(originalVpt);
            designZoneRef.current.set('visible', true);
            fabricCanvas.requestRenderAll();

            return { jsonState, dataUrl };
        }
    }));

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden touch-none">
            {/* Background Image (Centered) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                    src={activePreview.editorCutout || product.image}
                    alt="Product"
                    className="max-w-[100%] max-h-[100%] w-auto h-auto object-contain pointer-events-none select-none opacity-95"
                />
            </div>
            {/* Canvas Layer */}
            <div className="absolute inset-0 z-10">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
});

DesignEditorMobile.displayName = 'DesignEditorMobile';
export default DesignEditorMobile;
