export interface ProductColor {
    name: string;
    hex: string;
    image: string; // Path to the realistic preview image for this color
}

export interface Product {
    id: string;
    name: string;
    image: string; // Path to the base editor cutout (usually transparent PNG of outline/folds)
    canvasSize: number;
    colors: ProductColor[]; // New: Available colors
    designZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previewConfig: {
        // We keep a default image here, but the Color object will override it
        image: string;
        designZone: {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        displacementMap?: string;
        shadowMap?: string;
    };
}

export const products: Product[] = [
    {
        id: 't-shirt-standard',
        name: 'Standard T-Shirt',
        image: '/shirt_cutout.svg', // Ensure this is a transparent PNG/SVG so background color shows through
        canvasSize: 1024,
        colors: [
            {
                name: 'Heather Grey',
                hex: '#888888',
                image: '/products/shirt/colors/shirt_grey.png'
            },
            {
                name: 'Midnight Black',
                hex: '#1a1a1a',
                image: '/products/shirt/colors/shirt_black.png'
            },
            {
                name: 'Navy Blue',
                hex: '#1e3a8a',
                image: '/products/shirt/colors/shirt_navy.png'
            },
            {
                name: 'Cardinal Red',
                hex: '#991b1b',
                image: '/products/shirt/colors/shirt_red.png'
            },
            {
                name: 'Classic White',
                hex: '#ffffff',
                image: '/products/shirt/colors/shirt_white.png'
            },
        ],
        designZone: {
            left: 335,
            top: 270,
            width: 350,
            height: 447,
        },
        previewConfig: {
            image: '/products/shirt/colors/shirt_grey.png', // Default
            designZone: {
                left: 357,
                top: 350,
                width: 320,
                height: 407,
            },
            // Updated paths as requested
            displacementMap: '/products/shirt/maps/displacement.png',
            shadowMap: '/products/shirt/maps/shadow.png',
        },
    },
];