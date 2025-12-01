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
}

export const products: Product[] = [
    {
        id: 't-shirt-standard',
        name: 'Standard T-Shirt',
        image: '/products/shirt/shirt_cutout.svg',
        canvasSize: 1024,
        colors: [
            {
                name: 'Sand Dune',
                hex: '#fbdebf',
                images: {
                    front: '/products/shirt/colors/shirt_sand_dune.png',
                },
            },
        ],
        designZone: {
            left: 335,
            top: 270,
            width: 350,
            height: 447,
        },
        previews: [
            {
                id: 'front',
                name: 'Front View',
                editorZone: {
                    left: 335,
                    top: 270,
                    width: 350,
                    height: 447,
                },
                previewZone: {
                    left: 357,
                    top: 350,
                    width: 320,
                    height: 407,
                },
                displacementMap: '/products/shirt/maps/sand_dune/shirt_sand_dune_displacement.png',
                shadowMap: '/products/shirt/maps/sand_dune/shirt_sand_dune_ambient.png',
                editorCutout: '/products/shirt/shirt_cutout.svg',
            },
        ],
    },
];
