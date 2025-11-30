export interface Product {
    id: string;
    name: string;
    image: string;
    canvasSize: number;
    designZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previewConfig: {
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
    colors: {
        name: string;
        value: string;
        image: string;
    }[];
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
            left: 335,
            top: 270,
            width: 350,
            height: 447,
        },
        previewConfig: {
            image: '/shirt_base.png',
            designZone: {
                left: 357,
                top: 350,
                width: 320,
                height: 407,
            },
            displacementMap: '/shirt_base_displacement.png',
            shadowMap: '/shirt_base_ambient_occ.png',
        },
        colors: [
            { name: 'White', value: '#ffffff', image: '/shirt_base.png' },
            { name: 'Black', value: '#111827', image: '/shirt_black.png' },
            { name: 'Navy', value: '#1e3a8a', image: '/shirt_navy.png' },
            { name: 'Heather Grey', value: '#9ca3af', image: '/shirt_grey.png' },
            { name: 'Red', value: '#ef4444', image: '/shirt_red.png' },
        ],
    },
]; 
