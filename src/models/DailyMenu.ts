import mongoose, { Schema, Document, Model } from 'mongoose';
import './Food'; // Ensure Food model is registered

export interface IDailyMenuDoc extends Document {
    date: string;
    foods: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const DailyMenuSchema = new Schema<IDailyMenuDoc>(
    {
        date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD'
        foods: [{ type: Schema.Types.ObjectId, ref: 'Food' }],
    },
    { timestamps: true }
);

export const DailyMenu: Model<IDailyMenuDoc> =
    mongoose.models.DailyMenu || mongoose.model<IDailyMenuDoc>('DailyMenu', DailyMenuSchema);