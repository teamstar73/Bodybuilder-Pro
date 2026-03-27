/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { colors } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Droplets, Pill, Scale, Plus, ChevronRight, TrendingDown, TrendingUp, Sparkles, Utensils, Lightbulb, X, Check, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getPersonalizedRecommendations, calculateMicronutrientTargets } from '../utils/nutrition';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardScreen({ onNavigate }: { onNavigate?: (tab: 'home' | 'log' | 'supplements' | 'peaking' | 'progress' | 'profile' | 'settings') => void }) {
  const { 
    user, 
    getTodayMacros, 
    getTargetMacros, 
    getTodayLog, 
    supplements, 
    addMeasurement, 
    updateUser, 
    measurements, 
    waterIntake, 
    addWater, 
    getTodaySupplementIntakeRate,
    getWaterTarget,
    getTodayWaterIntakeRate
  } = useAppStore();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(user?.weight_kg?.toString() || '');
  const [newBodyFat, setNewBodyFat] = useState(user?.body_fat_pct?.toString() || '');
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  const todayMacros = getTodayMacros();
  const targetMacros = getTargetMacros();
  
  const recommendations = user ? getPersonalizedRecommendations(user) : null;
  
  const remainingKcal = Math.max(0, targetMacros.calories - todayMacros.calories);
  const data = [
    { name: 'Consumed', value: todayMacros.calories },
    { name: 'Remaining', value: remainingKcal },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  // Process measurements for sparkline
  const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weightHistory = sortedMeasurements.slice(-14).map(m => m.weight_kg);
  
  // Calculate delta
  const lastWeekWeight = sortedMeasurements.length > 7 ? sortedMeasurements[sortedMeasurements.length - 8].weight_kg : user?.weight_kg;
  const weightDelta = user?.weight_kg && lastWeekWeight ? user.weight_kg - lastWeekWeight : 0;

  const intakeRate = getTodaySupplementIntakeRate();
  const waterRate = getTodayWaterIntakeRate();
  const waterTarget = getWaterTarget();

  const todayLog = getTodayLog();
  const todayMicros = todayLog.reduce((acc, curr) => ({
    vitamin_d_iu: acc.vitamin_d_iu + (curr.micronutrients?.vitamin_d_iu || curr.vitamin_d_ug || 0),
    magnesium_mg: acc.magnesium_mg + (curr.magnesium_mg || 0),
    zinc_mg: acc.zinc_mg + (curr.zinc_mg || 0),
    iron_mg: acc.iron_mg + (curr.iron_mg || 0),
    calcium_mg: acc.calcium_mg + (curr.calcium_mg || 0),
    potassium_mg: acc.potassium_mg + (curr.potassium_mg || 0),
    vitamin_b12_ug: acc.vitamin_b12_ug + (curr.vitamin_b12_ug || 0),
    vitamin_c_mg: acc.vitamin_c_mg + (curr.vitamin_c_mg || 0),
    omega3_mg: acc.omega3_mg + (curr.omega_3_mg || 0),
  }), { 
    vitamin_d_iu: 0, magnesium_mg: 0, zinc_mg: 0, iron_mg: 0,
    calcium_mg: 0, potassium_mg: 0, vitamin_b12_ug: 0, vitamin_c_mg: 0, omega3_mg: 0
  });

  const targetMicros = user ? calculateMicronutrientTargets(user) : null;

  const alerts = targetMicros ? [
    { label: 'ビタミンD', val: todayMicros.vitamin_d_iu, target: targetMicros.vitamin_d_iu, tip: '日光浴やサプリメントを検討してください' },
    { label: 'マグネシウム', val: todayMicros.magnesium_mg, target: targetMicros.magnesium_mg, tip: 'ナッツ・葉物野菜を追加してください' },
    { label: '亜鉛', val: todayMicros.zinc_mg, target: targetMicros.zinc_mg, tip: '牡蠣・赤身肉・ナッツを検討してください' },
    { label: '鉄', val: todayMicros.iron_mg, target: targetMicros.iron_mg, tip: '赤身肉・ほうれん草・レバーを検討してください' },
    { label: 'カルシウム', val: todayMicros.calcium_mg, target: targetMicros.calcium_mg, tip: '乳製品・小魚・大豆製品を検討してください' },
    { label: 'カリウム', val: todayMicros.potassium_mg, target: targetMicros.potassium_mg, tip: 'バナナ・アボカド・サツマイモを検討してください' },
    { label: 'ビタミンB12', val: todayMicros.vitamin_b12_ug, target: targetMicros.vitamin_b12_ug, tip: '肉・魚・卵を検討してください' },
    { label: 'ビタミンC', val: todayMicros.vitamin_c_mg, target: targetMicros.vitamin_c_mg, tip: 'フルーツ・ブロッコリーを検討してください' },
    { label: 'オメガ3', val: todayMicros.omega3_mg, target: targetMicros.omega3_mg, tip: '青魚・くるみ・えごま油を検討してください' },
  ].filter(a => (a.val / a.target) < 0.6) : [];

  const handleSaveWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    if (!newBodyFat || isNaN(parseFloat(newBodyFat))) return;
    setIsSavingWeight(true);
    try {
      const weight = parseFloat(newWeight);
      const bodyFat = parseFloat(newBodyFat);
      
      // Calculate FFMI
      let ffmi = 0;
      if (user?.height_cm) {
        const heightM = user.height_cm / 100;
        const lbm = weight * (1 - bodyFat / 100);
        ffmi = Math.round((lbm / (heightM * heightM)) * 10) / 10;
      }

      await addMeasurement({
        date: todayStr,
        weight_kg: weight,
        body_fat_pct: bodyFat,
        ffmi: ffmi,
      });
      await updateUser({ weight_kg: weight, body_fat_pct: bodyFat });
      setIsWeightModalOpen(false);
    } catch (error) {
      console.error('Error saving weight:', error);
    } finally {
      setIsSavingWeight(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Calorie Ring */}
      <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col items-center">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={85}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={colors.accent} />
                <Cell fill={colors.surfaceAlt} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-black tabular-nums">{remainingKcal.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">残 KCAL</div>
          </div>
        </div>
        <div className="w-full mt-6 flex justify-between">
          <div className="text-left">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">摂取済み</div>
            <div className="text-xl font-bold">{todayMacros.calories.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">目標値</div>
            <div className="text-xl font-bold">{targetMacros.calories.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-1 gap-4">
        <MacroBar label="PROTEIN" current={todayMacros.protein} target={targetMacros.protein_g} color="bg-accent-light" />
        <MacroBar label="CARBS" current={todayMacros.carbs} target={targetMacros.carbs_g} color="bg-accent" />
        <MacroBar label="FAT" current={todayMacros.fat} target={targetMacros.fat_g} color="bg-accent-dark" />
      </div>

      {/* Water & Supplements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-accent" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Hydration</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => addWater(-250)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-alt border border-border-light text-text-muted hover:text-accent active:scale-90 transition-all"
              >
                -
              </button>
              <button 
                onClick={() => addWater(250)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-alt border border-border-light text-text-muted hover:text-accent active:scale-90 transition-all"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500" 
                style={{ width: `${Math.min(100, waterRate)}%` }} 
              />
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <div className="text-xl font-black tabular-nums">
                  {waterIntake.toLocaleString()} <span className="text-[10px] font-normal text-text-muted">/ {waterTarget.toLocaleString()} ML</span>
                </div>
                {waterRate >= 100 && (
                  <div className="text-[10px] font-bold text-accent flex items-center gap-1 mt-0.5">
                    <Check size={10} /> 目標達成
                  </div>
                )}
              </div>
              <div className="text-xs font-bold text-accent">{Math.round(waterRate)}%</div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate?.('supplements' as any)}
          className="bg-surface border border-border rounded-2xl p-5 space-y-4 cursor-pointer hover:border-accent/50 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Pill size={16} className="text-accent" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Supplements</span>
            </div>
            <div className="text-[10px] font-bold text-accent">今日の水分: {Math.round(waterRate)}%</div>
          </div>
          <div className="space-y-3">
            <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500" 
                style={{ width: `${intakeRate}%` }} 
              />
            </div>
            <div className="flex justify-between items-end">
              <div className="text-xs font-bold text-accent">{Math.round(intakeRate)}%</div>
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                Today's Supplements: {supplements.filter(s => s.taken_dates.includes(todayStr)).length} / {supplements.length} Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Sparkline */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Current Weight</div>
            <div className="text-3xl font-black">{user?.weight_kg || '--'} <span className="text-sm font-normal text-text-muted">KG</span></div>
          </div>
          <div className="text-right">
            <div className={cn("text-xs font-bold flex items-center justify-end gap-1 text-accent")}>
              {weightDelta <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {Math.abs(weightDelta).toFixed(1)} KG
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest">Vs Last Week</div>
          </div>
        </div>
        <div className="h-16 flex items-end gap-1">
          {weightHistory.length > 0 ? (
            weightHistory.map((w, i) => {
              const max = Math.max(...weightHistory);
              const min = Math.min(...weightHistory);
              const range = max - min || 1;
              const height = ((w - min) / range) * 60 + 20; // Scale between 20% and 80%
              return (
                <div key={i} className={cn("flex-1 rounded-t-sm", i === weightHistory.length - 1 ? "bg-accent" : "bg-surface-alt")} style={{ height: `${height}%` }} />
              );
            })
          ) : (
            [40, 45, 42, 48, 50, 47, 44, 46, 43, 41, 38, 35, 32, 30].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-surface-alt" style={{ height: `${h}%` }} />
            ))
          )}
        </div>
      </div>

      {/* Expert Guidance */}
      {recommendations && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent" size={18} />
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Expert Guidance</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Micronutrient Alerts */}
            {alerts.length > 0 && (
              <div className="bg-surface border border-accent/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-bold uppercase tracking-tight">微量栄養素アラート</span>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert, i) => (
                    <div key={i} className="text-[11px] text-text-muted leading-relaxed">
                      <span className="font-bold text-accent">⚠ {alert.label} {Math.round((alert.val / alert.target) * 100)}%不足</span>
                      <span className="mx-1">—</span>
                      {alert.tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Meals */}
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Utensils size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">推奨メニュー</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendations.meals.map((meal, i) => (
                  <span key={i} className="bg-surface-alt text-text-muted text-[10px] px-2 py-1 rounded-md border border-border-light">
                    {meal}
                  </span>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Lightbulb size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">プロのアドバイス</span>
              </div>
              <ul className="space-y-2">
                {recommendations.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-text-muted leading-relaxed flex gap-2">
                    <span className="text-accent">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button 
          onClick={() => onNavigate?.('log')}
          className="flex-1 bg-accent text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={20} /> 食事を記録
        </button>
        <button 
          onClick={() => setIsWeightModalOpen(true)}
          className="flex-1 bg-transparent border border-accent text-accent font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Scale size={20} /> 体重を入力
        </button>
      </div>

      {/* Weight Modal */}
      <AnimatePresence>
        {isWeightModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWeightModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] bg-surface-alt border border-border rounded-3xl p-6 z-[70] shadow-2xl max-w-sm mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">体重を入力</h2>
                <button onClick={() => setIsWeightModalOpen(false)} className="text-text-muted hover:text-text">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">体重 (KG)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full bg-surface border border-border rounded-xl p-4 text-text text-2xl font-black outline-none focus:border-accent"
                      placeholder="85.5"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">体脂肪 (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full bg-surface border border-border rounded-xl p-4 text-text text-2xl font-black outline-none focus:border-accent"
                      placeholder="12.0"
                      value={newBodyFat}
                      onChange={(e) => setNewBodyFat(e.target.value)}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleSaveWeight}
                  disabled={isSavingWeight || !newWeight || !newBodyFat}
                  className="w-full bg-accent text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSavingWeight ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={20} /> 保存する
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const progress = Math.min(100, (current / target) * 100);
  const textColor = color.includes('light') ? 'text-accent-light' : color.includes('dark') ? 'text-accent-dark' : 'text-accent';
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 space-y-2">
      <div className="flex justify-between items-end">
        <span className={cn("text-[10px] font-black tracking-widest uppercase", textColor)}>{label}</span>
        <div className="text-sm font-bold tabular-nums">
          {current} <span className="text-[10px] text-text-muted font-normal">/ {target}G</span>
        </div>
      </div>
      <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-500", color)} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
