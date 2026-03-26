/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Plus, Search, Barcode, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function FoodLogScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { foodLog, removeFoodEntry, addFoodEntry, getTargetMacros } = useAppStore();
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
  ];

  return (
    <div className="space-y-6 pb-40">
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
        />
        <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
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
                <button className="w-full mt-2 py-2 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase hover:bg-zinc-800 transition-colors">
                  <Plus size={14} /> ADD ITEM
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Totals */}
      <div className="fixed bottom-24 left-0 w-full px-4">
        <div className="max-w-2xl mx-auto bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5 shadow-2xl">
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
    </div>
  );
}
