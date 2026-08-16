'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Calendar as CalendarIcon,
    Briefcase,
    Coffee,
    Palmtree,
} from 'lucide-react';
import Link from 'next/link';
import { IDailyMenu, IFood, IWorkSchedule } from '@/types';
import { addFoodToDate, removeFoodFromDate } from '@/actions/menuActions';

interface CalendarGridProps {
    initialMenus: IDailyMenu[];
    allFoods: IFood[];
    workSchedule?: IWorkSchedule;
    readOnly?: boolean;
}

export default function CalendarGrid({
    initialMenus,
    allFoods,
    workSchedule,
    readOnly = false,
}: CalendarGridProps) {
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
        today.getDate()
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
    const startingDayIndex = (firstDayOfMonth + 6) % 7;

    // Determine day status: 'work' | 'free' | 'vacation' | 'none'
    const getDayStatus = (dateStr: string, dateObj: Date) => {
        if (!workSchedule || !workSchedule.enabled) return 'none';

        // 1. Vacation / Custom Free Day Override
        if (workSchedule.customFreeDates?.includes(dateStr)) {
            return 'vacation';
        }

        // 2. Weekly Days Mode (Mon=1, Tue=2 ... Sun=0)
        if (workSchedule.mode === 'weekly') {
            const dayOfWeek = dateObj.getDay();
            const isWork = (workSchedule.weeklyWorkDays || [1, 2, 3, 4, 5]).includes(dayOfWeek);
            return isWork ? 'work' : 'free';
        }

        // 3. Rotating Cycle Mode
        if (workSchedule.mode === 'cycle') {
            const baseStart = new Date(workSchedule.cycleStartDate || '2026-01-01');
            const diffTime = dateObj.getTime() - baseStart.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            const totalCycle = (workSchedule.cycleWorkDays || 4) + (workSchedule.cycleOffDays || 4);
            if (totalCycle <= 0) return 'none';

            const cycleIndex = ((diffDays % totalCycle) + totalCycle) % totalCycle;
            return cycleIndex < (workSchedule.cycleWorkDays || 4) ? 'work' : 'free';
        }

        return 'none';
    };

    const days = [];
    for (let i = startingDayIndex - 1; i >= 0; i--) {
        const dayNumber = prevMonthDays - i;
        const prevMonthDate = new Date(year, month - 1, dayNumber);
        const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        days.push({
            dayNumber,
            dateStr,
            isCurrentMonth: false,
            isToday: dateStr === todayDateStr,
            status: getDayStatus(dateStr, prevMonthDate),
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = String(i).padStart(2, '0');
        const mStr = String(month + 1).padStart(2, '0');
        const dateStr = `${year}-${mStr}-${dayStr}`;
        const dateObj = new Date(year, month, i);
        days.push({
            dayNumber: i,
            dateStr,
            isCurrentMonth: true,
            isToday: dateStr === todayDateStr,
            status: getDayStatus(dateStr, dateObj),
        });
    }

    const remainingCells = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({
            dayNumber: i,
            dateStr,
            isCurrentMonth: false,
            isToday: dateStr === todayDateStr,
            status: getDayStatus(dateStr, nextMonthDate),
        });
    }

    const handleDragOver = (e: React.DragEvent, dateStr: string) => {
        if (readOnly) return;
        e.preventDefault();
        setDragOverDate(dateStr);
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
        <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#fafafa] dark:bg-[#0e0e10] transition-colors duration-200">
            {/* Top Header Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <motion.h1
                        key={headerDateString}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight"
                    >
                        {headerDateString}
                    </motion.h1>

                    <button
                        onClick={goToToday}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 shadow-2xs transition-all flex items-center space-x-1"
                    >
                        <CalendarIcon className="w-3.5 h-3.5 text-[#d9222a]" />
                        <span>Today</span>
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={prevMonth}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 border-r border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={nextMonth}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <Link href="/admin/foods">
                        <motion.span
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-block bg-[#d9222a] hover:bg-[#c01c24] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                            Manage Foods
                        </motion.span>
                    </Link>
                </div>
            </div>

            {/* Calendar Matrix Box */}
            <div className="border border-gray-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-[#141416] shadow-xs">
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/60 text-center text-xs font-bold text-gray-600 dark:text-zinc-400 py-2.5">
                    {dayHeaders.map((dh, idx) => (
                        <div key={idx}>{dh}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map(({ dayNumber, dateStr, isCurrentMonth, isToday, status }, idx) => {
                        const dayMenu = initialMenus.find((m) => m.date === dateStr);
                        const isHovered = dragOverDate === dateStr;

                        return (
                            <div
                                key={idx}
                                onDragOver={(e) => handleDragOver(e, dateStr)}
                                onDragLeave={() => setDragOverDate(null)}
                                onDrop={(e) => handleDrop(e, dateStr)}
                                className={`min-h-[114px] border-b border-r border-gray-100 dark:border-zinc-800/70 p-1.5 transition-all relative flex flex-col justify-between ${!isCurrentMonth
                                        ? 'bg-gray-50/40 dark:bg-zinc-950/40 text-gray-400 dark:text-zinc-600'
                                        : isToday
                                            ? 'bg-[#fdeeed]/90 dark:bg-[#2a1314]'
                                            : status === 'work'
                                                ? 'bg-red-50/20 dark:bg-red-950/10'
                                                : status === 'vacation'
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                                                    : status === 'free'
                                                        ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                                                        : 'bg-white dark:bg-[#141416]'
                                    } ${isHovered ? 'ring-2 ring-[#d9222a] ring-inset bg-red-100/50 dark:bg-red-950/40' : ''}`}
                            >
                                {/* Cell Header: Day Number + Work / Free / Vacation Badges */}
                                <div className="flex justify-between items-start text-xs font-semibold mb-1">
                                    <span
                                        className={`${isToday
                                                ? 'text-[#d9222a] dark:text-red-400 font-bold flex items-center space-x-1'
                                                : isCurrentMonth
                                                    ? 'text-gray-800 dark:text-zinc-200'
                                                    : 'text-gray-400 dark:text-zinc-600'
                                            }`}
                                    >
                                        <span>{dayNumber}</span>
                                        {isToday && (
                                            <span className="text-[9px] bg-[#d9222a] text-white px-1.5 py-0.2 rounded-full font-medium ml-1">
                                                Today
                                            </span>
                                        )}
                                    </span>

                                    {/* Schedule Indicator Badges */}
                                    {status === 'vacation' && (
                                        <span className="flex items-center space-x-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900/60">
                                            <Palmtree className="w-2.5 h-2.5" />
                                            <span>Vacation</span>
                                        </span>
                                    )}

                                    {status === 'work' && (
                                        <span
                                            title={`Shift: ${workSchedule?.shiftHours}`}
                                            className="flex items-center space-x-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-md bg-red-100/80 dark:bg-red-950/60 text-[#d9222a] dark:text-red-400 border border-red-200/70 dark:border-red-900/50"
                                        >
                                            <Briefcase className="w-2.5 h-2.5" />
                                            <span className="hidden sm:inline truncate max-w-[55px]">
                                                {workSchedule?.shiftHours || 'Work'}
                                            </span>
                                        </span>
                                    )}

                                    {status === 'free' && workSchedule?.showFreeDayBadges && (
                                        <span className="flex items-center space-x-0.5 text-[9px] font-medium px-1 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                                            <Coffee className="w-2.5 h-2.5" />
                                            <span className="hidden sm:inline">Free</span>
                                        </span>
                                    )}
                                </div>

                                {/* Assigned Meals */}
                                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                                    <AnimatePresence>
                                        {dayMenu?.foods?.map((food: IFood, fIdx: number) => (
                                            <motion.div
                                                key={`${food._id}-${fIdx}`}
                                                initial={{ opacity: 0, scale: 0.85, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.15 }}
                                                className="group flex items-center justify-between bg-white/95 dark:bg-zinc-900/90 border border-orange-200/80 dark:border-zinc-700 rounded-lg p-1 hover:shadow-2xs shadow-2xs transition-all"
                                            >
                                                <div className="flex items-center space-x-1.5 min-w-0">
                                                    <img
                                                        src={food.imageUrl}
                                                        alt={food.name}
                                                        className="w-5 h-5 rounded object-cover flex-shrink-0 bg-gray-100 dark:bg-zinc-800"
                                                    />
                                                    <span className="text-[11px] font-medium text-gray-800 dark:text-zinc-200 truncate">
                                                        {food.name}
                                                    </span>
                                                </div>

                                                {!readOnly && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemove(dateStr, food._id)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-1"
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