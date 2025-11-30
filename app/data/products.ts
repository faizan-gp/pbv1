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
    previewConfig: {
        image: string; // The base image for the preview
        designZone: {
            left: number; // Percentage (0-100) or pixel value relative to preview image
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
        image: '/shirt_cutout.svg',
        canvasSize: 1024,
        designZone: {
            left: 335,
            top: 270,
            width: 350,
            height: 447,
        },
        previewConfig: {
            image: '/shirt_grey.png',
            designZone: {
                left: 357,
                top: 350,
                width: 320,
                height: 407,
            },
            displacementMap: '/shirt_base_displacement.png',
            shadowMap: '/shirt_base_ambient_occ.png',
        },
    },
]; 
