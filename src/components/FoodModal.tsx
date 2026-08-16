'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { createFood, updateFood } from '@/actions/foodActions';
import { IFood } from '@/types';

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodToEdit?: IFood | null;
  existingCategories?: string[];
}

export default function FoodModal({
  isOpen,
  onClose,
  foodToEdit = null,
  existingCategories = ['Main', 'Soup', 'Dessert', 'Salad', 'Beverage'],
}: FoodModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [allergens, setAllergens] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Main');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryVal, setCustomCategoryVal] = useState('');

  const defaultPresets = ['Main', 'Soup', 'Dessert', 'Salad', 'Beverage'];
  const allCategories = Array.from(new Set([...existingCategories, ...defaultPresets]));

  useEffect(() => {
    if (foodToEdit) {
      setName(foodToEdit.name || '');
      setImageUrl(foodToEdit.imageUrl || '');
      setDescription(foodToEdit.description || '');
      setAllergens(foodToEdit.allergens ? foodToEdit.allergens.join(', ') : '');

      if (allCategories.includes(foodToEdit.category)) {
        setSelectedCategory(foodToEdit.category);
        setIsCustomCategory(false);
        setCustomCategoryVal('');
      } else {
        setIsCustomCategory(true);
        setCustomCategoryVal(foodToEdit.category || '');
      }
    } else {
      setName('');
      setImageUrl('');
      setDescription('');
      setAllergens('');
      setSelectedCategory('Main');
      setIsCustomCategory(false);
      setCustomCategoryVal('');
    }
  }, [foodToEdit, isOpen]);

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomCategory(true);
      setSelectedCategory('');
    } else {
      setIsCustomCategory(false);
      setSelectedCategory(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const finalCategory = isCustomCategory ? customCategoryVal.trim() : selectedCategory;
    formData.set('category', finalCategory || 'General');

    try {
      if (foodToEdit) {
        await updateFood(foodToEdit._id, formData);
      } else {
        await createFood(formData);
      }
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
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-[#18181b] rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 dark:border-zinc-800 z-10 overflow-hidden text-gray-900 dark:text-zinc-100"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-red-50 dark:bg-red-950/40 text-[#d9222a] dark:text-red-400 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">
                  {foodToEdit ? 'Modify Food Item' : 'Add New Food Item'}
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Veggie Pasta"
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-[#d9222a] focus:outline-none transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-[#d9222a] focus:outline-none transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="Hearty vegetable pasta with fresh herbs and olive oil..."
                  className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-[#d9222a] focus:outline-none resize-none transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Category
                  </label>

                  {!isCustomCategory ? (
                    <select
                      value={selectedCategory}
                      onChange={handleCategorySelect}
                      className="w-full text-xs px-3 py-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-[#d9222a] focus:outline-none transition-all cursor-pointer text-gray-900 dark:text-zinc-100"
                    >
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__" className="text-[#d9222a] dark:text-red-400 font-bold bg-white dark:bg-zinc-900">
                        + Custom Category...
                      </option>
                    </select>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={customCategoryVal}
                        onChange={(e) => setCustomCategoryVal(e.target.value)}
                        placeholder="Type category..."
                        required={isCustomCategory}
                        className="w-full text-xs px-3 py-2.5 border border-red-400 dark:border-red-600 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-[#d9222a] focus:outline-none pr-7 bg-red-50/40 dark:bg-red-950/20 text-gray-900 dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setSelectedCategory('Main');
                        }}
                        className="absolute right-2 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
                        title="Back to dropdown"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Allergens
                  </label>
                  <input
                    type="text"
                    name="allergens"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                    placeholder="e.g. Gluten, Dairy"
                    className="w-full text-xs px-3.5 py-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-[#d9222a] focus:outline-none transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100 dark:border-zinc-800 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
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
                  {foodToEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{loading ? 'Saving...' : foodToEdit ? 'Save Changes' : 'Add Food'}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}