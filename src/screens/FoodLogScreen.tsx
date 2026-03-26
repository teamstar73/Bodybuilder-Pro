/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, addDays, subDays } from 'date-fns';
import { Plus, Search, Barcode, Trash2, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function FoodLogScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { foodLog, removeFoodEntry, addFoodEntry, getTargetMacros } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isSaving, setIsSaving] = useState(false);

  // New Food Form State
  const [foodName, setFoodName] = useState('');
  const [amountG, setAmountG] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const targetMacros = getTargetMacros();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayLog = foodLog.filter(e => e.date === dateStr);
  
  const totals = dayLog.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories,
    protein: acc.protein + curr.protein_g,
    carbs: acc.carbs + curr.carbs_g,
    fat: acc.fat + curr.fat_g,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const meals = [
    { id: 'breakfast', label: '朝食', icon: '🌅' },
    { id: 'lunch', label: '昼食', icon: '☀️' },
    { id: 'dinner', label: '夕食', icon: '🌙' },
    { id: 'snack', label: '間食', icon: '🍎' },
  ] as const;

  const handleBarcodeScan = () => {
    setIsBarcodeModalOpen(true);
    // Mock scan after 1.5 seconds
    setTimeout(() => {
      const mockItems = [
        { name: 'プロテインバー (Scanned)', cal: '200', p: '20', c: '15', f: '8', g: '50' },
        { name: 'ギリシャヨーグルト (Scanned)', cal: '100', p: '18', c: '6', f: '0', g: '150' },
        { name: 'サラダチキン (Scanned)', cal: '120', p: '25', c: '1', f: '2', g: '110' },
        { name: 'モンスターエナジー (Scanned)', cal: '0', p: '0', c: '0', f: '0', g: '355' },
        { name: 'オートミール (Scanned)', cal: '150', p: '5', c: '27', f: '3', g: '40' },
      ];
      const selected = mockItems[Math.floor(Math.random() * mockItems.length)];
      
      setFoodName(selected.name);
      setCalories(selected.cal);
      setProtein(selected.p);
      setCarbs(selected.c);
      setFat(selected.f);
      setAmountG(selected.g);
      setIsBarcodeModalOpen(false);
      setIsAddModalOpen(true);
    }, 1500);
  };

  const handleAddFood = async () => {
    if (!foodName || !amountG || !calories) return;
    setIsSaving(true);
    try {
      await addFoodEntry({
        date: dateStr,
        meal_type: selectedMealType,
        food_name: foodName,
        amount_g: parseFloat(amountG),
        calories: parseFloat(calories),
        protein_g: parseFloat(protein) || 0,
        carbs_g: parseFloat(carbs) || 0,
        fat_g: parseFloat(fat) || 0,
      });
      setIsAddModalOpen(false);
      // Reset form
      setFoodName('');
      setAmountG('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    } catch (error) {
      console.error('Error adding food:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-40 relative">
      {/* Sticky Totals at Top */}
      <div className="sticky top-0 z-40 -mx-4 px-4 pb-4 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Daily Energy</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-amber-500 tabular-nums">{totals.calories}</span>
                <span className="text-xs font-bold text-zinc-500">/ {targetMacros.calories} KCAL</span>
              </div>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase">PRO</div>
                <div className="text-sm font-bold text-teal-500 tabular-nums">{totals.protein}<span className="text-[10px] opacity-40">/{targetMacros.protein_g}</span></div>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">CHO</div>
                <div className="text-sm font-bold text-amber-500 tabular-nums">{totals.carbs}<span className="text-[10px] opacity-40">/{targetMacros.carbs_g}</span></div>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">FAT</div>
                <div className="text-sm font-bold text-rose-500 tabular-nums">{totals.fat}<span className="text-[10px] opacity-40">/{targetMacros.fat_g}</span></div>
              </div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (totals.calories / targetMacros.calories) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 text-zinc-500"><ChevronLeft size={20}/></button>
        <div className="text-center">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{format(selectedDate, 'MMMM yyyy')}</div>
          <div className="text-lg font-black">{format(selectedDate, 'EEEE, do')}</div>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 text-zinc-500"><ChevronRight size={20}/></button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-12 text-sm font-bold tracking-widest placeholder:text-zinc-700 outline-none focus:border-amber-500 transition-all uppercase"
          placeholder="ADD FOOD OR SCAN BARCODE"
          onClick={() => setIsAddModalOpen(true)}
          readOnly
        />
        <button 
          onClick={(e) => { e.stopPropagation(); handleBarcodeScan(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:scale-110 transition-transform"
        >
          <Barcode size={20} />
        </button>
      </div>

      {/* Meal Sections */}
      <div className="space-y-4">
        {meals.map(meal => {
          const mealEntries = dayLog.filter(e => e.meal_type === meal.id);
          const mealTotals = mealEntries.reduce((acc, curr) => ({
            p: acc.p + curr.protein_g,
            c: acc.c + curr.carbs_g,
            f: acc.f + curr.fat_g,
            kcal: acc.kcal + curr.calories
          }), { p: 0, c: 0, f: 0, kcal: 0 });

          return (
            <div key={meal.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 bg-zinc-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meal.icon}</span>
                  <h2 className="font-black uppercase tracking-wider">{meal.label}</h2>
                </div>
                <div className="flex gap-3 text-[10px] font-bold text-zinc-500">
                  <div className="text-right">
                    <div className="uppercase">P</div>
                    <div className="text-white tabular-nums">{mealTotals.p}g</div>
                  </div>
                  <div className="text-right border-l border-zinc-700 pl-3">
                    <div className="uppercase">C</div>
                    <div className="text-white tabular-nums">{mealTotals.c}g</div>
                  </div>
                  <div className="text-right border-l border-zinc-700 pl-3">
                    <div className="uppercase">F</div>
                    <div className="text-white tabular-nums">{mealTotals.f}g</div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {mealEntries.length > 0 ? (
                  mealEntries.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center group">
                      <div>
                        <div className="text-sm font-bold">{entry.food_name}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">{entry.amount_g}g</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold tabular-nums">{entry.calories} KCAL</div>
                        <button onClick={() => removeFoodEntry(entry.id)} className="text-zinc-700 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-zinc-700 text-[10px] font-bold uppercase tracking-widest">No entries yet</div>
                )}
                <button 
                  onClick={() => { setSelectedMealType(meal.id); setIsAddModalOpen(true); }}
                  className="w-full mt-2 py-2 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase hover:bg-zinc-800 transition-colors"
                >
                  <Plus size={14} /> ADD ITEM
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[10%] bottom-[10%] bg-zinc-950 border border-zinc-800 rounded-3xl p-6 z-[70] shadow-2xl max-w-sm mx-auto flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">食事を記録</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                <div className="grid grid-cols-2 gap-2">
                  {meals.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMealType(m.id)}
                      className={cn(
                        "p-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                        selectedMealType === m.id ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">食品名</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500"
                      placeholder="鶏胸肉"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">分量 (G)</label>
                      <input 
                        type="number" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500"
                        placeholder="100"
                        value={amountG}
                        onChange={(e) => setAmountG(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">カロリー</label>
                      <input 
                        type="number" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500"
                        placeholder="165"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">タンパク質</label>
                      <input 
                        type="number" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500"
                        placeholder="31"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">炭水化物</label>
                      <input 
                        type="number" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500"
                        placeholder="0"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">脂質</label>
                      <input 
                        type="number" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500"
                        placeholder="3.6"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleAddFood}
                disabled={isSaving || !foodName || !amountG || !calories}
                className="w-full bg-amber-500 text-black font-black py-4 mt-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSaving ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={20} /> 記録する
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {isBarcodeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm aspect-[3/4] border-2 border-amber-500 rounded-3xl overflow-hidden flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-64 h-40 border-2 border-amber-500/50 rounded-lg relative overflow-hidden">
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  />
                </div>
                <div className="mt-8 text-center">
                  <div className="text-lg font-black uppercase tracking-widest text-white">Scanning...</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Align barcode within the frame</div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsBarcodeModalOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
