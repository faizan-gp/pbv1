import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPreviewConfig {
    id: string;
    name: string;
    editorZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previewZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    displacementMap?: string;
    shadowMap?: string;
    editorCutout?: string;
    cssTransform?: string;
}

export interface IProductColor {
    name: string;
    hex: string;
    images: Record<string, string>;
}

export interface IProductFeature {
    title: string;
    description: string;
    icon: string;
}

export interface IProduct extends Document {
    id: string; // We use a string ID in our app logic (e.g. 't-shirt-standard')
    name: string;
    category: string;
    trending: boolean;
    image: string;
    listingImages: string[];
    shortDescription?: string;
    fullDescription?: string;
    features?: IProductFeature[];
    careInstructions?: string[];
    sizeGuide?: {
        imperial: any[];
        metric: any[];
    };
    canvasSize: number;
    colors: IProductColor[];
    designZone: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    previews: IPreviewConfig[];
}

const ProductSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    trending: { type: Boolean, default: false },
    image: { type: String, required: true },
    listingImages: [{ type: String }],
    shortDescription: { type: String },
    fullDescription: { type: String },
    features: [{
        title: { type: String },
        description: { type: String },
        icon: { type: String }
    }],
    careInstructions: [{ type: String }],
    sizeGuide: {
        imperial: { type: Schema.Types.Mixed },
        metric: { type: Schema.Types.Mixed }
    },
    canvasSize: { type: Number, required: true },
    colors: [
        {
            name: { type: String, required: true },
            hex: { type: String, required: true },
            images: { type: Map, of: String, required: true },
        },
    ],
    designZone: {
        left: { type: Number, required: true },
        top: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
    },
    previews: [
        {
            id: { type: String, required: true },
            name: { type: String, required: true },
            editorZone: {
                left: { type: Number, required: true },
                top: { type: Number, required: true },
                width: { type: Number, required: true },
                height: { type: Number, required: true },
            },
            previewZone: {
                left: { type: Number, required: true },
                top: { type: Number, required: true },
                width: { type: Number, required: true },
                height: { type: Number, required: true },
            },
            displacementMap: { type: String },
            shadowMap: { type: String },
            editorCutout: { type: String },
            cssTransform: { type: String },
        },
    ],
});

// Check if the model is already defined to verify hot reload issues
const Product = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
