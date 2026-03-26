/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { User } from '../types';
import { calculateTDEE, calculateTargetMacros } from '../utils/nutrition';
import { ChevronRight, ChevronLeft, Check, Info, Activity, Target, Calendar, Trophy } from 'lucide-react';
import { colors } from '../constants/theme';
import { cn } from '../lib/utils';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const setUser = useAppStore((state) => state.setUser);
  
  const [formData, setFormData] = useState<Partial<User>>({
    sex: 'male',
    activity_factor: 1.2,
    phase: 'maintain',
    diet_type: 'standard',
    training_experience: 'beginner',
    allergies: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const totalSteps = 13;

  const handleNext = async (overrideValue?: any) => {
    console.log(`handleNext called at step ${step}`, { formData, overrideValue });
    
    // Basic validation
    if (step === 1 && !formData.name) return;
    if (step === 2) {
      if (!formData.sex || !formData.diet_type || !formData.training_experience) return;
    }
    
    const age = step === 3 ? (overrideValue ?? formData.age) : formData.age;
    if (step === 3 && !age) return;
    
    const height = step === 4 ? (overrideValue ?? formData.height_cm) : formData.height_cm;
    if (step === 4 && !height) return;
    
    const weight = step === 5 ? (overrideValue ?? formData.weight_kg) : formData.weight_kg;
    if (step === 5 && !weight) return;
    
    const activity = step === 7 ? (overrideValue ?? formData.activity_factor) : formData.activity_factor;
    if (step === 7 && !activity) return;
    
    const phase = step === 8 ? (overrideValue ?? formData.phase) : formData.phase;
    if (step === 8 && !phase) return;
    
    const goalWeight = step === 9 ? (overrideValue ?? formData.goal_weight_kg) : formData.goal_weight_kg;
    if (step === 9 && !goalWeight) return;

    let nextStep = step + 1;
    if (nextStep === 10 && formData.diet_type !== 'fasting') {
      nextStep = 11;
    }

    if (step < totalSteps) {
      console.log(`Moving to step ${nextStep}`);
      setStep(nextStep);
      window.scrollTo(0, 0);
    } else {
      setIsSaving(true);
      try {
        const finalData: User = {
          ...formData,
          age: formData.age || 0,
          height_cm: formData.height_cm || 0,
          weight_kg: formData.weight_kg || 0,
          activity_factor: formData.activity_factor || 1.2,
          goal_weight_kg: formData.goal_weight_kg || formData.weight_kg || 0,
        } as User;
        
        console.log('Finalizing onboarding with data:', finalData);
        await setUser(finalData);
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('プロフィールの保存に失敗しました。');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    let prevStep = step - 1;
    if (prevStep === 10 && formData.diet_type !== 'fasting') {
      prevStep = 9;
    }
    if (step > 1) setStep(prevStep);
  };

  const updateField = (field: keyof User, value: any) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">お名前を教えてください</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">名前</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white focus:border-amber-500 outline-none"
                  placeholder="ENTER NAME"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>
            </div>
          </div>
        );
      case 2:
        const diets = [
          { id: 'standard', label: '標準' },
          { id: 'plant-based', label: '植物性' },
          { id: 'keto', label: 'ケト' },
          { id: 'low-carb', label: '低炭水化物' },
          { id: 'carb-cycling', label: 'カーボサイクル' },
          { id: 'fasting', label: '断食' },
        ];
        const experiences = [
          { id: 'beginner', label: '初心者（〜1年）' },
          { id: 'intermediate', label: '中級者（1-3年）' },
          { id: 'advanced', label: '上級者（3年以上）' },
        ];
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-tight">基本設定</h2>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">性別</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateField('sex', 'male')}
                    className={cn(
                      "p-3 rounded-xl font-bold border transition-all text-sm",
                      formData.sex === 'male' ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    )}
                  >
                    MALE
                  </button>
                  <button 
                    onClick={() => updateField('sex', 'female')}
                    className={cn(
                      "p-3 rounded-xl font-bold border transition-all text-sm",
                      formData.sex === 'female' ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    )}
                  >
                    FEMALE
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">食事スタイル</label>
                <div className="grid grid-cols-2 gap-2">
                  {diets.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => updateField('diet_type', d.id)}
                      className={cn(
                        "p-3 rounded-xl font-bold border transition-all text-xs",
                        formData.diet_type === d.id ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">トレーニング歴</label>
                <div className="grid grid-cols-1 gap-2">
                  {experiences.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => updateField('training_experience', e.id)}
                      className={cn(
                        "p-3 rounded-xl font-bold border transition-all text-xs text-left px-4",
                        formData.training_experience === e.id ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">年齢を入力</h2>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">年齢</label>
              <input 
                type="number" 
                inputMode="numeric"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                placeholder="25"
                value={formData.age === undefined || isNaN(formData.age as number) ? '' : formData.age}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('age', val === '' ? undefined : parseInt(val));
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">身長を入力</h2>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">身長 (CM)</label>
              <input 
                type="number" 
                inputMode="numeric"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                placeholder="180"
                value={formData.height_cm === undefined || isNaN(formData.height_cm as number) ? '' : formData.height_cm}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('height_cm', val === '' ? undefined : parseInt(val));
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">現在の体重を入力</h2>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">体重 (KG)</label>
              <input 
                type="number" 
                inputMode="decimal"
                step="0.1"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                placeholder="85.5"
                value={formData.weight_kg === undefined || isNaN(formData.weight_kg as number) ? '' : formData.weight_kg}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('weight_kg', val === '' ? undefined : parseFloat(val));
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">体脂肪率 (任意)</h2>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">体脂肪 %</label>
              <input 
                type="number" 
                inputMode="numeric"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                placeholder="12"
                value={formData.body_fat_pct === undefined || isNaN(formData.body_fat_pct as number) ? '' : formData.body_fat_pct}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('body_fat_pct', val === '' ? undefined : parseInt(val));
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
              <p className="mt-4 text-zinc-500 text-xs">正確なマクロ計算に役立ちますが、不明な場合は空欄でも構いません。</p>
            </div>
          </div>
        );
      case 7:
        const activities = [
          { label: 'Sedentary', factor: 1.2, desc: 'デスクワーク中心' },
          { label: 'Light', factor: 1.375, desc: '週1-3回の運動' },
          { label: 'Moderate', factor: 1.55, desc: '週3-5回の運動' },
          { label: 'Active', factor: 1.725, desc: '週6-7回の激しい運動' },
          { label: 'Very Active', factor: 1.9, desc: '肉体労働・アスリート' },
        ];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">活動レベルを選択</h2>
            <div className="space-y-3">
              {activities.map((a) => (
                <button
                  key={a.label}
                  onClick={() => { updateField('activity_factor', a.factor); handleNext(a.factor); }}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center",
                    formData.activity_factor === a.factor ? "bg-amber-500/10 border-amber-500" : "bg-zinc-900 border-zinc-800"
                  )}
                >
                  <div>
                    <div className={cn("font-bold", formData.activity_factor === a.factor ? "text-amber-500" : "text-white")}>{a.label}</div>
                    <div className="text-xs text-zinc-500">{a.desc}</div>
                  </div>
                  {formData.activity_factor === a.factor && <Check className="text-amber-500" size={20} />}
                </button>
              ))}
            </div>
          </div>
        );
      case 8:
        const phases = [
          { id: 'bulk', label: 'Bulk', desc: '筋肥大・増量期' },
          { id: 'lean-bulk', label: 'Lean Bulk', desc: '脂肪を抑えた筋肥大' },
          { id: 'cut', label: 'Cut', desc: '脂肪燃焼・減量期' },
          { id: 'peak', label: 'Peak', desc: 'コンテスト直前調整' },
          { id: 'maintain', label: 'Maintain', desc: '現状維持' },
        ];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">現在のフェーズ</h2>
            <div className="grid grid-cols-1 gap-4">
              {phases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { updateField('phase', p.id); handleNext(p.id); }}
                  className={cn(
                    "p-6 rounded-xl border text-left transition-all flex justify-between items-center",
                    formData.phase === p.id ? "bg-amber-500/10 border-amber-500" : "bg-zinc-900 border-zinc-800"
                  )}
                >
                  <div>
                    <div className={cn("font-bold text-lg", formData.phase === p.id ? "text-amber-500" : "text-white")}>{p.label}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.desc}</div>
                  </div>
                  {formData.phase === p.id && <Check className="text-amber-500" size={20} />}
                </button>
              ))}
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">目標体重を入力</h2>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">目標体重 (KG)</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  step="0.1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                  placeholder="80.0"
                  value={formData.goal_weight_kg === undefined || isNaN(formData.goal_weight_kg as number) ? '' : formData.goal_weight_kg}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('goal_weight_kg', val === '' ? undefined : parseFloat(val));
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
            </div>
          </div>
        );
      case 10:
        const windows = ['16:8', '18:6', '20:4', 'OMAD'];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">ファスティング窓</h2>
            <div className="grid grid-cols-1 gap-4">
              {windows.map((w) => (
                <button
                  key={w}
                  onClick={() => { updateField('fasting_window', w); handleNext(); }}
                  className={cn(
                    "p-6 rounded-xl border text-center transition-all",
                    formData.fasting_window === w ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-zinc-900 border-zinc-800 text-white"
                  )}
                >
                  <div className="text-xl font-black">{w}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 11:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">アレルギー・制限 (任意)</h2>
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm">避けている食材があれば入力してください（カンマ区切り）。</p>
              <input 
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                placeholder="牛乳, 卵, ナッツ..."
                value={formData.allergies?.join(', ') || ''}
                onChange={(e) => updateField('allergies', e.target.value.split(',').map(s => s.trim()))}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
          </div>
        );
      case 12:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">大会日程 (任意)</h2>
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm">大会日を設定すると、自動的にピーキングプロトコルが生成されます。</p>
              <input 
                type="date" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white outline-none focus:border-amber-500"
                value={formData.competition_date || ''}
                onChange={(e) => updateField('competition_date', e.target.value)}
              />
              <button 
                onClick={() => { updateField('competition_date', undefined); handleNext(); }}
                className="w-full text-zinc-500 text-sm hover:text-white transition-colors"
              >
                スキップする
              </button>
            </div>
          </div>
        );
      case 13:
        const tdee = calculateTDEE(formData as User);
        const targets = calculateTargetMacros(formData as User);
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">計算結果</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="text-center">
                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">推定TDEE</div>
                <div className="text-4xl font-black text-white">{Math.round(tdee)} <span className="text-sm font-normal text-zinc-500">KCAL</span></div>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-teal-500 text-[10px] font-bold uppercase mb-1">PROTEIN</div>
                  <div className="text-xl font-bold text-white">{targets.protein_g}g</div>
                </div>
                <div>
                  <div className="text-amber-500 text-[10px] font-bold uppercase mb-1">CARBS</div>
                  <div className="text-xl font-bold text-white">{targets.carbs_g}g</div>
                </div>
                <div>
                  <div className="text-rose-500 text-[10px] font-bold uppercase mb-1">FAT</div>
                  <div className="text-xl font-bold text-white">{targets.fat_g}g</div>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
                <Info className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  これらの数値は科学的根拠に基づいた初期設定です。体調や進捗に合わせてアプリ内で調整可能です。
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-6 pt-12">
        <div className="text-amber-500 font-bold text-xs tracking-[0.2em] mb-1">STEP {step.toString().padStart(2, '0')}/{totalSteps.toString().padStart(2, '0')}</div>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full", i + 1 <= step ? "bg-amber-500" : "bg-zinc-800")} />
          ))}
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-6 pb-12 flex gap-4">
        {step > 1 && (
          <button 
            onClick={handleBack}
            className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <button 
          onClick={handleNext}
          disabled={isSaving}
          className="flex-1 h-14 rounded-xl bg-amber-500 text-black font-black tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {step === totalSteps ? 'アプリを始める' : '次へ'}
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
