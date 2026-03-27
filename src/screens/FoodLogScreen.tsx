/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, addDays, subDays } from 'date-fns';
import { Plus, Search, Barcode, Trash2, ChevronLeft, ChevronRight, X, Check, Loader2, Info, AlertTriangle, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_FOODS, CommonFood } from '../data/commonFoods';
import { calculateMicronutrientTargets } from '../utils/nutrition';
import { searchFoods, FoodItem } from '../services/foodSearch';
import BarcodeScanner from 'react-qr-barcode-scanner';

export default function FoodLogScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { foodLog, removeFoodEntry, addFoodEntry, getTargetMacros, user, frequentFoods, trackFrequentFood } = useAppStore();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [summaryTab, setSummaryTab] = useState<'macros' | 'micros'>('macros');
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Micronutrient form state
  const [vitD, setVitD] = useState('');
  const [magnesium, setMagnesium] = useState('');
  const [zinc, setZinc] = useState('');
  const [iron, setIron] = useState('');
  const [calcium, setCalcium] = useState('');
  const [potassium, setPotassium] = useState('');
  const [vitB12, setVitB12] = useState('');
  const [vitC, setVitC] = useState('');
  const [omega3, setOmega3] = useState('');

  const targetMacros = getTargetMacros();
  const targetMicros = user ? calculateMicronutrientTargets(user) : null;

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayLog = foodLog.filter(e => e.date === dateStr);
  
  const totals = dayLog.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories,
    protein: acc.protein + curr.protein_g,
    carbs: acc.carbs + curr.carbs_g,
    fat: acc.fat + curr.fat_g,
    vitamin_d_iu: acc.vitamin_d_iu + (curr.micronutrients?.vitamin_d_iu || curr.vitamin_d_ug || 0),
    magnesium_mg: acc.magnesium_mg + (curr.micronutrients?.magnesium_mg || curr.magnesium_mg || 0),
    zinc_mg: acc.zinc_mg + (curr.micronutrients?.zinc_mg || curr.zinc_mg || 0),
    iron_mg: acc.iron_mg + (curr.micronutrients?.iron_mg || curr.iron_mg || 0),
    calcium_mg: acc.calcium_mg + (curr.micronutrients?.calcium_mg || curr.calcium_mg || 0),
    potassium_mg: acc.potassium_mg + (curr.micronutrients?.potassium_mg || curr.potassium_mg || 0),
    vitamin_b12_ug: acc.vitamin_b12_ug + (curr.micronutrients?.vitamin_b12_ug || curr.vitamin_b12_ug || 0),
    vitamin_c_mg: acc.vitamin_c_mg + (curr.micronutrients?.vitamin_c_mg || curr.vitamin_c_mg || 0),
    omega3_mg: acc.omega3_mg + (curr.micronutrients?.omega3_mg || curr.omega_3_mg || 0),
  }), { 
    calories: 0, protein: 0, carbs: 0, fat: 0,
    vitamin_d_iu: 0, magnesium_mg: 0, zinc_mg: 0, iron_mg: 0,
    calcium_mg: 0, potassium_mg: 0, vitamin_b12_ug: 0, vitamin_c_mg: 0, omega3_mg: 0
  });

  const meals = [
    { id: 'breakfast', label: '朝食', icon: '🌅' },
    { id: 'lunch', label: '昼食', icon: '☀️' },
    { id: 'dinner', label: '夕食', icon: '🌙' },
    { id: 'snack', label: '間食', icon: '🍎' },
  ] as const;

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchFoods(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBarcodeScan = async () => {
    setIsBarcodeModalOpen(true);
  };

  const onBarcodeScanned = async ({ data: barcode }: { data: string }) => {
    setIsBarcodeModalOpen(false);
    setIsSearching(true);
    try {
      const response = await fetch(`/api/food/barcode/${barcode}`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const result: FoodItem = {
          name: p.product_name_ja || p.product_name || 'Scanned Product',
          brand: p.brands,
          cal: p.nutriments?.['energy-kcal_100g'] || 0,
          p: p.nutriments?.proteins_100g || 0,
          c: p.nutriments?.carbohydrates_100g || 0,
          f: p.nutriments?.fat_100g || 0,
          source: 'openfoodfacts',
          micronutrients: {
            vitamin_d_iu: p.nutriments?.['vitamin-d_value'] || 0,
            magnesium_mg: p.nutriments?.['magnesium_value'] || 0,
            zinc_mg: p.nutriments?.['zinc_value'] || 0,
            iron_mg: p.nutriments?.['iron_value'] || 0,
            calcium_mg: p.nutriments?.['calcium_value'] || 0,
            potassium_mg: p.nutriments?.['potassium_value'] || 0,
            vitamin_b12_ug: p.nutriments?.['vitamin-b12_value'] || 0,
            vitamin_c_mg: p.nutriments?.['vitamin-c_value'] || 0,
            omega3_mg: p.nutriments?.['omega-3-fat_value'] || 0,
          }
        };
        handleSelectFood(result);
        setIsAddModalOpen(true);
      } else {
        alert('Product not found');
      }
    } catch (error) {
      console.error('Barcode error:', error);
      alert('Failed to scan product');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setIsManualEntry(food.cal === 0 && food.p === 0);
    setFoodName(food.name);
    setAmountG('100');
    setCalories(food.cal.toString());
    setProtein(food.p.toString());
    setCarbs(food.c.toString());
    setFat(food.f.toString());
    setVitD((food.micronutrients?.vitamin_d_iu || 0).toString());
    setMagnesium((food.micronutrients?.magnesium_mg || 0).toString());
    setZinc((food.micronutrients?.zinc_mg || 0).toString());
    setIron((food.micronutrients?.iron_mg || 0).toString());
    setCalcium((food.micronutrients?.calcium_mg || 0).toString());
    setPotassium((food.micronutrients?.potassium_mg || 0).toString());
    setVitB12((food.micronutrients?.vitamin_b12_ug || 0).toString());
    setVitC((food.micronutrients?.vitamin_c_mg || 0).toString());
    setOmega3((food.micronutrients?.omega3_mg || 0).toString());
  };

  const updateNutrients = (grams: string) => {
    setAmountG(grams);
    if (!selectedFood || !grams || isNaN(parseFloat(grams)) || isManualEntry) return;
    const g = parseFloat(grams);
    const ratio = g / 100;
    setCalories((selectedFood.cal * ratio).toFixed(0));
    setProtein((selectedFood.p * ratio).toFixed(1));
    setCarbs((selectedFood.c * ratio).toFixed(1));
    setFat((selectedFood.f * ratio).toFixed(1));
    setVitD(((selectedFood.micronutrients?.vitamin_d_iu || 0) * ratio).toFixed(1));
    setMagnesium(((selectedFood.micronutrients?.magnesium_mg || 0) * ratio).toFixed(1));
    setZinc(((selectedFood.micronutrients?.zinc_mg || 0) * ratio).toFixed(1));
    setIron(((selectedFood.micronutrients?.iron_mg || 0) * ratio).toFixed(1));
    setCalcium(((selectedFood.micronutrients?.calcium_mg || 0) * ratio).toFixed(1));
    setPotassium(((selectedFood.micronutrients?.potassium_mg || 0) * ratio).toFixed(1));
    setVitB12(((selectedFood.micronutrients?.vitamin_b12_ug || 0) * ratio).toFixed(1));
    setVitC(((selectedFood.micronutrients?.vitamin_c_mg || 0) * ratio).toFixed(1));
    setOmega3(((selectedFood.micronutrients?.omega3_mg || 0) * ratio).toFixed(1));
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
        micronutrients: {
          vitamin_d_iu: parseFloat(vitD) || 0,
          magnesium_mg: parseFloat(magnesium) || 0,
          zinc_mg: parseFloat(zinc) || 0,
          iron_mg: parseFloat(iron) || 0,
          calcium_mg: parseFloat(calcium) || 0,
          potassium_mg: parseFloat(potassium) || 0,
          vitamin_b12_ug: parseFloat(vitB12) || 0,
          vitamin_c_mg: parseFloat(vitC) || 0,
          omega3_mg: parseFloat(omega3) || 0,
        }
      });

      // Track frequent food
      trackFrequentFood({
        name: foodName,
        cal: selectedFood?.cal || (parseFloat(calories) / (parseFloat(amountG) / 100)),
        p: selectedFood?.p || (parseFloat(protein) / (parseFloat(amountG) / 100)),
        c: selectedFood?.c || (parseFloat(carbs) / (parseFloat(amountG) / 100)),
        f: selectedFood?.f || (parseFloat(fat) / (parseFloat(amountG) / 100)),
        micronutrients: selectedFood?.micronutrients,
      });

      setIsAddModalOpen(false);
      // Reset form
      setFoodName('');
      setAmountG('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setVitD('');
      setMagnesium('');
      setZinc('');
      setIron('');
      setCalcium('');
      setPotassium('');
      setVitB12('');
      setVitC('');
      setOmega3('');
      setSelectedFood(null);
      setIsManualEntry(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding food:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-40 relative">
      {/* Sticky Totals at Top */}
      <div className="sticky top-0 z-40 -mx-4 px-4 pb-4 bg-bg/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto bg-surface/90 border border-border rounded-2xl p-5 shadow-2xl">
          <div className="flex gap-4 mb-4 border-b border-border pb-2">
            <button 
              onClick={() => setSummaryTab('macros')}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest pb-1 transition-all",
                summaryTab === 'macros' ? "text-accent border-b-2 border-accent" : "text-text-muted"
              )}
            >
              Macros
            </button>
            <button 
              onClick={() => setSummaryTab('micros')}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest pb-1 transition-all",
                summaryTab === 'micros' ? "text-accent border-b-2 border-accent" : "text-text-muted"
              )}
            >
              Micros
            </button>
          </div>

          {summaryTab === 'macros' ? (
            <>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Daily Energy</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-accent tabular-nums">{Math.round(totals.calories)}</span>
                    <span className="text-xs font-bold text-text-muted">/ {targetMacros.calories} KCAL</span>
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase">PRO</div>
                    <div className="text-sm font-bold text-accent-light tabular-nums">{Math.round(totals.protein)}<span className="text-[10px] opacity-40">/{targetMacros.protein_g}</span></div>
                  </div>
                  <div className="border-l border-border pl-4">
                    <div className="text-[10px] font-bold text-text-muted uppercase">CHO</div>
                    <div className="text-sm font-bold text-accent tabular-nums">{Math.round(totals.carbs)}<span className="text-[10px] opacity-40">/{targetMacros.carbs_g}</span></div>
                  </div>
                  <div className="border-l border-border pl-4">
                    <div className="text-[10px] font-bold text-text-muted uppercase">FAT</div>
                    <div className="text-sm font-bold text-accent-dark tabular-nums">{Math.round(totals.fat)}<span className="text-[10px] opacity-40">/{targetMacros.fat_g}</span></div>
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${Math.min(100, (totals.calories / targetMacros.calories) * 100)}%` }} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: 'Vit D', val: totals.vitamin_d_iu, target: targetMicros?.vitamin_d_iu, unit: 'IU' },
                { label: 'Mg', val: totals.magnesium_mg, target: targetMicros?.magnesium_mg, unit: 'mg' },
                { label: 'Zn', val: totals.zinc_mg, target: targetMicros?.zinc_mg, unit: 'mg' },
                { label: 'Fe', val: totals.iron_mg, target: targetMicros?.iron_mg, unit: 'mg' },
                { label: 'Ca', val: totals.calcium_mg, target: targetMicros?.calcium_mg, unit: 'mg' },
                { label: 'K', val: totals.potassium_mg, target: targetMicros?.potassium_mg, unit: 'mg' },
                { label: 'B12', val: totals.vitamin_b12_ug, target: targetMicros?.vitamin_b12_ug, unit: 'μg' },
                { label: 'Vit C', val: totals.vitamin_c_mg, target: targetMicros?.vitamin_c_mg, unit: 'mg' },
                { label: 'Omega3', val: totals.omega3_mg, target: targetMicros?.omega3_mg, unit: 'mg' },
              ].map(item => {
                const pct = item.target ? (item.val / item.target) * 100 : 0;
                const isOver = pct > 100;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[8px] font-bold uppercase text-text-muted">{item.label}</span>
                      <span className={cn(
                        "text-[8px] font-bold tabular-nums",
                        isOver ? "text-text-faint" : "text-white"
                      )}>
                        {Math.round(item.val)}{item.unit}
                      </span>
                    </div>
                    <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          isOver ? "bg-text-faint" : "bg-accent"
                        )} 
                        style={{ width: `${Math.min(100, pct)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 text-text-muted"><ChevronLeft size={20}/></button>
        <div className="text-center">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{format(selectedDate, 'MMMM yyyy')}</div>
          <div className="text-lg font-black">{format(selectedDate, 'EEEE, do')}</div>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 text-text-muted"><ChevronRight size={20}/></button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-12 text-sm font-bold tracking-widest placeholder:text-text-faint outline-none focus:border-accent transition-all uppercase"
          placeholder="ADD FOOD OR SCAN BARCODE"
          onClick={() => setIsAddModalOpen(true)}
          readOnly
        />
        <button 
          onClick={(e) => { e.stopPropagation(); handleBarcodeScan(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-accent hover:scale-110 transition-transform"
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
            <div key={meal.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="p-4 bg-surface-alt flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meal.icon}</span>
                  <h2 className="font-black uppercase tracking-wider">{meal.label}</h2>
                </div>
                <div className="flex gap-3 text-[10px] font-bold text-text-muted">
                  <div className="text-right">
                    <div className="uppercase">P</div>
                    <div className="text-white tabular-nums">{mealTotals.p}g</div>
                  </div>
                  <div className="text-right border-l border-border-light pl-3">
                    <div className="uppercase">C</div>
                    <div className="text-white tabular-nums">{mealTotals.c}g</div>
                  </div>
                  <div className="text-right border-l border-border-light pl-3">
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
                        <div className="text-[10px] text-text-muted uppercase font-bold">{entry.amount_g}g</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold tabular-nums">{entry.calories} KCAL</div>
                        <button onClick={() => removeFoodEntry(entry.id)} className="text-text-faint hover:text-danger transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-text-faint text-[10px] font-bold uppercase tracking-widest">No entries yet</div>
                )}
                <button 
                  onClick={() => { setSelectedMealType(meal.id); setIsAddModalOpen(true); }}
                  className="w-full mt-2 py-2 border border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold text-text-muted uppercase hover:bg-surface-alt transition-colors"
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
              className="fixed inset-x-4 top-[5%] bottom-[5%] bg-surface border border-border rounded-3xl p-6 z-[70] shadow-2xl max-w-md mx-auto flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {selectedFood ? (isManualEntry ? '詳細を入力' : '分量を入力') : '食品を検索'}
                </h2>
                <button onClick={() => { setIsAddModalOpen(false); setSelectedFood(null); setIsManualEntry(false); }} className="text-text-muted hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              {!selectedFood ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input 
                        autoFocus
                        className="w-full bg-surface-alt border border-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-text-faint outline-none focus:border-accent transition-all"
                        placeholder="食品名を入力 (例: 鶏胸肉)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={18} className="animate-spin text-accent" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, i) => (
                        <button
                          key={`${result.source}-${i}`}
                          onClick={() => handleSelectFood(result)}
                          className="w-full bg-surface-alt/50 border border-border/50 rounded-xl p-4 text-left hover:border-accent/50 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm group-hover:text-accent transition-colors">{result.name}</span>
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                                result.source === 'preset' ? "bg-accent/20 text-accent" : "bg-surface-alt text-text-muted"
                              )}>
                                {result.source === 'preset' ? 'プリセット' : result.source === 'edamam' ? 'EDAMAM' : 'OFF'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-accent tabular-nums">{result.cal} kcal/100g</span>
                          </div>
                          {result.brand && <div className="text-[10px] text-text-muted mb-2 uppercase tracking-wider">{result.brand}</div>}
                          <div className="flex gap-3 text-[10px] font-bold text-text-muted uppercase">
                            <span>P: <span className="text-accent-light">{result.p}g</span></span>
                            <span>C: <span className="text-accent">{result.c}g</span></span>
                            <span>F: <span className="text-accent-dark">{result.f}g</span></span>
                          </div>
                        </button>
                      ))
                    ) : searchQuery && !isSearching ? (
                      <div className="py-20 text-center">
                        <div className="text-text-faint text-sm font-bold uppercase tracking-widest">"{searchQuery}"は見つかりませんでした</div>
                        <button 
                          onClick={() => handleSelectFood({ name: searchQuery, cal: 0, p: 0, c: 0, f: 0, source: 'preset' })}
                          className="mt-4 bg-accent text-black px-6 py-3 rounded-xl text-xs font-black uppercase active:scale-95 transition-all"
                        >
                          手動で入力する
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {frequentFoods.length > 0 && (
                          <>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">よく使う食品</div>
                            {frequentFoods.slice(0, 5).map((f, i) => (
                              <button
                                key={`frequent-${i}`}
                                onClick={() => handleSelectFood({ 
                                  name: f.name, 
                                  cal: f.cal, 
                                  p: f.p, 
                                  c: f.c, 
                                  f: f.f,
                                  source: 'preset',
                                  micronutrients: f.micronutrients
                                })}
                                className="w-full bg-surface-alt/50 border border-border/50 rounded-xl p-4 text-left hover:border-accent/50 transition-all group"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-bold text-sm group-hover:text-accent transition-colors">{f.name}</div>
                                    <div className="flex gap-3 text-[10px] font-bold text-text-muted uppercase mt-1">
                                      <span>P: <span className="text-accent-light">{f.p}g</span></span>
                                      <span>C: <span className="text-accent">{f.c}g</span></span>
                                      <span>F: <span className="text-accent-dark">{f.f}g</span></span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] font-bold text-accent tabular-nums">{f.cal} kcal</div>
                                    <div className="text-[8px] text-text-faint uppercase font-bold mt-1">{f.count}回使用</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                        
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">プリセット</div>
                        {COMMON_FOODS.map((f, i) => (
                          <button
                            key={`common-${i}`}
                            onClick={() => handleSelectFood({ 
                              name: f.name, 
                              cal: f.cal, 
                              p: f.p, 
                              c: f.c, 
                              f: f.f,
                              source: 'preset',
                              micronutrients: f.micronutrients
                            })}
                            className="w-full bg-surface-alt/30 border border-border/30 rounded-xl p-4 text-left hover:border-accent/50 transition-all"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm">{f.name}</span>
                              <Plus size={16} className="text-accent" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                  <div className="bg-surface-alt rounded-2xl p-4 border border-border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">選択中</div>
                        <div className="text-lg font-black text-accent">{foodName}</div>
                      </div>
                      <button onClick={() => { setSelectedFood(null); setIsManualEntry(false); }} className="text-accent text-[10px] font-bold uppercase tracking-widest hover:underline">変更</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <div className="text-[8px] font-bold text-text-muted uppercase">KCAL</div>
                        <div className="text-xs font-bold text-accent">{selectedFood.cal}</div>
                      </div>
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <div className="text-[8px] font-bold text-text-muted uppercase">PRO</div>
                        <div className="text-xs font-bold text-accent-light">{selectedFood.p}</div>
                      </div>
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <div className="text-[8px] font-bold text-text-muted uppercase">CHO</div>
                        <div className="text-xs font-bold text-accent">{selectedFood.c}</div>
                      </div>
                      <div className="text-center p-2 bg-black/20 rounded-lg">
                        <div className="text-[8px] font-bold text-text-muted uppercase">FAT</div>
                        <div className="text-xs font-bold text-accent-dark">{selectedFood.f}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {meals.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMealType(m.id)}
                        className={cn(
                          "p-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                          selectedMealType === m.id ? "bg-accent border-accent text-black" : "bg-surface-alt border-border text-text-muted"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {isManualEntry && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">食品名</label>
                        <input 
                          className="w-full bg-surface-alt border border-border rounded-xl p-4 text-white font-bold outline-none focus:border-accent"
                          value={foodName}
                          onChange={(e) => setFoodName(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">分量 (G)</label>
                      <input 
                        type="number" 
                        autoFocus={!isManualEntry}
                        className="w-full bg-surface-alt border border-border rounded-xl p-4 text-white text-2xl font-black outline-none focus:border-accent text-center"
                        placeholder="100"
                        value={amountG}
                        onChange={(e) => updateNutrients(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-alt border border-border rounded-xl p-4">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">カロリー</label>
                        <input 
                          type="number"
                          className={cn(
                            "w-full bg-transparent text-xl font-black text-accent tabular-nums outline-none",
                            !isManualEntry && "pointer-events-none"
                          )}
                          value={calories}
                          onChange={(e) => isManualEntry && setCalories(e.target.value)}
                        />
                      </div>
                      <div className="bg-surface-alt border border-border rounded-xl p-4">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">タンパク質</label>
                        <input 
                          type="number"
                          className={cn(
                            "w-full bg-transparent text-xl font-black text-accent-light tabular-nums outline-none",
                            !isManualEntry && "pointer-events-none"
                          )}
                          value={protein}
                          onChange={(e) => isManualEntry && setProtein(e.target.value)}
                        />
                      </div>
                      <div className="bg-surface-alt border border-border rounded-xl p-4">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">炭水化物</label>
                        <input 
                          type="number"
                          className={cn(
                            "w-full bg-transparent text-xl font-black text-accent tabular-nums outline-none",
                            !isManualEntry && "pointer-events-none"
                          )}
                          value={carbs}
                          onChange={(e) => isManualEntry && setCarbs(e.target.value)}
                        />
                      </div>
                      <div className="bg-surface-alt border border-border rounded-xl p-4">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">脂質</label>
                        <input 
                          type="number"
                          className={cn(
                            "w-full bg-transparent text-xl font-black text-accent-dark tabular-nums outline-none",
                            !isManualEntry && "pointer-events-none"
                          )}
                          value={fat}
                          onChange={(e) => isManualEntry && setFat(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Micronutrients in Modal */}
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">微量栄養素 (自動計算)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Vit D (μg)', val: vitD },
                          { label: 'Mg (mg)', val: magnesium },
                          { label: 'Zn (mg)', val: zinc },
                          { label: 'Fe (mg)', val: iron },
                          { label: 'Ca (mg)', val: calcium },
                          { label: 'K (mg)', val: potassium },
                          { label: 'B12 (μg)', val: vitB12 },
                          { label: 'Vit C (mg)', val: vitC },
                          { label: 'Omega3 (mg)', val: omega3 },
                        ].map(item => (
                          <div key={item.label} className="bg-surface-alt/50 border border-border/50 rounded-lg p-2">
                            <label className="block text-[8px] font-bold text-text-muted uppercase mb-1">{item.label}</label>
                            <div className="text-xs font-bold text-white tabular-nums">{item.val || '0'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedFood && (
                <button 
                  onClick={handleAddFood}
                  disabled={isSaving || !foodName || !amountG || !calories}
                  className="w-full bg-accent text-black font-black py-4 mt-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={20} /> 追加する
                    </>
                  )}
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {isBarcodeModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBarcodeModalOpen(false)}
              className="fixed inset-0 bg-black/90 z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 bg-surface border border-border rounded-3xl overflow-hidden z-[90] flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-border">
                <h2 className="text-sm font-black uppercase tracking-widest">BARCODE SCANNER</h2>
                <button onClick={() => setIsBarcodeModalOpen(false)} className="text-text-muted">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 bg-black relative">
                <BarcodeScanner
                  width="100%"
                  height="100%"
                  onUpdate={(err, result) => {
                    if (result) onBarcodeScanned({ data: result.getText() });
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-48 border-2 border-accent rounded-2xl relative">
                    <div className="absolute inset-0 bg-accent/10 animate-pulse" />
                  </div>
                </div>
                <div className="absolute bottom-8 inset-x-0 text-center">
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Align barcode within frame</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
