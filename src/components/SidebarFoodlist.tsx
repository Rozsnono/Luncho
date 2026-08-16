'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Zap, Scale, Flame } from 'lucide-react';
import { IFood } from '@/types';
import FoodCard from './FoodCard';
import FoodModal from './FoodModal';

interface SidebarProps {
    foods: IFood[];
}

export default function SidebarFoodList({ foods }: SidebarProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedComplexity, setSelectedComplexity] = useState<string>('All');
    const [modalOpen, setModalOpen] = useState(false);

    const availableCategories = useMemo(() => {
        const set = new Set<string>(['All']);
        foods.forEach((f) => {
            if (f.category) set.add(f.category);
        });
        return Array.from(set);
    }, [foods]);

    const complexities = ['All', 'Easy', 'Normal', 'Heavy'];

    const filteredFoods = foods.filter((food) => {
        const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            selectedCategory === 'All' || food.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesComplexity =
            selectedComplexity === 'All' || (food.complexity || 'Normal').toLowerCase() === selectedComplexity.toLowerCase();
        return matchesSearch && matchesCategory && matchesComplexity;
    });

    return (
        <aside className="w-84 flex-shrink-0 flex flex-col h-[calc(100vh-65px)] bg-gray-50/70 dark:bg-[#141416] border-r border-gray-200 dark:border-zinc-800/80 p-4 transition-colors duration-200">
            <div className="mb-3 space-y-2.5">
                <h2 className="text-xs font-bold text-gray-500 dark:text-zinc-400 tracking-wider uppercase">
                    Food Inventory
                </h2>

                {/* Search */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search meals..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 shadow-2xs transition-all"
                    />
                </div>

                {/* Complexity Filter Pills */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-gray-200/60 dark:bg-zinc-900 rounded-xl text-[10px] font-bold">
                    {complexities.map((comp) => {
                        const isActive = selectedComplexity === comp;
                        return (
                            <button
                                key={comp}
                                onClick={() => setSelectedComplexity(comp)}
                                className={`py-1 rounded-lg transition-all ${isActive
                                        ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-2xs'
                                        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
                                    }`}
                            >
                                {comp}
                            </button>
                        );
                    })}
                </div>

                {/* Category Pills */}
                <div className="flex space-x-1 overflow-x-auto pb-0.5 no-scrollbar">
                    {availableCategories.map((cat) => {
                        const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`relative px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap z-0 ${isActive
                                        ? 'text-gray-900 dark:text-zinc-100 font-bold'
                                        : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeCategoryPill"
                                        className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full -z-10 shadow-2xs"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Food Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
                <AnimatePresence mode="popLayout">
                    {filteredFoods.length === 0 ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-gray-400 dark:text-zinc-500 text-center py-8"
                        >
                            No foods match the filters.
                        </motion.p>
                    ) : (
                        filteredFoods.map((food) => (
                            <FoodCard key={food._id} food={food} isDraggable />
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-3 border-t border-gray-200/70 dark:border-zinc-800">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-[#d9222a] hover:bg-[#c01c24] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Food</span>
                </motion.button>
            </div>

            <FoodModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                existingCategories={availableCategories.filter((c) => c !== 'All')}
            />
        </aside>
    );
}