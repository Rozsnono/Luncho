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
    CalendarRange,
} from 'lucide-react';
import { IWorkSchedule, IFreeDateRange } from '@/types';
import { saveWorkSchedule } from '@/actions/scheduleActions';

interface WorkScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: IWorkSchedule;
}

const WEEK_DAYS = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
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

    // Free Date Ranges state
    const [freeDateRanges, setFreeDateRanges] = useState<IFreeDateRange[]>(
        schedule.freeDateRanges || []
    );

    // New Range form inputs
    const todayStr = new Date().toISOString().split('T')[0];
    const [rangeStart, setRangeStart] = useState(todayStr);
    const [rangeEnd, setRangeEnd] = useState(todayStr);
    const [rangeLabel, setRangeLabel] = useState('');

    const toggleDayOfWeek = (dayVal: number) => {
        if (weeklyWorkDays.includes(dayVal)) {
            setWeeklyWorkDays(weeklyWorkDays.filter((d) => d !== dayVal));
        } else {
            setWeeklyWorkDays([...weeklyWorkDays, dayVal].sort());
        }
    };

    const handleSetQuickWeek = () => {
        const start = new Date(rangeStart || new Date());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        setRangeEnd(end.toISOString().split('T')[0]);
        if (!rangeLabel) setRangeLabel('Vacation Week');
    };

    const addRange = () => {
        if (!rangeStart || !rangeEnd) return;
        const finalStart = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
        const finalEnd = rangeStart <= rangeEnd ? rangeEnd : rangeStart;

        setFreeDateRanges([
            ...freeDateRanges,
            {
                startDate: finalStart,
                endDate: finalEnd,
                label: rangeLabel.trim() || 'Vacation',
            },
        ]);

        setRangeLabel('');
    };

    const removeRange = (idx: number) => {
        setFreeDateRanges(freeDateRanges.filter((_, i) => i !== idx));
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
                freeDateRanges,
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
                        className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative z-10 text-gray-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-red-500/10 text-[#d9222a] dark:text-red-400 rounded-xl">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold">Work & Free Schedule</h3>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                                        Configure shifts, free days, and vacation ranges
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
                            {/* Enable Switch */}
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-semibold">Enable Schedule on Calendar</span>
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

                            {/* Weekly Days vs Rotating Cycle */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Regular Schedule Mode
                                </label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setMode('weekly')}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'weekly'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-500 dark:text-zinc-400'
                                            }`}
                                    >
                                        Weekly Work / Free Days
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('cycle')}
                                        className={`py-2 text-xs font-semibold rounded-lg transition-all ${mode === 'cycle'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-500 dark:text-zinc-400'
                                            }`}
                                    >
                                        Rotating Shift Cycle
                                    </button>
                                </div>
                            </div>

                            {mode === 'weekly' ? (
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900/90 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
                                    <div className="grid grid-cols-7 gap-1 pt-1">
                                        {WEEK_DAYS.map((d) => {
                                            const isWork = weeklyWorkDays.includes(d.value);
                                            return (
                                                <button
                                                    key={d.value}
                                                    type="button"
                                                    onClick={() => toggleDayOfWeek(d.value)}
                                                    className={`flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-bold transition-all ${isWork
                                                            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800/80 text-[#d9222a] dark:text-red-400'
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
                                </div>
                            ) : (
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900/90 rounded-2xl border border-gray-200/70 dark:border-zinc-800 grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Work Days</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={cycleWorkDays}
                                            onChange={(e) => setCycleWorkDays(Number(e.target.value))}
                                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Off Days</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={cycleOffDays}
                                            onChange={(e) => setCycleOffDays(Number(e.target.value))}
                                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={cycleStartDate}
                                            onChange={(e) => setCycleStartDate(e.target.value)}
                                            className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Shift Hours */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                    Shift Working Hours
                                </label>
                                <input
                                    type="text"
                                    value={shiftHours}
                                    onChange={(e) => setShiftHours(e.target.value)}
                                    placeholder="e.g. 08:00 - 16:30"
                                    className="w-full text-xs px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:outline-none"
                                />
                            </div>

                            {/* VACATION / FREE DATE RANGES (Add Week or Custom Period) */}
                            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300">
                                        <CalendarRange className="w-4 h-4" />
                                        <span className="text-xs font-bold">Vacation & Free Date Ranges</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSetQuickWeek}
                                        className="text-[10px] bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-lg transition-colors"
                                    >
                                        + Set 1 Week Range
                                    </button>
                                </div>

                                {/* Range Input Controls */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(e.target.value)}
                                            className="w-full text-xs px-2.5 py-1.5 border border-emerald-300 dark:border-emerald-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(e.target.value)}
                                            className="w-full text-xs px-2.5 py-1.5 border border-emerald-300 dark:border-emerald-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                                            Label (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={rangeLabel}
                                            onChange={(e) => setRangeLabel(e.target.value)}
                                            placeholder="e.g. Summer Break"
                                            className="w-full text-xs px-2.5 py-1.5 border border-emerald-300 dark:border-emerald-800 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={addRange}
                                        className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Free Range</span>
                                    </motion.button>
                                </div>

                                {/* List of Configured Free Ranges */}
                                {freeDateRanges.length > 0 && (
                                    <div className="space-y-1.5 pt-1 max-h-32 overflow-y-auto">
                                        {freeDateRanges.map((r, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs text-xs"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="font-bold text-emerald-900 dark:text-emerald-300">
                                                        {r.label || 'Vacation'}:
                                                    </span>
                                                    <span className="text-gray-600 dark:text-zinc-400">
                                                        {r.startDate} <span className="text-gray-400">→</span> {r.endDate}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRange(idx)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold bg-[#d9222a] hover:bg-[#c01c24] text-white rounded-xl shadow-xs disabled:opacity-50"
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