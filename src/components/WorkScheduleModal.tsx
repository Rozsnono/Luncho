'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Briefcase,
    Clock,
    Plus,
    Trash2,
    Check,
    Palmtree,
    CalendarCheck,
    RotateCcw,
} from 'lucide-react';
import { IWorkSchedule } from '@/types';
import { saveWorkSchedule } from '@/actions/scheduleActions';

interface WorkScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: IWorkSchedule;
}

const WEEK_DAYS = [
    { label: 'Mon', value: 1, full: 'Monday' },
    { label: 'Tue', value: 2, full: 'Tuesday' },
    { label: 'Wed', value: 3, full: 'Wednesday' },
    { label: 'Thu', value: 4, full: 'Thursday' },
    { label: 'Fri', value: 5, full: 'Friday' },
    { label: 'Sat', value: 6, full: 'Saturday' },
    { label: 'Sun', value: 0, full: 'Sunday' },
];

export default function WorkScheduleModal({
    isOpen,
    onClose,
    schedule,
}: WorkScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(schedule.enabled ?? true);
    const [mode, setMode] = useState<'weekly' | 'cycle'>(schedule.mode || 'weekly');
    const [weeklyWorkDays, setWeeklyWorkDays] = useState<number[]>(
        schedule.weeklyWorkDays || [1, 2, 3, 4, 5]
    );
    const [cycleStartDate, setCycleStartDate] = useState(
        schedule.cycleStartDate || new Date().toISOString().split('T')[0]
    );
    const [cycleWorkDays, setCycleWorkDays] = useState(schedule.cycleWorkDays || 4);
    const [cycleOffDays, setCycleOffDays] = useState(schedule.cycleOffDays || 4);
    const [shiftHours, setShiftHours] = useState(schedule.shiftHours || '08:00 - 16:30');
    const [showFreeDayBadges, setShowFreeDayBadges] = useState(schedule.showFreeDayBadges ?? true);
    const [customFreeDates, setCustomFreeDates] = useState<string[]>(
        schedule.customFreeDates || []
    );

    const [newFreeDate, setNewFreeDate] = useState('');

    const toggleDayOfWeek = (dayVal: number) => {
        if (weeklyWorkDays.includes(dayVal)) {
            setWeeklyWorkDays(weeklyWorkDays.filter((d) => d !== dayVal));
        } else {
            setWeeklyWorkDays([...weeklyWorkDays, dayVal].sort());
        }
    };

    const addCustomFreeDate = () => {
        if (newFreeDate && !customFreeDates.includes(newFreeDate)) {
            setCustomFreeDates([...customFreeDates, newFreeDate].sort());
            setNewFreeDate('');
        }
    };

    const removeCustomFreeDate = (dateToRemove: string) => {
        setCustomFreeDates(customFreeDates.filter((d) => d !== dateToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveWorkSchedule({
                enabled,
                mode,
                weeklyWorkDays,
                cycleStartDate,
                cycleWorkDays: Number(cycleWorkDays),
                cycleOffDays: Number(cycleOffDays),
                shiftHours,
                customFreeDates,
                showFreeDayBadges,
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative z-10 text-gray-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-red-500/10 text-[#d9222a] dark:text-red-400 rounded-xl">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold">Work & Free Schedule</h3>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                                        Customize working days, free days, and vacations
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Enabled & Badge Toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-red-500" />
                                        <span className="text-xs font-semibold">Enable Schedule</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enabled}
                                            onChange={(e) => setEnabled(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4.5 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#d9222a]" />
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800">
                                    <div className="flex items-center space-x-2">
                                        <Palmtree className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-semibold">Show Free Badges</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showFreeDayBadges}
                                            onChange={(e) => setShowFreeDayBadges(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4.5 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600" />
                                    </label>
                                </div>
                            </div>

                            {/* Mode Selection Tabs */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Schedule Type
                                </label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setMode('weekly')}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'weekly'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
                                            }`}
                                    >
                                        Weekly Work / Free Days
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('cycle')}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'cycle'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
                                            }`}
                                    >
                                        Rotating Shift Cycle
                                    </button>
                                </div>
                            </div>

                            {/* 1. Weekly Work / Free Days Selector */}
                            {mode === 'weekly' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 bg-gray-50 dark:bg-zinc-900/90 rounded-2xl border border-gray-200/70 dark:border-zinc-800 space-y-2.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            Select Working Days (Unselected = Free Day)
                                        </span>
                                        <span className="text-[11px] text-red-500 font-medium">
                                            {weeklyWorkDays.length} Work, {7 - weeklyWorkDays.length} Free
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1.5 pt-1">
                                        {WEEK_DAYS.map((d) => {
                                            const isWork = weeklyWorkDays.includes(d.value);
                                            return (
                                                <button
                                                    key={d.value}
                                                    type="button"
                                                    onClick={() => toggleDayOfWeek(d.value)}
                                                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${isWork
                                                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800/80 text-[#d9222a] dark:text-red-400 shadow-2xs'
                                                            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                                        }`}
                                                >
                                                    <span>{d.label}</span>
                                                    <span className="text-[9px] font-normal opacity-80 mt-0.5">
                                                        {isWork ? 'Work' : 'Free'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. Rotating Shift Cycle Config */}
                            {mode === 'cycle' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3.5 bg-gray-50 dark:bg-zinc-900/90 rounded-2xl border border-gray-200/70 dark:border-zinc-800 space-y-3"
                                >
                                    <div className="grid grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                                Days On (Work)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={cycleWorkDays}
                                                onChange={(e) => setCycleWorkDays(Number(e.target.value))}
                                                className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                                Days Off (Free)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={cycleOffDays}
                                                onChange={(e) => setCycleOffDays(Number(e.target.value))}
                                                className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                                Cycle Start
                                            </label>
                                            <input
                                                type="date"
                                                value={cycleStartDate}
                                                onChange={(e) => setCycleStartDate(e.target.value)}
                                                className="w-full text-xs px-2 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Shift Timing */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                    Shift Working Hours
                                </label>
                                <input
                                    type="text"
                                    value={shiftHours}
                                    onChange={(e) => setShiftHours(e.target.value)}
                                    placeholder="e.g. 08:00 - 16:30 or Night 22:00-06:00"
                                    required
                                    className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
                                />
                            </div>

                            {/* Specific Custom Free Days / Vacations */}
                            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300">
                                        <Palmtree className="w-4 h-4" />
                                        <span className="text-xs font-bold">Custom Vacation / Holiday Dates</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                        Always marked Free
                                    </span>
                                </div>

                                {/* Add Date Input */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="date"
                                        value={newFreeDate}
                                        onChange={(e) => setNewFreeDate(e.target.value)}
                                        className="flex-1 text-xs px-3 py-1.5 border border-emerald-300 dark:border-emerald-800 rounded-xl bg-white dark:bg-zinc-900 focus:outline-none"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={addCustomFreeDate}
                                        className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-2xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Free Day</span>
                                    </motion.button>
                                </div>

                                {/* List of Custom Free Days */}
                                {customFreeDates.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                                        {customFreeDates.map((dateStr) => (
                                            <span
                                                key={dateStr}
                                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium shadow-2xs"
                                            >
                                                <span>🌴 {dateStr}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCustomFreeDate(dateStr)}
                                                    className="text-gray-400 hover:text-red-500 ml-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold bg-[#d9222a] hover:bg-[#c01c24] text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{loading ? 'Saving...' : 'Save Schedule'}</span>
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}