export interface PreviewConfig {
    id: string;
    name: string;
    // The zone where the user places the design in the 2D editor
    editorZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    // The zone where the design is rendered on the preview image
    previewZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    displacementMap?: string;
    shadowMap?: string;
    editorCutout?: string; // Optional: Specific cutout for this view in the editor
    cssTransform?: string; // Optional: CSS transform for the design layer (e.g. 'rotate(-2deg)')
}

export interface ProductColor {
    name: string;
    hex: string;
    images: Record<string, string>; // Map view ID to image URL
}

export interface Product {
    id: string;
    name: string;
    category: string;
    trending?: boolean;
    image: string; // Path to the base product image (SVG or PNG) for editor (fallback)
    canvasSize: number; // The size of the editor canvas (e.g., 1024)
    colors: ProductColor[];
    // Global design zone (legacy/fallback)
    designZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previews: PreviewConfig[];
    sizeGuide?: {
        imperial: { size: string; width: number; length: number }[];
        metric: any[];
    };
}

export const products: Product[] = [
    {
        id: 'unisex-jersey-tee-bella-canvas-3001',
        name: 'Unisex Jersey Tee | Bella+Canvas 3001',
        category: "Men's Clothing",
        trending: true,
        image: '/products/tshirt-black.png',
        canvasSize: 1024,
        colors: [
            { name: 'Black', hex: '#000000', images: { front: '/products/tshirt-black.png', back: '/products/tshirt-black-back.png' } },
            { name: 'White', hex: '#ffffff', images: { front: '/products/tshirt-white.png', back: '/products/tshirt-white-back.png' } },
            { name: 'Navy', hex: '#1a237e', images: { front: '/products/tshirt-navy.png', back: '/products/tshirt-navy-back.png' } },
            { name: 'Heather Grey', hex: '#9e9e9e', images: { front: '/products/tshirt-heather.png', back: '/products/tshirt-heather-back.png' } },
        ],
        sizeGuide: {
            imperial: [
                { size: 'S', width: 18, length: 28 },
                { size: 'M', width: 20, length: 29 },
                { size: 'L', width: 22, length: 30 },
                { size: 'XL', width: 24, length: 31 },
                { size: '2XL', width: 26, length: 32 },
            ],
            metric: [
                { size: 'S', width: 46, length: 71 },
                { size: 'M', width: 51, length: 74 },
                { size: 'L', width: 56, length: 76 },
                { size: 'XL', width: 61, length: 79 },
                { size: '2XL', width: 66, length: 81 },
            ]
        },
        designZone: { left: 312, top: 262, width: 400, height: 500 },
        previews: [
            {
                id: 'front',
                name: 'Front View',
                editorZone: { left: 312, top: 262, width: 400, height: 500 },
                previewZone: { left: 312, top: 262, width: 400, height: 500 },
                displacementMap: '/displacement/tshirt-disp.jpg',
                shadowMap: '/shadows/tshirt-shadow.png'
            },
            {
                id: 'back',
                name: 'Back View',
                editorZone: { left: 312, top: 262, width: 400, height: 500 },
                previewZone: { left: 312, top: 262, width: 400, height: 500 },
            }
        ]
    },
    {
        id: 'stretched-canvas-12x16',
        name: 'Stretched Canvas | 12x16',
        category: "Home & Living",
        trending: true,
        image: '/products/canvas-12x16.png',
        canvasSize: 1024,
        colors: [
            { name: 'Default', hex: '#ffffff', images: { front: '/products/canvas-12x16.png' } },
        ],
        designZone: { left: 128, top: 128, width: 768, height: 768 },
        previews: [
            {
                id: 'front',
                name: 'Front View',
                editorZone: { left: 128, top: 128, width: 768, height: 768 },
                previewZone: { left: 128, top: 128, width: 768, height: 768 },
                displacementMap: '/displacement/canvas-disp.jpg',
                shadowMap: '/shadows/canvas-shadow.png'
            },
        ],
    },
];
