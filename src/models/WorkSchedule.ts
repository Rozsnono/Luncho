import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkScheduleDoc extends Document {
    enabled: boolean;
    mode: 'weekly' | 'cycle';
    weeklyWorkDays: number[];
    cycleStartDate: string;
    cycleWorkDays: number;
    cycleOffDays: number;
    shiftHours: string;
    customFreeDates: string[];
    customWorkDates: string[];
    showFreeDayBadges: boolean;
}

const WorkScheduleSchema = new Schema<IWorkScheduleDoc>(
    {
        enabled: { type: Boolean, default: true },
        mode: { type: String, enum: ['weekly', 'cycle'], default: 'weekly' },
        weeklyWorkDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri default
        cycleStartDate: { type: String, default: '2026-01-01' },
        cycleWorkDays: { type: Number, default: 4 },
        cycleOffDays: { type: Number, default: 4 },
        shiftHours: { type: String, default: '08:00 - 16:30' },
        customFreeDates: { type: [String], default: [] },
        customWorkDates: { type: [String], default: [] },
        showFreeDayBadges: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const WorkSchedule: Model<IWorkScheduleDoc> =
    mongoose.models.WorkSchedule ||
    mongoose.model<IWorkScheduleDoc>('WorkSchedule', WorkScheduleSchema);