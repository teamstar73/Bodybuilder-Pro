/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Droplets, Pill, Scale, Plus, ChevronRight, TrendingDown, TrendingUp, Sparkles, Utensils, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';
import { getPersonalizedRecommendations } from '../utils/nutrition';

export default function DashboardScreen() {
  const { user, getTodayMacros, getTargetMacros, getTodayLog, toggleSupplementTaken, supplements } = useAppStore();
  const todayMacros = getTodayMacros();
  const targetMacros = getTargetMacros();
  
  const recommendations = user ? getPersonalizedRecommendations(user) : null;
  
  const remainingKcal = Math.max(0, targetMacros.calories - todayMacros.calories);
  const data = [
    { name: 'Consumed', value: todayMacros.calories },
    { name: 'Remaining', value: remainingKcal },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-24">
      {/* Calorie Ring */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center">
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
                <Cell fill="#F59E0B" />
                <Cell fill="#1A1A1A" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-black tabular-nums">{remainingKcal.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">残 KCAL</div>
          </div>
        </div>
        <div className="w-full mt-6 flex justify-between">
          <div className="text-left">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">摂取済み</div>
            <div className="text-xl font-bold">{todayMacros.calories.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">目標値</div>
            <div className="text-xl font-bold">{targetMacros.calories.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-1 gap-4">
        <MacroBar label="PROTEIN" current={todayMacros.protein} target={targetMacros.protein_g} color="bg-teal-500" />
        <MacroBar label="CARBS" current={todayMacros.carbs} target={targetMacros.carbs_g} color="bg-amber-500" />
        <MacroBar label="FAT" current={todayMacros.fat} target={targetMacros.fat_g} color="bg-rose-500" />
      </div>

      {/* Water & Supplements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hydration</span>
            <Droplets size={16} className="text-teal-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={cn("w-6 h-8 rounded-full border-2 flex items-center justify-center", i <= 4 ? "border-teal-500 bg-teal-500/20" : "border-zinc-800")} />
            ))}
          </div>
          <div className="text-xs font-bold text-teal-500">2.0 / 4.0L</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Supplements</span>
            <Pill size={16} className="text-amber-500" />
          </div>
          <div className="space-y-2">
            {supplements.slice(0, 2).map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-[10px] font-bold truncate pr-2">{s.name}</span>
                <button 
                  onClick={() => toggleSupplementTaken(s.id, todayStr)}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    s.taken_dates.includes(todayStr) ? "bg-amber-500 border-amber-500" : "border-zinc-700"
                  )}
                >
                  {s.taken_dates.includes(todayStr) && <div className="w-2 h-2 bg-black rounded-full" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weight Sparkline */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Weight</div>
            <div className="text-3xl font-black">{user?.weight_kg} <span className="text-sm font-normal text-zinc-500">KG</span></div>
          </div>
          <div className="text-right">
            <div className="text-rose-500 text-xs font-bold flex items-center justify-end gap-1">
              <TrendingDown size={14} /> -0.4 KG
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Vs Last Week</div>
          </div>
        </div>
        <div className="h-16 flex items-end gap-1">
          {[40, 45, 42, 48, 50, 47, 44, 46, 43, 41, 38, 35, 32, 30].map((h, i) => (
            <div key={i} className={cn("flex-1 rounded-t-sm", i === 13 ? "bg-amber-500" : "bg-zinc-800")} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Expert Guidance */}
      {recommendations && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500" size={18} />
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expert Guidance</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Recommended Meals */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Utensils size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">推奨メニュー</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendations.meals.map((meal, i) => (
                  <span key={i} className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded-md border border-zinc-700">
                    {meal}
                  </span>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Lightbulb size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">プロのアドバイス</span>
              </div>
              <ul className="space-y-2">
                {recommendations.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
                    <span className="text-amber-500">•</span>
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
        <button className="flex-1 bg-amber-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Plus size={20} /> 食事を記録
        </button>
        <button className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Scale size={20} /> 体重を入力
        </button>
      </div>
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const progress = Math.min(100, (current / target) * 100);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
      <div className="flex justify-between items-end">
        <span className={cn("text-[10px] font-black tracking-widest uppercase", color.replace('bg-', 'text-'))}>{label}</span>
        <div className="text-sm font-bold tabular-nums">
          {current} <span className="text-[10px] text-zinc-500 font-normal">/ {target}G</span>
        </div>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-500", color)} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
