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
            // @ts-expect-error framer-motion types conflict with React's HTML5 drag events
            onDragStart={handleDragStart}
            className={`group relative bg-white border border-gray-200/90 rounded-xl p-2.5 flex items-start space-x-3 shadow-xs hover:shadow-md transition-shadow select-none ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
        >
            <img
                src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                alt={food.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100 pointer-events-none"
            />
            <div className="flex-1 min-w-0 pr-12">
                <h4 className="text-xs font-bold text-gray-900 truncate">{food.name}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-1 leading-relaxed mt-0.5">
                    {food.description}
                </p>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 px-1.5 py-0.5 rounded-md">
                        {food.category}
                    </span>
                    {food.allergens?.map((allergen, idx) => (
                        <span
                            key={idx}
                            className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-md"
                        >
                            {allergen}
                        </span>
                    ))}
                </div>
            </div>

            {isDraggable && (
                <div className="absolute top-2.5 right-2 text-gray-400 group-hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                </div>
            )}

            {/* Action Buttons: Edit & Delete */}
            <div className="absolute top-2 right-2 flex items-center space-x-0.5">
                {onEdit && (
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(food)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete food"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}