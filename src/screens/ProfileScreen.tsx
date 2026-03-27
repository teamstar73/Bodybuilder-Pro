/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User as UserIcon, Mail, Calendar, Ruler, Weight, Activity, Target, Shield, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserPhase, DietType, TrainingExperience } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfileScreen() {
  const { user, updateUser } = useAppStore();
  const [isEditingPhase, setIsEditingPhase] = useState(false);
  const [isEditingDiet, setIsEditingDiet] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [editingField, setEditingField] = useState<{ key: string; label: string; value: any } | null>(null);

  if (!user) return null;

  const phases: { id: UserPhase; label: string; desc: string }[] = [
    { id: 'bulk', label: 'Bulk', desc: '筋肥大・増量期' },
    { id: 'lean-bulk', label: 'Lean Bulk', desc: '脂肪を抑えた筋肥大' },
    { id: 'cut', label: 'Cut', desc: '脂肪燃焼・減量期' },
    { id: 'peak', label: 'Peak', desc: 'コンテスト直前調整' },
    { id: 'maintain', label: 'Maintain', desc: '現状維持' },
  ];

  const experiences: { id: TrainingExperience; label: string }[] = [
    { id: 'beginner', label: '初心者（〜1年）' },
    { id: 'intermediate', label: '中級者（1-3年）' },
    { id: 'advanced', label: '上級者（3年以上）' },
  ];

  const diets: { id: DietType; label: string }[] = [
    { id: 'standard', label: '標準' },
    { id: 'plant-based', label: '植物性' },
    { id: 'keto', label: 'ケト' },
    { id: 'low-carb', label: '低炭水化物' },
    { id: 'carb-cycling', label: 'カーボサイクル' },
    { id: 'fasting', label: '断食' },
  ];

  const handlePhaseChange = (newPhase: UserPhase) => {
    updateUser({ phase: newPhase });
    setIsEditingPhase(false);
  };

  const handleDietChange = (newDiet: DietType) => {
    updateUser({ diet_type: newDiet });
    setIsEditingDiet(false);
  };

  const handleExperienceChange = (newExp: TrainingExperience) => {
    updateUser({ training_experience: newExp });
    setIsEditingExperience(false);
  };

  const handleUpdateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingField) {
      let value: any = editingField.value;
      if (editingField.key.includes('weight') || editingField.key === 'activity_factor' || editingField.key.includes('body_fat_pct')) {
        value = parseFloat(editingField.value);
        if (isNaN(value)) return;
      } else if (editingField.key === 'age' || editingField.key.includes('height')) {
        value = parseInt(editingField.value);
        if (isNaN(value)) return;
      }
      updateUser({ [editingField.key]: value });
      setEditingField(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-accent p-1 overflow-hidden shadow-2xl shadow-accent/10">
            <img 
              src="https://picsum.photos/seed/user/200/200" 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">{user.name}</h2>
          <button 
            onClick={() => setIsEditingPhase(true)}
            className="flex items-center gap-2 mx-auto mt-1 group"
          >
            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
              {user.phase} PHASE
            </div>
            <Edit2 size={10} className="text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Phase Selection Modal */}
      <AnimatePresence>
        {isEditingPhase && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingPhase(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] bg-surface border border-border rounded-3xl p-6 z-[110] max-w-sm mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">目標フェーズを変更</h3>
                <button onClick={() => setIsEditingPhase(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {phases.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePhaseChange(p.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center",
                      user.phase === p.id ? "bg-accent text-black border-accent" : "bg-surface-alt border-border"
                    )}
                  >
                    <div>
                      <div className={cn("font-bold", user.phase === p.id ? "text-black" : "text-white")}>{p.label}</div>
                      <div className={cn("text-[10px] uppercase tracking-widest", user.phase === p.id ? "text-black/60" : "text-text-muted")}>{p.desc}</div>
                    </div>
                    {user.phase === p.id && <Check className="text-black" size={20} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Diet Selection Modal */}
      <AnimatePresence>
        {isEditingDiet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingDiet(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] bg-surface border border-border rounded-3xl p-6 z-[110] max-w-sm mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">食事スタイルを変更</h3>
                <button onClick={() => setIsEditingDiet(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {diets.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleDietChange(d.id)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all",
                      user.diet_type === d.id ? "bg-accent border-accent text-black" : "bg-surface-alt border-border text-white"
                    )}
                  >
                    <div className="font-bold text-sm">{d.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Experience Selection Modal */}
      <AnimatePresence>
        {isEditingExperience && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingExperience(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] bg-surface border border-border rounded-3xl p-6 z-[110] max-w-sm mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">トレーニング歴を変更</h3>
                <button onClick={() => setIsEditingExperience(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {experiences.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleExperienceChange(e.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center",
                      user.training_experience === e.id ? "bg-accent text-black border-accent" : "bg-surface-alt border-border"
                    )}
                  >
                    <div className={cn("font-bold", user.training_experience === e.id ? "text-black" : "text-white")}>{e.label}</div>
                    {user.training_experience === e.id && <Check className="text-black" size={20} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Generic Edit Modal */}
      <AnimatePresence>
        {editingField && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingField(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[30%] bg-surface border border-border rounded-3xl p-6 z-[110] max-w-sm mx-auto"
            >
              <h3 className="text-lg font-black uppercase tracking-tight mb-4">{editingField.label}を編集</h3>
              <form onSubmit={handleUpdateField} className="space-y-4">
                <input 
                  type={typeof editingField.value === 'number' ? 'number' : 'text'}
                  step="0.1"
                  className="w-full bg-surface-alt border border-border-light rounded-xl p-4 text-white outline-none focus:border-accent"
                  value={editingField.value === null || editingField.value === undefined || (typeof editingField.value === 'number' && isNaN(editingField.value)) ? '' : editingField.value}
                  onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                  autoFocus
                />
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="flex-1 h-12 rounded-xl bg-surface-alt border border-border font-bold"
                  >
                    キャンセル
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-accent text-black font-black"
                  >
                    保存
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">基本情報</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <ProfileItem 
            icon={<UserIcon size={18} />} 
            label="名前" 
            value={user.name} 
            onClick={() => setEditingField({ key: 'name', label: '名前', value: user.name })}
          />
          <ProfileItem 
            icon={<Calendar size={18} />} 
            label="年齢" 
            value={user.age ? `${user.age} 歳` : '未設定'} 
            onClick={() => setEditingField({ key: 'age', label: '年齢', value: user.age || 0 })}
          />
          <ProfileItem 
            icon={<Ruler size={18} />} 
            label="身長" 
            value={user.height_cm ? `${user.height_cm} cm` : '未設定'} 
            onClick={() => setEditingField({ key: 'height_cm', label: '身長', value: user.height_cm || 0 })}
          />
          <ProfileItem 
            icon={<Weight size={18} />} 
            label="現在の体重" 
            value={user.weight_kg ? `${user.weight_kg} kg` : '未設定'} 
            onClick={() => setEditingField({ key: 'weight_kg', label: '現在の体重', value: user.weight_kg || 0 })}
          />
          <ProfileItem 
            icon={<Activity size={18} />} 
            label="体脂肪率" 
            value={user.body_fat_pct ? `${user.body_fat_pct} %` : '未設定'} 
            onClick={() => setEditingField({ key: 'body_fat_pct', label: '体脂肪率', value: user.body_fat_pct || 0 })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">目標・設定</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <ProfileItem 
            icon={<Target size={18} />} 
            label="目標体重" 
            value={user.goal_weight_kg ? `${user.goal_weight_kg} kg` : '未設定'} 
            onClick={() => setEditingField({ key: 'goal_weight_kg', label: '目標体重', value: user.goal_weight_kg || 0 })}
          />
          <ProfileItem 
            icon={<Activity size={18} />} 
            label="目標体脂肪率" 
            value={user.goal_body_fat_pct ? `${user.goal_body_fat_pct} %` : '未設定'} 
            onClick={() => setEditingField({ key: 'goal_body_fat_pct', label: '目標体脂肪率', value: user.goal_body_fat_pct || 0 })}
          />
          <ProfileItem 
            icon={<Activity size={18} />} 
            label="活動レベル" 
            value={user.activity_factor ? user.activity_factor.toString() : '未設定'} 
            onClick={() => setEditingField({ key: 'activity_factor', label: '活動レベル', value: user.activity_factor || 1.2 })}
          />
          <ProfileItem 
            icon={<Shield size={18} />} 
            label="食事スタイル" 
            value={diets.find(d => d.id === user.diet_type)?.label || user.diet_type?.toUpperCase() || 'N/A'} 
            onClick={() => setIsEditingDiet(true)}
          />
          <ProfileItem 
            icon={<ChevronRight size={18} />} 
            label="トレーニング経験" 
            value={experiences.find(e => e.id === user.training_experience)?.label || user.training_experience?.toUpperCase() || 'N/A'} 
            onClick={() => setIsEditingExperience(true)}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ 
  icon, 
  label, 
  value, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 border-b border-border last:border-0 transition-colors",
        onClick && "hover:bg-surface-high/50 cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3 text-text-muted">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-white">{value}</span>
        {onClick && <Edit2 size={12} className="text-text-faint" />}
      </div>
    </div>
  );
}
