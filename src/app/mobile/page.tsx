'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Briefcase,
    Palmtree,
    Coffee,
    Sun,
    Moon,
    UtensilsCrossed,
    Search,
    X,
    Sparkles,
    Flame,
    Zap,
} from 'lucide-react';
import { getFoods } from '@/actions/foodActions';
import { getMonthlyMenus, addFoodToDate, removeFoodFromDate } from '@/actions/menuActions';
import { getWorkSchedule } from '@/actions/scheduleActions';
import { useTheme } from '@/components/ThemeProvider';
import WorkScheduleModal from '@/components/WorkScheduleModal';
import FoodModal from '@/components/FoodModal';
import AIPlannerModal from '@/components/AIPlannerModal';
import { IFood, IDailyMenu, IWorkSchedule } from '@/types';

export default function MobileMealPage() {
    const { theme, toggleTheme } = useTheme();

    const [foods, setFoods] = useState<IFood[]>([]);
    const [menus, setMenus] = useState<IDailyMenu[]>([]);
    const [schedule, setSchedule] = useState<IWorkSchedule | null>(null);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);

    const [isAddMealSheetOpen, setIsAddMealSheetOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
    ).padStart(2, '0')}`;

    const selectedDateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
    ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    const loadData = async () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const [foodsData, menusData, scheduleData] = await Promise.all([
            getFoods(),
            getMonthlyMenus(year, month),
            getWorkSchedule(),
        ]);
        setFoods(foodsData);
        setMenus(menusData);
        setSchedule(scheduleData);
    };

    useEffect(() => {
        loadData();
    }, [selectedDate.getFullYear(), selectedDate.getMonth()]);

    const getDaysOfWeek = () => {
        const current = new Date();
        current.setDate(current.getDate() + weekOffset * 7);

        const day = current.getDay();
        const diff = (day + 6) % 7;

        const monday = new Date(current);
        monday.setDate(current.getDate() - diff);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
                d.getDate()
            ).padStart(2, '0')}`;
            week.push({
                dateObj: d,
                dateStr: dStr,
                dayNum: d.getDate(),
                dayName: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
            });
        }
        return week;
    };

    const weekDays = getDaysOfWeek();

    const getDayStatus = (dStr: string, dObj: Date) => {
        if (!schedule || !schedule.enabled) return 'none';

        if (schedule.freeDateRanges && schedule.freeDateRanges.length > 0) {
            const isInsideRange = schedule.freeDateRanges.some(
                (r) => dStr >= r.startDate && dStr <= r.endDate
            );
            if (isInsideRange) return 'vacation';
        }

        if (schedule.customFreeDates?.includes(dStr)) return 'vacation';

        if (schedule.mode === 'weekly') {
            const isWork = (schedule.weeklyWorkDays || [1, 2, 3, 4, 5]).includes(dObj.getDay());
            return isWork ? 'work' : 'free';
        }

        if (schedule.mode === 'cycle') {
            const start = new Date(schedule.cycleStartDate || '2026-01-01');
            const diff = Math.floor((dObj.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const total = (schedule.cycleWorkDays || 4) + (schedule.cycleOffDays || 4);
            if (total <= 0) return 'none';
            const cycleIdx = ((diff % total) + total) % total;
            return cycleIdx < (schedule.cycleWorkDays || 4) ? 'work' : 'free';
        }
        return 'none';
    };

    const activeStatus = getDayStatus(selectedDateStr, selectedDate);
    const activeMenu = menus.find((m) => m.date === selectedDateStr);

    const handleAddFoodToSelectedDay = async (foodId: string) => {
        await addFoodToDate(selectedDateStr, foodId);
        await loadData();
        setIsAddMealSheetOpen(false);
    };

    const handleRemoveFood = async (foodId: string) => {
        await removeFoodFromDate(selectedDateStr, foodId);
        await loadData();
    };

    const categories = ['All', ...Array.from(new Set(foods.map((f) => f.category)))];
    const filteredFoods = foods.filter((f) => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f8f9fa] dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 overflow-hidden select-none">
            <header className="flex-shrink-0 px-3.5 py-2 bg-white dark:bg-[#121215] border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between z-20">
                <div className="flex items-center space-x-1.5">
                    <div className="p-1 bg-red-50 dark:bg-red-950/40 text-[#d9222a] rounded-lg">
                        <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-extrabold tracking-tight text-[#d9222a]">Luncho</span>
                    <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 pl-1">
                        {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-red-500/15 to-amber-500/15 border border-red-300 dark:border-red-800 text-[#d9222a] dark:text-red-400 text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-2xs"
                    >
                        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                        <span>AI</span>
                    </button>

                    <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900">
                        <button
                            onClick={() => setWeekOffset((prev) => prev - 1)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 border-r border-gray-200 dark:border-zinc-800"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-zinc-400" />
                        </button>
                        <button
                            onClick={() => {
                                setWeekOffset(0);
                                setSelectedDate(new Date());
                            }}
                            className="px-2 text-[10px] font-bold text-gray-700 dark:text-zinc-300"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setWeekOffset((prev) => prev + 1)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 border-l border-gray-200 dark:border-zinc-800"
                        >
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 dark:text-zinc-400" />
                        </button>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300"
                    >
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-gray-700" />}
                    </button>
                </div>
            </header>

            <div className="flex-shrink-0 bg-white dark:bg-[#121215] border-b border-gray-200 dark:border-zinc-800 px-2 py-1.5">
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((item) => {
                        const isSelected = item.dateStr === selectedDateStr;
                        const isToday = item.dateStr === todayStr;
                        const status = getDayStatus(item.dateStr, item.dateObj);

                        return (
                            <motion.button
                                key={item.dateStr}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(item.dateObj)}
                                className={`flex flex-col items-center justify-center py-1.5 rounded-xl border transition-all ${isSelected
                                        ? 'bg-[#d9222a] text-white border-[#d9222a] shadow-xs'
                                        : isToday
                                            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-[#d9222a]'
                                            : 'bg-gray-50/70 dark:bg-zinc-900/80 border-gray-200/80 dark:border-zinc-800/80 text-gray-700 dark:text-zinc-300'
                                    }`}
                            >
                                <span className={`text-[9px] font-semibold ${isSelected ? 'text-red-100' : 'text-gray-400'}`}>
                                    {item.dayName}
                                </span>
                                <span className="text-xs font-bold leading-tight mt-0.5">{item.dayNum}</span>

                                <span
                                    className={`w-1 h-1 rounded-full mt-0.5 ${status === 'work'
                                            ? isSelected
                                                ? 'bg-white'
                                                : 'bg-red-500'
                                            : status === 'vacation'
                                                ? isSelected
                                                    ? 'bg-white'
                                                    : 'bg-emerald-500'
                                                : 'opacity-0'
                                        }`}
                                />
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-shrink-0 px-3.5 py-2 bg-gray-50 dark:bg-zinc-900/60 border-b border-gray-200/80 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-xs font-extrabold truncate text-gray-900 dark:text-zinc-100">
                        {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>

                    {activeStatus === 'work' && (
                        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-red-100/80 dark:bg-red-950/50 text-[#d9222a] dark:text-red-400 text-[10px] font-bold border border-red-200 dark:border-red-900/50">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate max-w-[65px]">{schedule?.shiftHours || 'Work'}</span>
                        </span>
                    )}

                    {activeStatus === 'vacation' && (
                        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/50">
                            <Palmtree className="w-3 h-3" />
                            <span>Vacation</span>
                        </span>
                    )}

                    {activeStatus === 'free' && (
                        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/50">
                            <Coffee className="w-3 h-3" />
                            <span>Free</span>
                        </span>
                    )}
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddMealSheetOpen(true)}
                    className="flex items-center space-x-1 bg-[#d9222a] hover:bg-[#c01c24] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs whitespace-nowrap"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Meal</span>
                </motion.button>
            </div>

            <main className="flex-1 overflow-y-auto p-3 space-y-2 pb-16">
                <AnimatePresence mode="popLayout">
                    {activeMenu?.foods && activeMenu.foods.length > 0 ? (
                        activeMenu.foods.map((food) => (
                            <motion.div
                                key={food._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-[#121215] border border-gray-200/90 dark:border-zinc-800 p-2 rounded-xl flex items-center justify-between shadow-2xs"
                            >
                                <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                                    <img
                                        src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                        alt={food.name}
                                        className="w-11 h-11 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800 flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center space-x-1">
                                            <h4 className="text-xs font-bold truncate text-gray-900 dark:text-zinc-100">{food.name}</h4>
                                            {food.complexity === 'Heavy' && (
                                                <Flame className="w-3 h-3 text-purple-500 flex-shrink-0" />
                                            )}
                                            {food.complexity === 'Easy' && (
                                                <Zap className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-1">
                                            {food.description}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[8px] font-bold px-1.5 py-0.2 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 rounded">
                                                {food.category}
                                            </span>
                                            {food.complexity && (
                                                <span
                                                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${food.complexity === 'Heavy'
                                                            ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                                                            : food.complexity === 'Easy'
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                                                : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                                                        }`}
                                                >
                                                    {food.complexity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemoveFood(food._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-[#121215] border border-dashed border-gray-200 dark:border-zinc-800/80 rounded-2xl">
                            <UtensilsCrossed className="w-7 h-7 text-gray-300 dark:text-zinc-600 mx-auto mb-1.5" />
                            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">No meals planned</p>
                            <div className="flex items-center justify-center space-x-2 mt-2">
                                <button
                                    onClick={() => setIsAddMealSheetOpen(true)}
                                    className="text-[11px] font-bold text-[#d9222a] bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-lg"
                                >
                                    + Add Meal
                                </button>
                                <button
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg flex items-center space-x-1"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    <span>AI Auto-Plan</span>
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            <nav className="flex-shrink-0 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 py-2 px-6 flex items-center justify-around z-30">
                <button
                    onClick={() => setIsAddMealSheetOpen(true)}
                    className="flex flex-col items-center text-[#d9222a]"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5">Add Meal</span>
                </button>

                <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="flex flex-col items-center text-amber-600 dark:text-amber-400"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5">AI Plan</span>
                </button>

                <button
                    onClick={() => setIsFoodModalOpen(true)}
                    className="flex flex-col items-center text-gray-500 dark:text-zinc-400"
                >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="text-[9px] font-semibold mt-0.5">New Recipe</span>
                </button>

                <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex flex-col items-center text-gray-500 dark:text-zinc-400"
                >
                    <Briefcase className="w-4 h-4" />
                    <span className="text-[9px] font-semibold mt-0.5">Schedule</span>
                </button>
            </nav>

            <AnimatePresence>
                {isAddMealSheetOpen && (
                    <div className="fixed inset-0 z-50 flex items-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                            onClick={() => setIsAddMealSheetOpen(false)}
                        />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-[#18181b] border-t border-gray-200 dark:border-zinc-800 rounded-t-2xl w-full p-4 shadow-2xl relative z-10 max-h-[75vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                                <h3 className="text-xs font-bold">Add Meal to {selectedDateStr}</h3>
                                <button
                                    onClick={() => setIsAddMealSheetOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="py-2 space-y-1.5">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs"
                                    />
                                </div>

                                <div className="flex space-x-1 overflow-x-auto pb-0.5 no-scrollbar">
                                    {categories.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedCategory(c)}
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${selectedCategory === c
                                                    ? 'bg-[#d9222a] text-white'
                                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                                {filteredFoods.map((f) => (
                                    <div
                                        key={f._id}
                                        onClick={() => handleAddFoodToSelectedDay(f._id)}
                                        className="flex items-center justify-between p-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 active:scale-98 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-2 min-w-0">
                                            <img
                                                src={f.imageUrl}
                                                alt={f.name}
                                                className="w-8 h-8 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-1">
                                                    <h4 className="text-[11px] font-bold truncate text-gray-900 dark:text-zinc-100">{f.name}</h4>
                                                    {f.complexity === 'Heavy' && <Flame className="w-3 h-3 text-purple-500" />}
                                                    {f.complexity === 'Easy' && <Zap className="w-3 h-3 text-emerald-500" />}
                                                </div>
                                                <span className="text-[9px] text-gray-400">{f.category}</span>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-[#d9222a] rounded-md font-bold text-[10px]">
                                            + Add
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {schedule && (
                <WorkScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => {
                        setIsScheduleModalOpen(false);
                        loadData();
                    }}
                    schedule={schedule}
                />
            )}

            <FoodModal
                isOpen={isFoodModalOpen}
                onClose={() => {
                    setIsFoodModalOpen(false);
                    loadData();
                }}
                existingCategories={categories.filter((c) => c !== 'All')}
            />

            <AIPlannerModal
                isOpen={isAiModalOpen}
                onClose={() => {
                    setIsAiModalOpen(false);
                    loadData();
                }}
            />
        </div>
    );
}