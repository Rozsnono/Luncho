import { getFoods } from '@/actions/foodActions';
import { getMonthlyMenus } from '@/actions/menuActions';
import CalendarGrid from '@/components/CalendarGrid';

export const dynamic = 'force-dynamic';

export default async function PublicPage() {
  const currentDate = new Date();
  const [foods, menus] = await Promise.all([
    getFoods(),
    getMonthlyMenus(currentDate.getFullYear(), currentDate.getMonth() + 1),
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex">
      <CalendarGrid initialMenus={menus} allFoods={foods} readOnly={true} />
    </div>
  );
}