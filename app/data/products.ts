export interface Product {
    id: string;
    name: string;
    image: string; // Path to the base product image (SVG or PNG)
    canvasSize: number; // The size of the editor canvas (e.g., 1024)
    designZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
}

export const products: Product[] = [
    {
        id: 't-shirt-standard',
        name: 'Standard T-Shirt',
        image: '/shirt_cutout.svg',
        canvasSize: 1024,
        // Coordinates calculated from shirt_cutout.svg (3104x3104) scaled to 1024x1024
        // Original: x=976.76, y=544.25, w=1151.71, h=1535.62
        // Scale: 1024 / 3103.96 ≈ 0.3299
        designZone: {
            left: 352,
            top: 350,
            width: 320,
            height: 407,
        },
    },
];
