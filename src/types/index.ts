export interface IFood {
    _id: string;
    name: string;
    imageUrl: string;
    description: string;
    allergens: string[];
    category: string;
}

export interface IDailyMenu {
    _id: string;
    date: string; // 'YYYY-MM-DD'
    foods: IFood[];
}

export interface IWorkSchedule {
    _id?: string;
    enabled: boolean;
    mode: 'weekly' | 'cycle';
    // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 0 = Sun
    weeklyWorkDays: number[];
    cycleStartDate: string;
    cycleWorkDays: number;
    cycleOffDays: number;
    shiftHours: string;
    customFreeDates: string[]; // Specific dates marked as vacation/free ('YYYY-MM-DD')
    customWorkDates: string[]; // Specific dates marked as overtime/work ('YYYY-MM-DD')
    showFreeDayBadges: boolean;
}