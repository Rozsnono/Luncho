export interface IFood {
    _id: string;
    name: string;
    imageUrl: string;
    description: string;
    allergens: string[];
    category: 'Main' | 'Soup' | 'Dessert' | string;
}

export interface IDailyMenu {
    _id: string;
    date: string; // 'YYYY-MM-DD'
    foods: IFood[];
}