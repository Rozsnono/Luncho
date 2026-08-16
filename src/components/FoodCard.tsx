'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Pencil } from 'lucide-react';
import { IFood } from '@/types';

interface FoodCardProps {
    food: IFood;
    isDraggable?: boolean;
    onEdit?: (food: IFood) => void;
    onDelete?: (id: string) => void;
}

export default function FoodCard({
    food,
    isDraggable = false,
    onEdit,
    onDelete,
}: FoodCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', food._id);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            draggable={isDraggable}
            onDragStartCapture={handleDragStart}
            className={`group relative bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-xl p-2.5 flex items-start space-x-3 shadow-xs hover:shadow-md transition-all select-none ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
        >
            <img
                src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                alt={food.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-zinc-800 pointer-events-none"
            />
            <div className="flex-1 min-w-0 pr-12">
                <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 truncate">
                    {food.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-1 leading-relaxed mt-0.5">
                    {food.description}
                </p>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40 px-1.5 py-0.5 rounded-md">
                        {food.category}
                    </span>
                    {food.allergens?.map((allergen, idx) => (
                        <span
                            key={idx}
                            className="text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 px-1.5 py-0.5 rounded-md"
                        >
                            {allergen}
                        </span>
                    ))}
                </div>
            </div>

            {isDraggable && (
                <div className="absolute top-2.5 right-2 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300">
                    <GripVertical className="w-4 h-4" />
                </div>
            )}

            <div className="absolute top-2 right-2 flex items-center space-x-0.5">
                {onEdit && (
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(food)}
                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                        title="Edit food"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </motion.button>
                )}

                {onDelete && (
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(food._id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete food"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}