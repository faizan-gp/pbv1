'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as fabric from 'fabric';
import {
    Image as ImageIcon, RotateCcw,
    Palette, Trash2,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus, Plus,
    Type as TypeIcon, Maximize2, ChevronDown, MousePointer2,
    RefreshCcw, RefreshCw, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductColor } from '../data/products';

export interface DesignEditorRef {
    addText: () => void;
    addImage: (url: string) => void;
    updateObject: (key: string, value: any) => void;
    modify: (action: 'move' | 'scale' | 'rotate' | 'delete', val?: number, y?: number) => void;
    deselect: () => void;
}

interface DesignEditorProps {
    onUpdate: (data: { dataUrl: string; jsonState: any }) => void;
    product: any;
    activeViewId: string;
    initialState?: any;
    hideToolbar?: boolean;
    onSelectionChange?: (selection: any | null) => void;
    selectedColor?: ProductColor;
}

const DesignEditorDesktop = forwardRef<DesignEditorRef, DesignEditorProps>(({ onUpdate, product, activeViewId, initialState, hideToolbar = false, onSelectionChange, selectedColor }, ref) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null); // The Right-side container
    const designZoneRef = useRef<fabric.Rect | null>(null);

    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [scale, setScale] = useState(1);

    const [textColor, setTextColor] = useState<string>('#333333');
    const [fontFamily, setFontFamily] = useState<string>('Arial');

    const activePreview = product.previews.find((p: any) => p.id === activeViewId) || product.previews[0];
    const currentDesignZone = activePreview.editorZone || product.designZone;

    // --- Responsive Scaling ---
    useEffect(() => {
        const handleResize = () => {
            if (!wrapperRef.current) return;

            // This width changes dynamically when the sidebar opens/closes
            const containerW = wrapperRef.current.clientWidth;
            const containerH = wrapperRef.current.clientHeight;

            // Fit logic: 10% padding
            const scaleX = (containerW * 0.9) / product.canvasSize;
            const scaleY = (containerH * 0.9) / product.canvasSize;

            // Ensure shirt fits in the remaining space
            setScale(Math.min(scaleX, scaleY));
        };

        // ResizeObserver is crucial here: it detects when the flex container shrinks
        // caused by the sidebar opening
        const resizeObserver = new ResizeObserver(() => {
            // We wrap in requestAnimationFrame to avoid "ResizeObserver loop" errors
            requestAnimationFrame(handleResize);
        });

        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
        }

        // Initial call
        handleResize();

        return () => {
            resizeObserver.disconnect();
        };
    }, [product.canvasSize]); // Removed selectedObject dependency as ResizeObserver handles it

    // --- Canvas Init ---
    useEffect(() => {
        if (!canvasRef.current) return;
        let isMounted = true;
        if (fabricCanvas) try { fabricCanvas.dispose(); } catch (e) { }

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: product.canvasSize,
            height: product.canvasSize,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            selectionColor: 'rgba(79, 70, 229, 0.1)',
            selectionBorderColor: '#4f46e5',
            selectionLineWidth: 1.5,
        });

        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ffffff',
            cornerStrokeColor: '#6366f1',
            borderColor: '#6366f1',
            cornerSize: 12,
            padding: 8,
            cornerStyle: 'circle',
            borderDashArray: [4, 4],
        });

        const initOverlays = () => {
            if (!isMounted) return;
            const designZone = new fabric.Rect({
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height,
                fill: 'transparent', stroke: 'rgba(99, 102, 241, 0.2)',
                strokeWidth: 2, strokeDashArray: [10, 10],
                selectable: false, evented: false, excludeFromExport: true,
            });
            canvas.add(designZone);
            designZoneRef.current = designZone;

            // Global clip path removed to allow background to be full size.
            // We will apply clipping to individual user objects instead.
        };

        const createClipRect = () => {
            return new fabric.Rect({
                left: currentDesignZone.left, top: currentDesignZone.top,
                width: currentDesignZone.width, height: currentDesignZone.height,
                absolutePositioned: true,
                originX: 'left', originY: 'top' // Ensure explicit origin
            });
        };

        const setupEvents = () => {
            const handleUpdate = () => {
                if (!designZoneRef.current) return;
                designZoneRef.current.set('visible', false);
                const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2, left: currentDesignZone.left, top: currentDesignZone.top, width: currentDesignZone.width, height: currentDesignZone.height });
                const jsonState = (canvas as any).toJSON(['id', 'gradient', 'selectable']);
                designZoneRef.current.set('visible', true);
                if (isMounted) onUpdate({ dataUrl, jsonState });
            };

            const handleSelection = (e: any) => {
                const selected = e.selected?.[0];
                if (isMounted) setSelectedObject(selected || null);

                // Lift state up
                if (onSelectionChange) {
                    if (selected) {
                        onSelectionChange({
                            type: selected.type,
                            text: selected.text,
                            fontFamily: selected.fontFamily,
                            fill: selected.fill
                        });
                    } else {
                        onSelectionChange(null);
                    }
                }

                if (selected && selected instanceof fabric.IText) {
                    setTextColor(selected.fill as string);
                    setFontFamily(selected.fontFamily || 'Arial');
                }
            };
            canvas.on('object:modified', handleUpdate);
            canvas.on('object:added', handleUpdate);
            canvas.on('object:removed', handleUpdate);
            canvas.on('selection:created', handleSelection);
            canvas.on('selection:updated', handleSelection);
            canvas.on('selection:cleared', () => {
                if (isMounted) {
                    setSelectedObject(null);
                    if (onSelectionChange) onSelectionChange(null);
                }
            });
        };

        const initializeCanvas = async () => {
            // Load state first
            if (initialState) {
                try { await canvas.loadFromJSON(initialState); } catch (e) { }
            }

            if (!isMounted) return;

            // --- LOAD BACKGROUND IMAGE (PRODUCT VARIANT) ---
            let imageUrl = product.image; // default fallback
            if (selectedColor && selectedColor.images && selectedColor.images[activeViewId]) {
                imageUrl = selectedColor.images[activeViewId];
            } else if (activePreview && (activePreview as any).image) {
                imageUrl = (activePreview as any).image;
            }

            console.log("DEBUG: Loading Background Image Desktop", { activeViewId, color: selectedColor?.name, url: imageUrl });

            const cleanUrl = imageUrl.split('?')[0].toLowerCase();
            const isSvg = cleanUrl.endsWith('.svg');

            const setupBackgroundObject = (obj: fabric.Object) => {
                obj.set({
                    selectable: false,
                    evented: false,
                    excludeFromExport: true,
                    left: 0,
                    top: 0,
                    originX: 'left',
                    originY: 'top'
                });

                // Scale to fit canvas
                if (obj.width) {
                    const scale = product.canvasSize / obj.width;
                    obj.scale(scale);
                }

                canvas.add(obj);

                // Safe handling for Z-index across fabric versions
                if (typeof (canvas as any).moveObjectTo === 'function') {
                    (canvas as any).moveObjectTo(obj, 0);
                } else if (typeof (canvas as any).sendToBack === 'function') {
                    (canvas as any).sendToBack(obj);
                } else if (typeof (canvas as any).moveTo === 'function') {
                    (canvas as any).moveTo(obj, 0);
                }
            };

            try {
                if (isSvg) {
                    const { objects, options } = await fabric.loadSVGFromURL(imageUrl);
                    if (!isMounted) return;

                    const validObjects = objects.filter((o): o is fabric.FabricObject => o !== null);
                    const svgGroup = fabric.util.groupSVGElements(validObjects, options) as fabric.Group;

                    // Apply Dynamic Color
                    if (selectedColor && selectedColor.hex) {
                        // Apply to all children
                        svgGroup.getObjects().forEach((obj: any) => {
                            if (obj.fill && obj.fill !== 'none' && obj.fill !== 'transparent') {
                                obj.set('fill', selectedColor.hex);
                            }
                        });
                    }

                    setupBackgroundObject(svgGroup);

                } else {
                    const img = await fabric.Image.fromURL(imageUrl, { crossOrigin: 'anonymous' });
                    if (!isMounted) return;
                    setupBackgroundObject(img);
                }
            } catch (err) {
                console.warn("Failed to load background image:", err);
            }

            initOverlays();
            setupEvents();
            canvas.requestRenderAll();
        };



        initializeCanvas();
        setFabricCanvas(canvas);
        return () => { isMounted = false; try { canvas.dispose(); } catch (e) { } };
    }, [product.id, activeViewId, onUpdate, selectedColor, onSelectionChange]);

    // --- Expose API ---
    useImperativeHandle(ref, () => ({
        addText: () => {
            if (!fabricCanvas) return;
            const text = new fabric.IText('DESIGN', {
                left: currentDesignZone.left + currentDesignZone.width / 2,
                top: currentDesignZone.top + currentDesignZone.height / 2,
                originX: 'center', originY: 'center',
                fontFamily: 'Arial', fill: '#1e293b', fontSize: currentDesignZone.width * 0.15, fontWeight: 'bold',
                clipPath: new fabric.Rect({
                    left: currentDesignZone.left, top: currentDesignZone.top,
                    width: currentDesignZone.width, height: currentDesignZone.height,
                    absolutePositioned: true,
                    originX: 'left', originY: 'top'
                })
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
                    originX: 'center', originY: 'center',
                    clipPath: new fabric.Rect({
                        left: currentDesignZone.left, top: currentDesignZone.top,
                        width: currentDesignZone.width, height: currentDesignZone.height,
                        absolutePositioned: true,
                        originX: 'left', originY: 'top'
                    })
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

            if (key === 'fill') setTextColor(value);
            if (key === 'fontFamily') setFontFamily(value);

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
                // We store the curvature value itself as a custom property so the UI can read it back
                active.set('curvature', angle);

                if (angle === 0) {
                    active.set('path', undefined);
                } else {
                    // Calculate Path
                    const len = active.width || 200;
                    const radius = len / (Math.abs(angle) * Math.PI / 180);

                    // Construct a simple arc path
                    // M startX startY A radius radius 0 0 1 endX endY
                    // We need to determine start/end points of an arc centered at (0, R)
                    // For simplicity, let's use a quadratic Bezier or just a calculated Arc

                    // Actually, let's just make an Arc.
                    // If angle > 0 (frown/smile), we assume "frown" for positive? Or curve UP?
                    // Let's assume positive = curve UP (smile-like) if we place center below?? 
                    // Usually "Arch" means Arch UP (Rainbow) for positive?
                    // Let's implement generic arc logic.

                    const theta = (Math.abs(angle) * Math.PI) / 180;
                    const r = len / Math.abs(theta); // approximate radius

                    // Chord length calculation
                    // We want the text to sit on the arc.
                    // Start point: (-len/2, something). End: (len/2, something).
                    // Actually, if we use a Path, Fabric places text along it.
                    // To center it, we can create a path from -len/2 to len/2.

                    // Arc Height (Sagitta)
                    const h = r * (1 - Math.cos(theta / 2));

                    // Path Data
                    // M -x 0 Q 0 -y x 0  (Quadratic approx)
                    // M startX startY A r r 0 0 sweepFlag endX endY

                    const sweep = angle < 0 ? 0 : 1; // 1 for clockwise?
                    // If angle > 0, we want it to curve DOWN (Frown)? Or UP?
                    // Let's try: angle > 0 => Frown (Rainbow).
                    // In SVG, Y grows down.
                    // Frown: Start left-down, go up-mid, end right-down.
                    // Center of curvature is BELOW text. So sweep = 1?
                    // Let's try Standard SVG Arc.

                    // Start relative:
                    const startX = -len / 2;
                    const startY = 0;
                    const endX = len / 2;
                    const endY = 0;

                    // For a proper arc of length 'len' on radius 'r':
                    // We need points on circle.
                    // Chord length c = 2 * r * sin(theta/2)

                    // Let's just do a simple Quadratic curve for approximation which is stable?
                    // Q controlX controlY endX endY
                    // controlY determines height.
                    // h_quad approx 0.5 * h_arc?
                    // Let's stick to 'A' for precision.

                    const largeArc = 0; // we limit to 180 deg
                    const sweepFlag = angle > 0 ? 1 : 0; // Toggle based on sign

                    // We need to adjust Start/End to match chord width?
                    // If we keep fixed width 'len', the arc length > len.
                    // That spreads letters.
                    // Ideally arc length = len.
                    // So we shouldn't use 'len' as chord.
                    // We know ArcLength S = len.
                    // Radius R = S / theta.
                    // Chord C = 2 * R * sin(theta/2).
                    // Start X = -C/2, End X = C/2.

                    const chord = 2 * r * Math.sin(theta / 2);
                    const sx = -chord / 2;
                    const ex = chord / 2;
                    const sy = 0;
                    const ey = 0;

                    // We also need to offset Y so the path passes through (0,0) or similar?
                    // Actually Fabric aligns text to path.

                    // SVG Path
                    const pathData = `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${ex} ${ey}`;

                    const path = new fabric.Path(pathData, {
                        visible: false, // Hide the path itself
                        fill: '',
                        stroke: ''
                    });

                    active.set('path', path);
                    // align center
                    // We might need to set 'pathSide' or 'pathAlign'
                    active.set({
                        pathSide: 'center',
                        pathAlign: 'center'
                    } as any);
                }
            }

            active.set(key as any, value);
            fabricCanvas.requestRenderAll();
            fabricCanvas.setActiveObject(active); // Force keep selection
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
        }
    }));

    return (
        <div className="w-full h-full flex font-sans select-none overflow-hidden bg-[#F8F9FB]">
            {/* CANVAS STAGE (Dynamic Width) */}
            <div ref={wrapperRef} className="flex-1 relative flex items-center justify-center overflow-hidden z-10 bg-[#F8F9FB]">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

                {/* Scaled Content */}
                <div className="relative transition-transform duration-300 ease-out shadow-2xl origin-center bg-white ring-1 ring-slate-900/5"
                    style={{ width: product.canvasSize, height: product.canvasSize, transform: `scale(${scale})` }}>
                    {/* Background Image managed via img tag for reliability */}
                    <img
                        src={activePreview.editorCutout || product.image}
                        alt="Editor Background"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 select-none"
                    />
                    <canvas ref={canvasRef} className="absolute inset-0 z-10" />
                </div>

                {/* Empty State Hint */}
                {!selectedObject && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-5 py-2.5 rounded-full text-xs font-medium shadow-xl pointer-events-none animate-in fade-in slide-in-from-bottom-4 z-20 flex items-center gap-2">
                        <MousePointer2 size={14} className="text-indigo-400" /> Select an element to edit properties
                    </div>
                )}
            </div>
        </div>
    );
});

DesignEditorDesktop.displayName = 'DesignEditorDesktop';
export default DesignEditorDesktop;