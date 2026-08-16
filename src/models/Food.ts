import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFoodDoc extends Document {
    name: string;
    imageUrl: string;
    description: string;
    allergens: string[];
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

const FoodSchema = new Schema<IFoodDoc>(
    {
        name: { type: String, required: true, trim: true },
        imageUrl: { type: String, required: true },
        description: { type: String, required: true },
        allergens: { type: [String], default: [] },
        category: { type: String, required: true, default: 'Main' },
    },
    { timestamps: true }
);

export const Food: Model<IFoodDoc> = mongoose.models.Food || mongoose.model<IFoodDoc>('Food', FoodSchema);