'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    CalendarDays,
    Layers,
    UtensilsCrossed,
    Sun,
    Moon,
    Briefcase,
    Sparkles,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import WorkScheduleModal from './WorkScheduleModal';
import AIPlannerModal from './AIPlannerModal';
import { IWorkSchedule } from '@/types';

interface HeaderProps {
    initialSchedule?: IWorkSchedule;
}

export default function Header({ initialSchedule }: HeaderProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);

    if (pathname?.startsWith('/mobile')) {
        return null;
    }

    const fallbackSchedule: IWorkSchedule = initialSchedule || {
        enabled: true,
        mode: 'weekly',
        weeklyWorkDays: [1, 2, 3, 4, 5],
        cycleStartDate: new Date().toISOString().split('T')[0],
        cycleWorkDays: 4,
        cycleOffDays: 4,
        shiftHours: '08:00 - 16:30',
        customFreeDates: [],
        freeDateRanges: [],
        showFreeDayBadges: true,
    };

    return (
        <header className="bg-white dark:bg-[#141416] border-b border-gray-200/80 dark:border-zinc-800/90 px-6 py-2 flex items-center justify-between shadow-xs transition-colors duration-200 sticky top-0 z-40">
            <Link href="/" className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#d9222a]">
                    <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#d9222a]">Luncho</span>
            </Link>

            <div className="flex items-center space-x-2">
                <Link
                    href="/admin/calendar"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${pathname.includes('/calendar') || pathname === '/'
                            ? 'bg-red-50 dark:bg-red-950/30 text-[#d9222a] border border-red-200/60 dark:border-red-900/50'
                            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                        }`}
                >
                    <CalendarDays className="w-4 h-4 text-[#d9222a]" />
                    <div className="flex flex-col text-left leading-tight">
                        <span className="font-semibold">Dashboard</span>
                        <span className="text-[10px] text-red-500 font-normal">current month</span>
                    </div>
                </Link>

                <Link
                    href="/admin/foods"
                    className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${pathname === '/admin/foods'
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100'
                            : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Manage Foods</span>
                </Link>

                {/* Gemini AI Auto-Plan Button */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAiModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500/15 via-orange-500/15 to-amber-500/15 border border-red-300 dark:border-red-800 text-[#d9222a] dark:text-red-400 hover:shadow-xs transition-all"
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>AI Auto-Plan</span>
                </motion.button>

                {/* Work Schedule Button */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setScheduleModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 transition-colors"
                >
                    <Briefcase className="w-3.5 h-3.5 text-red-500" />
                    <span>Work Schedule</span>
                </motion.button>

                {/* Dark Mode Toggle */}
                <motion.button
                    whileTap={{ rotate: 180, scale: 0.9 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
                </motion.button>
            </div>

            <WorkScheduleModal
                isOpen={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                schedule={fallbackSchedule}
            />

            <AIPlannerModal
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
            />
        </header>
    );
}