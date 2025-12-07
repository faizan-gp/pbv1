import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDesign extends Document {
    userId: mongoose.Types.ObjectId;
    productId: string; // Linking to our Product ID string (e.g. 't-shirt-standard')
    name: string;
    previewImage: string; // Data URL or storage path
    config: any; // Flexible JSON for fabric.js state or other metadata
    createdAt: Date;
    updatedAt: Date;
}

const DesignSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    previewImage: { type: String, required: true },
    config: { type: Schema.Types.Mixed }, // Store the JSON export from Fabric.js
}, { timestamps: true });

const Design = (mongoose.models.Design as Model<IDesign>) || mongoose.model<IDesign>('Design', DesignSchema);

export default Design;
