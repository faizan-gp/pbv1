import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
    userId?: mongoose.Types.ObjectId;
    items: Array<{
        productId: string;
        designId?: mongoose.Types.ObjectId; // If it was a saved design
        quantity: number;
        price: number;
        configSnapshot?: any; // Snapshot of the configuration at purchase time
        previewSnapshot?: string; // Snapshot of visual
    }>;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingDetails: {
        name: string;
        email: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            productId: { type: String, required: true },
            designId: { type: Schema.Types.ObjectId, ref: 'Design' },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true },
            configSnapshot: { type: Schema.Types.Mixed },
            previewSnapshot: { type: String },
        }
    ],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    }
}, { timestamps: true });

// Force recompilation of model if it exists to ensure schema updates are applied in dev
if (mongoose.models.Order) {
    delete mongoose.models.Order;
}

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
