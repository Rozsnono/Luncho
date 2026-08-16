'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/mongodb';
import { Food } from '@/models/Food';
import { DailyMenu } from '@/models/DailyMenu';
import { IFood } from '@/types';

export async function getFoods(): Promise<IFood[]> {
    await connectDB();
    const foods = await Food.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(foods));
}

export async function createFood(formData: FormData) {
    await connectDB();
    const name = formData.get('name') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const complexity = (formData.get('complexity') as "Easy" | "Normal" | "Heavy") || 'Normal';
    const allergensRaw = formData.get('allergens') as string;

    const allergens = allergensRaw
        ? allergensRaw.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

    await Food.create({
        name,
        imageUrl,
        description,
        category,
        complexity,
        allergens,
    });

    revalidatePath('/');
    revalidatePath('/admin/foods');
    revalidatePath('/admin/calendar');
    revalidatePath('/mobile');
}

export async function updateFood(id: string, formData: FormData) {
    await connectDB();
    const name = formData.get('name') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const complexity = (formData.get('complexity') as "Easy" | "Normal" | "Heavy") || 'Normal';
    const allergensRaw = formData.get('allergens') as string;

    const allergens = allergensRaw
        ? allergensRaw.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

    await Food.findByIdAndUpdate(
        id,
        {
            name,
            imageUrl,
            description,
            category,
            complexity,
            allergens,
        },
        { new: true }
    );

    revalidatePath('/');
    revalidatePath('/admin/foods');
    revalidatePath('/admin/calendar');
    revalidatePath('/mobile');
}

export async function deleteFood(id: string) {
    await connectDB();
    await Food.findByIdAndDelete(id);
    await DailyMenu.updateMany({}, { $pull: { foods: id } });

    revalidatePath('/');
    revalidatePath('/admin/foods');
    revalidatePath('/admin/calendar');
    revalidatePath('/mobile');
}