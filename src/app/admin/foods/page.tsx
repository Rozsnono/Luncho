'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Utensils } from 'lucide-react';
import { getFoods, deleteFood } from '@/actions/foodActions';
import FoodCard from '@/components/FoodCard';
import FoodModal from '@/components/FoodModal';
import { IFood } from '@/types';

export default function FoodManagementPage() {
    const [foods, setFoods] = useState<IFood[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<IFood | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchFoods = async () => {
        try {
            const data = await getFoods();
            setFoods(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, []);

    const handleOpenAdd = () => {
        setEditingFood(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (food: IFood) => {
        setEditingFood(food);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setFoods((prev) => prev.filter((f) => f._id !== id));
        await deleteFood(id);
    };

    const existingCategories = Array.from(new Set(foods.map((f) => f.category).filter(Boolean)));

    return (
        <div className="flex-1 p-8 max-w-6xl mx-auto overflow-y-auto">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
                <div>
                    <Link
                        href="/admin/calendar"
                        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Back to Calendar
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Food Directory & Management
                    </h1>
                </div>

                {/* Add Food Button */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpenAdd}
                    className="flex items-center space-x-2 bg-[#d9222a] hover:bg-[#c01c24] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Food</span>
                </motion.button>
            </div>

            {/* Food Cards Grid */}
            {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading foods...</div>
            ) : foods.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
                    <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-700">No foods created yet</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                        Click the button below to add your first meal item.
                    </p>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-[#d9222a] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700"
                    >
                        Add Food
                    </button>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
                    <AnimatePresence>
                        {foods.map((food) => (
                            <FoodCard
                                key={food._id}
                                food={food}
                                onEdit={handleOpenEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Modal supporting both Add and Edit */}
            <FoodModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingFood(null);
                    fetchFoods();
                }}
                foodToEdit={editingFood}
                existingCategories={existingCategories}
            />
        </div>
    );
}