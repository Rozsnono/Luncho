'use server';

import { revalidatePath } from 'next/cache';
import { GoogleGenAI, Type } from '@google/genai';
import { connectDB } from '@/lib/mongodb';
import { Food } from '@/models/Food';
import { DailyMenu } from '@/models/DailyMenu';
import { WorkSchedule } from '@/models/WorkSchedule';
import { IFood, IWorkSchedule } from '@/types';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

interface GeneratePlanOptions {
    startDate: string; // 'YYYY-MM-DD'
    endDate: string;   // 'YYYY-MM-DD'
    customPrompt?: string;
    mealsPerDay?: number;
    overwriteExisting?: boolean;
}

export async function generateAIMealPlan(options: GeneratePlanOptions) {
    try {
        await connectDB();

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables.');
        }

        const {
            startDate,
            endDate,
            customPrompt = 'Create a balanced meal plan obeying all complexity rules.',
            mealsPerDay = 1,
            overwriteExisting = true,
        } = options;

        const foods = (await Food.find({}).lean()) as unknown as IFood[];
        if (!foods || foods.length === 0) {
            throw new Error('No foods available in the database. Please add foods first.');
        }

        const schedule = (await WorkSchedule.findOne({}).lean()) as unknown as IWorkSchedule | null;

        const datesList: { dateStr: string; dayOfWeek: string; isWorkDay: boolean }[] = [];
        const curr = new Date(startDate);
        const end = new Date(endDate);

        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            const dayOfWeek = curr.toLocaleDateString('en-US', { weekday: 'long' });

            let isWork = false;
            if (schedule && schedule.enabled) {
                if (schedule.mode === 'weekly') {
                    isWork = (schedule.weeklyWorkDays || [1, 2, 3, 4, 5]).includes(curr.getDay());
                } else if (schedule.mode === 'cycle') {
                    const start = new Date(schedule.cycleStartDate || '2026-01-01');
                    const diff = Math.floor((curr.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    const total = (schedule.cycleWorkDays || 4) + (schedule.cycleOffDays || 4);
                    if (total > 0) {
                        const idx = ((diff % total) + total) % total;
                        isWork = idx < (schedule.cycleWorkDays || 4);
                    }
                }
                if (schedule.freeDateRanges?.some((r) => dateStr >= r.startDate && dateStr <= r.endDate)) {
                    isWork = false;
                }
            }

            datesList.push({ dateStr, dayOfWeek, isWorkDay: isWork });
            curr.setDate(curr.getDate() + 1);
        }

        let existingDatesSet = new Set<string>();
        if (!overwriteExisting) {
            const existingMenus = await DailyMenu.find({
                date: { $gte: startDate, $lte: endDate },
                foods: { $exists: true, $not: { $size: 0 } },
            }).lean();
            existingDatesSet = new Set(existingMenus.map((m) => m.date));
        }

        const targetDates = datesList.filter((d) => !existingDatesSet.has(d.dateStr));
        if (targetDates.length === 0) {
            return { success: true, count: 0, message: 'All dates already have meals assigned.' };
        }

        const foodCatalog = foods.map((f) => ({
            id: f._id.toString(),
            name: f.name,
            category: f.category,
            complexity: f.complexity || 'Normal',
            allergens: f.allergens,
            description: f.description,
        }));

        const systemInstruction = `You are a culinary meal planner algorithm for the Luncho app.
Your task is to assign meals from the provided Food Catalog to the given list of calendar dates.

STRICT COMPLEXITY & RECURRENCE RULES:
1. 'Heavy' complexity foods: These represent batch-cooked, hearty meals (e.g. big stews, casseroles, roasts). Whenever you schedule a 'Heavy' food on Day X, you MUST repeat that exact same 'Heavy' food on Day X+1 (two consecutive days in a row).
2. 'Easy' complexity foods: These represent quick daily meals. You must NOT repeat the same 'Easy' food within a 7-day window.
3. 'Normal' complexity foods: Standard rotation. Do not repeat on consecutive days.
4. If a day is marked as 'isWorkDay: true', prioritize 'Easy' meals or leftovers from a previous day's 'Heavy' batch.
5. Only use valid 'id' values from the Food Catalog.
6. Select ${mealsPerDay} meal(s) per day.
7. Obey additional instructions: "${customPrompt}".
8. Output must strictly conform to the JSON schema.`;

        const prompt = `
Food Catalog:
${JSON.stringify(foodCatalog, null, 2)}

Target Dates to Plan:
${JSON.stringify(targetDates, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.3,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    foodIds: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                    },
                                },
                                required: ['date', 'foodIds'],
                            },
                        },
                    },
                    required: ['plan'],
                },
            },
        });

        const resultText = response.text;
        if (!resultText) {
            throw new Error('Gemini returned an empty response.');
        }

        const parsed = JSON.parse(resultText) as {
            plan: { date: string; foodIds: string[] }[];
        };

        for (const item of parsed.plan) {
            const validFoodIds = item.foodIds.filter((id) =>
                foods.some((f) => f._id.toString() === id)
            );

            if (validFoodIds.length > 0) {
                if (overwriteExisting) {
                    await DailyMenu.findOneAndUpdate(
                        { date: item.date },
                        { $set: { foods: validFoodIds } },
                        { upsert: true, new: true }
                    );
                } else {
                    await DailyMenu.findOneAndUpdate(
                        { date: item.date },
                        { $addToSet: { foods: { $each: validFoodIds } } },
                        { upsert: true, new: true }
                    );
                }
            }
        }

        revalidatePath('/');
        revalidatePath('/admin/calendar');
        revalidatePath('/mobile');

        return {
            success: true,
            count: parsed.plan.length,
            message: `Successfully planned meals with complexity rules for ${parsed.plan.length} days!`,
        };
    } catch (error: any) {
        console.error('Error in generateAIMealPlan:', error);
        return {
            success: false,
            count: 0,
            message: error?.message || 'Failed to generate meal plan with Gemini.',
        };
    }
}