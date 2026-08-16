export type FoodComplexity = 'Easy' | 'Normal' | 'Heavy';

export interface IFood {
    _id: string;
    name: string;
    imageUrl: string;
    description: string;
    allergens: string[];
    category: string;
    complexity: FoodComplexity;
}

export interface IDailyMenu {
    _id: string;
    date: string; // 'YYYY-MM-DD'
    foods: IFood[];
}

export interface IFreeDateRange {
    startDate: string; // 'YYYY-MM-DD'
    endDate: string;   // 'YYYY-MM-DD'
    label?: string;    // e.g. "Summer Vacation", "Holiday Week"
}

export interface IWorkSchedule {
    _id?: string;
    enabled: boolean;
    mode: 'weekly' | 'cycle';
    weeklyWorkDays: number[];
    cycleStartDate: string;
    cycleWorkDays: number;
    cycleOffDays: number;
    shiftHours: string;
    customFreeDates: string[];
    freeDateRanges: IFreeDateRange[];
    showFreeDayBadges: boolean;
}