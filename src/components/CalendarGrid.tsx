'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { IDailyMenu, IFood } from '@/types';
import { addFoodToDate, removeFoodFromDate } from '@/actions/menuActions';

interface CalendarGridProps {
    initialMenus: IDailyMenu[];
    allFoods: IFood[];
    readOnly?: boolean;
}

export default function CalendarGrid({
    initialMenus,
    allFoods,
    readOnly = false,
}: CalendarGridProps) {
    // Real-time current date
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const todayDateStr = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(
        todayDay
    ).padStart(2, '0')}`;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [dragOverDate, setDragOverDate] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const headerDateString = `${monthNames[month]} ${year}`;

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const startingDayIndex = (firstDayOfMonth + 6) % 7; // Monday start

    // Generate calendar days
    const days = [];

    // Trailing previous month days
    for (let i = startingDayIndex - 1; i >= 0; i--) {
        const dayNumber = prevMonthDays - i;
        const prevMonthDate = new Date(year, month - 1, dayNumber);
        const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        days.push({ dayNumber, dateStr, isCurrentMonth: false, isToday: dateStr === todayDateStr });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = String(i).padStart(2, '0');
        const mStr = String(month + 1).padStart(2, '0');
        const dateStr = `${year}-${mStr}-${dayStr}`;
        days.push({ dayNumber: i, dateStr, isCurrentMonth: true, isToday: dateStr === todayDateStr });
    }

    // Leading next month days
    const remainingCells = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({ dayNumber: i, dateStr, isCurrentMonth: false, isToday: dateStr === todayDateStr });
    }

    // Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent, dateStr: string) => {
        if (readOnly) return;
        e.preventDefault();
        setDragOverDate(dateStr);
    };

    const handleDragLeave = () => {
        setDragOverDate(null);
    };

    const handleDrop = async (e: React.DragEvent, dateStr: string) => {
        if (readOnly) return;
        e.preventDefault();
        setDragOverDate(null);
        const foodId = e.dataTransfer.getData('text/plain');
        if (foodId) {
            await addFoodToDate(dateStr, foodId);
        }
    };

    const handleRemove = async (dateStr: string, foodId: string) => {
        if (readOnly) return;
        await removeFoodFromDate(dateStr, foodId);
    };

    const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Top Header Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <motion.h1
                        key={headerDateString}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold text-gray-900 tracking-tight"
                    >
                        {headerDateString}
                    </motion.h1>

                    <button
                        onClick={goToToday}
                        className="text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-all flex items-center space-x-1"
                    >
                        <CalendarIcon className="w-3.5 h-3.5 text-[#d9222a]" />
                        <span>Today</span>
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={prevMonth}
                            className="p-1.5 hover:bg-gray-50 border-r border-gray-200 text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={nextMonth}
                            className="p-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <Link href="/admin/foods">
                        <motion.span
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-block bg-[#d9222a] hover:bg-[#c01c24] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                            Manage Foods
                        </motion.span>
                    </Link>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                {/* Day Header Row */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/70 text-center text-xs font-bold text-gray-600 py-2.5">
                    {dayHeaders.map((dh, idx) => (
                        <div key={idx}>{dh}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map(({ dayNumber, dateStr, isCurrentMonth, isToday }, idx) => {
                        const dayMenu = initialMenus.find((m) => m.date === dateStr);
                        const isHovered = dragOverDate === dateStr;

                        return (
                            <div
                                key={idx}
                                onDragOver={(e) => handleDragOver(e, dateStr)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, dateStr)}
                                className={`min-h-[110px] border-b border-r border-gray-100 p-1.5 transition-all relative flex flex-col justify-between ${!isCurrentMonth
                                        ? 'bg-gray-50/40 text-gray-400'
                                        : isToday
                                            ? 'bg-[#fdeeed]/80' // Salmon/peach highlight matching screenshot
                                            : 'bg-white'
                                    } ${isHovered ? 'ring-2 ring-[#d9222a] ring-inset bg-red-100/50' : ''}`}
                            >
                                {/* Date Header / Today Badge */}
                                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                                    <span
                                        className={`${isToday
                                                ? 'text-[#d9222a] font-bold flex items-center space-x-1'
                                                : isCurrentMonth
                                                    ? 'text-gray-800'
                                                    : 'text-gray-400'
                                            }`}
                                    >
                                        <span>{dayNumber}</span>
                                        {isToday && (
                                            <span className="text-[9px] bg-[#d9222a] text-white px-1.5 py-0.2 rounded-full font-medium ml-1">
                                                Today
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* Assigned Food Badges */}
                                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                                    <AnimatePresence>
                                        {dayMenu?.foods?.map((food: IFood, fIdx: number) => (
                                            <motion.div
                                                key={`${food._id}-${fIdx}`}
                                                initial={{ opacity: 0, scale: 0.85, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.15 }}
                                                className="group flex items-center justify-between bg-white/90 border border-orange-200/80 rounded-md p-1 hover:shadow-2xs shadow-2xs transition-all"
                                            >
                                                <div className="flex items-center space-x-1.5 min-w-0">
                                                    <img
                                                        src={food.imageUrl}
                                                        alt={food.name}
                                                        className="w-5 h-5 rounded object-cover flex-shrink-0"
                                                    />
                                                    <span className="text-[11px] font-medium text-gray-800 truncate">
                                                        {food.name}
                                                    </span>
                                                </div>

                                                {!readOnly && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemove(dateStr, food._id)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity ml-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </motion.button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}