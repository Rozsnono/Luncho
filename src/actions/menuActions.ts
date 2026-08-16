'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { DailyMenu } from '@/models/DailyMenu';
import { IDailyMenu } from '@/types';

export async function getMonthlyMenus(year: number, month: number): Promise<IDailyMenu[]> {
    await connectDB();
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const regex = new RegExp(`^${year}-${monthStr}`);

    const menus = await DailyMenu.find({ date: { $regex: regex } })
        .populate('foods')
        .lean();

    return JSON.parse(JSON.stringify(menus));
}

export async function addFoodToDate(date: string, foodId: string) {
    await connectDB();

    await DailyMenu.findOneAndUpdate(
        { date },
        { $push: { foods: foodId } },
        { upsert: true, new: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/calendar');
}

export async function removeFoodFromDate(date: string, foodId: string) {
    await connectDB();

    const menu = await DailyMenu.findOne({ date });
    if (menu) {
        const index = menu.foods.findIndex((id) => id.toString() === foodId);
        if (index !== -1) {
            menu.foods.splice(index, 1);
            if (menu.foods.length === 0) {
                await DailyMenu.deleteOne({ _id: menu._id });
            } else {
                await menu.save();
            }
        }
    }

    revalidatePath('/');
    revalidatePath('/admin/calendar');
}