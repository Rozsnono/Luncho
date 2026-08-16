import { getFoods } from '@/actions/foodActions';
import { getMonthlyMenus } from '@/actions/menuActions';
import { getWorkSchedule } from '@/actions/scheduleActions';
import CalendarGrid from '@/components/CalendarGrid';
import SidebarFoodList from '@/components/SidebarFoodlist';

export const dynamic = 'force-dynamic';

export default async function CalendarAdminPage() {
    const currentDate = new Date();
    const [foods, menus, workSchedule] = await Promise.all([
        getFoods(),
        getMonthlyMenus(currentDate.getFullYear(), currentDate.getMonth() + 1),
        getWorkSchedule(),
    ]);
    
    return (
        <div className="flex w-full h-full">
            <SidebarFoodList foods={foods} />
            <CalendarGrid
                initialMenus={menus}
                allFoods={foods}
                workSchedule={workSchedule}
                readOnly={false}
            />
        </div>
    );
}