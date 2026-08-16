'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Sparkles,
    Bot,
    Calendar,
    Layers,
    Check,
    Flame,
    Utensils,
    AlertCircle,
} from 'lucide-react';
import { generateAIMealPlan } from '@/actions/aiActions';

interface AIPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIPlannerModal({ isOpen, onClose }: AIPlannerModalProps) {
    const [rangeType, setRangeType] = useState<'this_week' | 'next_7' | 'this_month' | 'custom'>('this_week');
    const [mealsPerDay, setMealsPerDay] = useState(1);
    const [overwrite, setOverwrite] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
    const [customPrompt, setCustomPrompt] = useState('');
    const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0]);
    const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const presets = [
        {
            id: 'balanced',
            label: 'Balanced Variety',
            desc: 'Rotate categories evenly with no repeats.',
            prompt: 'Ensure high variety across categories (Soup, Main, Dessert). Never repeat the same meal consecutively.',
        },
        {
            id: 'work_friendly',
            label: 'Work Shift Focused',
            desc: 'Quick energizing meals on work days, full meals on off days.',
            prompt: 'Give quick/light mains on work shift days. Reserve elaborate multi-course meals or desserts for free days.',
        },
        {
            id: 'high_protein',
            label: 'High Energy & Protein',
            desc: 'Prioritize hearty main dishes and protein-rich recipes.',
            prompt: 'Prioritize hearty protein dishes and nutrient-dense meals.',
        },
        {
            id: 'soup_and_main',
            label: 'Soup + Main Combos',
            desc: 'Pair a soup and a main dish together.',
            prompt: 'For each day, select 1 soup and 1 main dish whenever possible.',
        },
    ];

    const calculateDateRange = () => {
        const today = new Date();
        let start = new Date(today);
        let end = new Date(today);

        if (rangeType === 'this_week') {
            const day = today.getDay();
            const diff = (day + 6) % 7; // Monday = 0
            start.setDate(today.getDate() - diff);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else if (rangeType === 'next_7') {
            end.setDate(today.getDate() + 6);
        } else if (rangeType === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (rangeType === 'custom') {
            return {
                startStr: customStart,
                endStr: customEnd,
            };
        }

        const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
            start.getDate()
        ).padStart(2, '0')}`;
        const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(
            end.getDate()
        ).padStart(2, '0')}`;

        return { startStr, endStr };
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        const { startStr, endStr } = calculateDateRange();

        const activePreset = presets.find((p) => p.id === selectedPreset);
        const combinedPrompt = customPrompt.trim()
            ? `${activePreset?.prompt || ''} Additional instructions: ${customPrompt.trim()}`
            : activePreset?.prompt || '';

        try {
            const res = await generateAIMealPlan({
                startDate: startStr,
                endDate: endStr,
                customPrompt: combinedPrompt,
                mealsPerDay: Number(mealsPerDay),
                overwriteExisting: overwrite,
            });

            if (res.success) {
                setStatusMessage({ text: res.message, isError: false });
                setTimeout(() => {
                    onClose();
                    setStatusMessage(null);
                }, 1200);
            } else {
                setStatusMessage({ text: res.message, isError: true });
            }
        } catch (err: any) {
            setStatusMessage({ text: err?.message || 'Error executing AI generation.', isError: true });
        } finally {
            setLoading(false);
        }
    };

    const { startStr, endStr } = calculateDateRange();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/65 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="bg-white dark:bg-[#18181b] border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative z-10 text-gray-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-gradient-to-tr from-red-500 to-amber-500 text-white rounded-xl shadow-xs">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold flex items-center space-x-1.5">
                                        <span>Gemini AI Meal Planner</span>
                                        <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-[#d9222a] dark:text-red-400 font-bold px-1.5 py-0.2 rounded-full">
                                            Flash 2.5
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                                        Smart automated meal assignments based on inventory & shifts
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

                        <form onSubmit={handleGenerate} className="space-y-4">
                            {/* Range Selector */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                    1. Select Planning Range
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 dark:bg-zinc-900 p-1 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setRangeType('this_week')}
                                        className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition-all ${rangeType === 'this_week'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        This Week
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRangeType('next_7')}
                                        className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition-all ${rangeType === 'next_7'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        Next 7 Days
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRangeType('this_month')}
                                        className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition-all ${rangeType === 'this_month'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        This Month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRangeType('custom')}
                                        className={`py-1.5 px-2 text-xs font-semibold rounded-xl transition-all ${rangeType === 'custom'
                                                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                                : 'text-gray-600 dark:text-zinc-400'
                                            }`}
                                    >
                                        Custom Range
                                    </button>
                                </div>

                                {rangeType === 'custom' && (
                                    <div className="grid grid-cols-2 gap-2 mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={customStart}
                                                onChange={(e) => setCustomStart(e.target.value)}
                                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={customEnd}
                                                onChange={(e) => setCustomEnd(e.target.value)}
                                                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5 flex items-center justify-between">
                                    <span>Planning for:</span>
                                    <span className="font-semibold text-gray-900 dark:text-zinc-200">
                                        {startStr} → {endStr}
                                    </span>
                                </div>
                            </div>

                            {/* Strategy Presets */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                                    2. Choose Meal Strategy
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {presets.map((p) => {
                                        const isSelected = selectedPreset === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setSelectedPreset(p.id)}
                                                className={`text-left p-2.5 rounded-2xl border transition-all ${isSelected
                                                        ? 'border-[#d9222a] bg-red-50/50 dark:bg-red-950/20 text-[#d9222a] dark:text-red-400 shadow-2xs'
                                                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-300'
                                                    }`}
                                            >
                                                <div className="font-bold text-xs">{p.label}</div>
                                                <div className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                                    {p.desc}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Instructions */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                    3. Custom Instructions (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g. Include vegetarian recipes only, prioritize pasta on Fridays, light soups on Mondays..."
                                    className="w-full text-xs px-3.5 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none placeholder-gray-400 dark:placeholder-zinc-500"
                                />
                            </div>

                            {/* Meals per day & Overwrite toggle */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                        Meals Per Day
                                    </label>
                                    <select
                                        value={mealsPerDay}
                                        onChange={(e) => setMealsPerDay(Number(e.target.value))}
                                        className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900"
                                    >
                                        <option value={1}>1 Meal / Day</option>
                                        <option value={2}>2 Meals (Lunch & Dinner)</option>
                                        <option value={3}>3 Meals / Day</option>
                                    </select>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <label className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                        Overwrite Existing
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={overwrite}
                                            onChange={(e) => setOverwrite(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-4.5 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#d9222a]" />
                                        <span className="ml-2 text-xs font-semibold text-gray-700 dark:text-zinc-300">
                                            {overwrite ? 'Replace all' : 'Fill empty only'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Status Message */}
                            {statusMessage && (
                                <div
                                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${statusMessage.isError
                                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                        }`}
                                >
                                    {statusMessage.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                    <span>{statusMessage.text}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-[#d9222a] to-red-600 hover:from-[#c01c24] hover:to-red-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                    <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    <span>{loading ? 'Gemini is Planning...' : 'Auto-Plan Meals'}</span>
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}