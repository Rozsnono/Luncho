'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { WorkSchedule } from '@/models/WorkSchedule';
import { IWorkSchedule } from '@/types';

export async function getWorkSchedule(): Promise<IWorkSchedule> {
    await connectDB();
    let schedule = await WorkSchedule.findOne({}).lean();

    if (!schedule) {
        schedule = await WorkSchedule.create({
            enabled: true,
            mode: 'weekly',
            weeklyWorkDays: [1, 2, 3, 4, 5],
            cycleStartDate: new Date().toISOString().split('T')[0],
            cycleWorkDays: 4,
            cycleOffDays: 4,
            shiftHours: '08:00 - 16:30',
            customFreeDates: [],
            showFreeDayBadges: true,
        });
    }

    return JSON.parse(JSON.stringify(schedule));
}

export async function saveWorkSchedule(data: Partial<IWorkSchedule>) {
    await connectDB();
    await WorkSchedule.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true });

    revalidatePath('/');
    revalidatePath('/admin/calendar');
}