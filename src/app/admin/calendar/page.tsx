import { getFoods } from '@/actions/foodActions';
import { getMonthlyMenus } from '@/actions/menuActions';
import CalendarGrid from '@/components/CalendarGrid';
import SidebarFoodList from '@/components/SidebarFoodlist';

export const dynamic = 'force-dynamic';

export default async function CalendarAdminPage() {
    const currentDate = new Date();
    const [foods, menus] = await Promise.all([
        getFoods(),
        getMonthlyMenus(currentDate.getFullYear(), currentDate.getMonth() + 1),
    ]);

    return (
        <div className="flex w-full h-full">
            <SidebarFoodList foods={foods} />
            <CalendarGrid initialMenus={menus} allFoods={foods} readOnly={false} />
        </div>
    );
}