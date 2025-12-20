import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string; // Main Category (e.g., "Men's Clothing")
    subcategories: string[]; // List of subcategories (e.g., ["Hoodies", "T-shirts"])
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    subcategories: [{ type: String }],
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
