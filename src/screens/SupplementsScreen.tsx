/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { colors } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { Pill, Plus, ChevronRight, Check, Info, X, AlertCircle, TrendingUp, Zap, Shield, Beaker, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Supplement } from '../types';
import { getRecommendedSupplements } from '../utils/nutrition';
import { SUPPLEMENT_PRESETS } from '../data/supplements';
import { searchSupplements } from '../services/supplementSearch';

export default function SupplementsScreen() {
  const { user, supplements, addSupplement, updateSupplement, removeSupplement, toggleSupplementTaken } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  // Section 1: Recommended Stack
  const recommendedNames = useMemo(() => {
    if (!user) return [];
    return getRecommendedSupplements(user.phase);
  }, [user?.phase]);

  const recommendedStack = useMemo(() => {
    return SUPPLEMENT_PRESETS.filter(p => recommendedNames.includes(p.name));
  }, [recommendedNames]);

  // Section 2: Filtered & Sorted Supplement List
  const filteredSupplements = useMemo(() => {
    return searchSupplements(
      searchQuery,
      { evidence: evidenceFilter || undefined, phase: phaseFilter || undefined },
      supplements
    );
  }, [supplements, searchQuery, evidenceFilter, phaseFilter]);

  const [newSupp, setNewSupp] = useState<Partial<Supplement>>({
    name: '',
    dose_g: 0,
    timing: '',
    evidence_level: 'A',
    stock_days_remaining: 30,
    is_active: true,
    taken_dates: [],
    category: 'その他'
  });

  const handleAdd = async () => {
    if (!newSupp.name || !newSupp.dose_g) return;
    await addSupplement(newSupp as Omit<Supplement, 'id'>);
    setIsAddModalOpen(false);
    setNewSupp({
      name: '',
      dose_g: 0,
      timing: '',
      evidence_level: 'A',
      stock_days_remaining: 30,
      is_active: true,
      taken_dates: [],
      category: 'その他'
    });
  };

  const evidenceColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-accent text-black';
      case 'B': return 'bg-surface-alt text-text-muted border border-border-light';
      case 'C': return 'bg-surface-alt text-text-faint border border-border';
      default: return 'bg-surface-alt';
    }
  };

  const HighlightText = ({ text, query }: { text: string, query: string }) => {
    if (!query.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="text-accent font-black">{part}</span> 
            : part
        )}
      </>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Supplements</h1>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-2">Evidence-Based Optimization</p>
        </div>
        <Beaker className="text-accent" size={32} />
      </header>

      {/* Section 1: Recommended Stack */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Zap size={16} className="text-accent" />
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">今日の推奨スタック ({user?.phase})</h2>
        </div>
        <div className="bg-surface border border-accent/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap gap-2">
              {recommendedStack.map((s, i) => (
                <div key={i} className="bg-surface-alt border border-border-light px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{s.name}</span>
                  <div className={cn("w-1.5 h-1.5 rounded-full", evidenceColor(s.evidence_level))} />
                </div>
              ))}
            </div>
            {user?.phase === 'peak' && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-accent bg-accent/10 px-3 py-2 rounded-lg border border-accent/20">
                <AlertCircle size={12} />
                <span>水抜き期：クレアチン摂取は停止してください</span>
              </div>
            )}
            <p className="text-xs text-text-muted leading-relaxed">
              現在のフェーズに最適化されたエビデンスレベルの高いスタックです。
              {user?.phase === 'bulk' ? '筋出力の最大化とリカバリーを優先します。' : 
               user?.phase === 'cut' ? '代謝の維持と脂肪燃焼効率の向上を狙います。' : 
               'コンディションの安定と微量栄養素の補完を行います。'}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Supplement List & Search */}
      <section className="space-y-4">
        <div className="space-y-4 px-1">
          <div className="relative">
            <input 
              type="text" 
              placeholder="サプリメントを検索 (名前、タイミング、機序...)" 
              className="w-full bg-surface border border-border rounded-2xl py-4 px-12 text-sm outline-none focus:border-accent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Filter size={12} className="text-text-faint" />
              <span className="text-[10px] font-bold text-text-faint uppercase tracking-widest">Filters:</span>
            </div>
            {['A', 'B', 'C'].map(level => (
              <button
                key={level}
                onClick={() => setEvidenceFilter(evidenceFilter === level ? '' : level)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all border",
                  evidenceFilter === level 
                    ? "bg-accent text-black border-accent" 
                    : "bg-surface-alt text-text-muted border-border hover:border-border-light"
                )}
              >
                Level {level}
              </button>
            ))}
            <div className="w-px h-4 bg-border mx-1 self-center" />
            {['bulk', 'cut', 'peak', 'maintain'].map(p => (
              <button
                key={p}
                onClick={() => setPhaseFilter(phaseFilter === p ? '' : p)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all border uppercase",
                  phaseFilter === p 
                    ? "bg-white text-black border-white" 
                    : "bg-surface-alt text-text-muted border-border hover:border-border-light"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {filteredSupplements.length > 0 ? (
            filteredSupplements.map(s => {
              const isTaken = s.taken_dates.includes(today);
              const isLowStock = s.stock_days_remaining <= 7;
              
              return (
                <motion.div 
                  key={s.id}
                  layout
                  onClick={() => setSelectedSupplement(s)}
                  className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between hover:border-border-light transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isTaken ? "bg-accent text-black" : "bg-surface-alt text-text-faint group-hover:text-accent"
                    )}>
                      <Pill size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">
                          <HighlightText text={s.name} query={searchQuery} />
                        </span>
                        <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded", evidenceColor(s.evidence_level))}>
                          {s.evidence_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-text-muted font-medium">
                          <HighlightText text={`${s.dose_g}g • ${s.timing}`} query={searchQuery} />
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          isLowStock ? "text-accent" : "text-text-muted"
                        )}>
                          {isLowStock && <AlertCircle size={10} className="inline mr-1" />}
                          在庫: {s.stock_days_remaining}日
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSupplementTaken(s.id, today);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all",
                      isTaken ? "bg-accent border-accent text-black" : "border-border text-text-faint hover:border-accent/50"
                    )}
                  >
                    {isTaken ? <Check size={20} /> : <div className="w-2 h-2 rounded-full bg-border" />}
                  </button>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto text-text-faint">
                <Search size={32} />
              </div>
              <p className="text-text-muted text-sm">一致するサプリメントが見つかりません</p>
              <button 
                onClick={() => { setSearchQuery(''); setEvidenceFilter(''); setPhaseFilter(''); }}
                className="text-accent text-xs font-bold uppercase tracking-widest"
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FAB */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-accent text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSupplement && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSupplement(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-t-[32px] sm:rounded-[32px] p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Pill size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black uppercase tracking-tight">{selectedSupplement.name}</h2>
                      <span className={cn("text-xs font-black px-2 py-0.5 rounded", evidenceColor(selectedSupplement.evidence_level))}>
                        Evidence {selectedSupplement.evidence_level}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{selectedSupplement.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSupplement(null)} className="p-2 text-text-muted hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">作用機序</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{selectedSupplement.mechanism || 'データなし'}</p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-faint mb-1">推奨用量</h4>
                    <div className="text-lg font-black">{selectedSupplement.dose_g}g</div>
                  </div>
                  <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-faint mb-1">上限用量</h4>
                    <div className="text-lg font-black">{selectedSupplement.upper_dose_g || '--'}g</div>
                  </div>
                </div>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">最適摂取タイミング</h4>
                  <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                    <p className="text-sm font-bold text-white mb-1">{selectedSupplement.timing}</p>
                    <p className="text-xs text-text-muted">吸収効率と作用機序に基づいた推奨タイミングです。</p>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">相乗効果・注意事項</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Zap size={16} className="text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white mb-1">相乗効果</p>
                        <p className="text-xs text-text-muted">{selectedSupplement.synergy || '特になし'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Shield size={16} className="text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white mb-1">注意事項・禁忌</p>
                        <p className="text-xs text-text-muted">{selectedSupplement.contraindication || '特になし'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => {
                      removeSupplement(selectedSupplement.id);
                      setSelectedSupplement(null);
                    }}
                    className="flex-1 py-4 bg-surface-alt text-text-muted font-black uppercase tracking-widest rounded-xl hover:bg-surface-high transition-colors"
                  >
                    削除
                  </button>
                  <button 
                    onClick={() => setSelectedSupplement(null)}
                    className="flex-[2] py-4 bg-accent text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-t-[32px] sm:rounded-[32px] p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">サプリメントを追加</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">名前</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-alt border border-border rounded-xl p-4 text-white outline-none focus:border-accent"
                    placeholder="例: クレアチン"
                    value={newSupp.name}
                    onChange={(e) => setNewSupp({ ...newSupp, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">用量 (g/mg)</label>
                    <input 
                      type="number" 
                      className="w-full bg-surface-alt border border-border rounded-xl p-4 text-white outline-none focus:border-accent"
                      placeholder="5"
                      value={newSupp.dose_g || ''}
                      onChange={(e) => setNewSupp({ ...newSupp, dose_g: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">在庫日数</label>
                    <input 
                      type="number" 
                      className="w-full bg-surface-alt border border-border rounded-xl p-4 text-white outline-none focus:border-accent"
                      placeholder="30"
                      value={newSupp.stock_days_remaining || ''}
                      onChange={(e) => setNewSupp({ ...newSupp, stock_days_remaining: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">タイミング</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-alt border border-border rounded-xl p-4 text-white outline-none focus:border-accent"
                    placeholder="例: トレ後"
                    value={newSupp.timing}
                    onChange={(e) => setNewSupp({ ...newSupp, timing: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">エビデンスレベル</label>
                  <div className="flex gap-2">
                    {['A', 'B', 'C'].map(level => (
                      <button 
                        key={level}
                        onClick={() => setNewSupp({ ...newSupp, evidence_level: level as any })}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold transition-all",
                          newSupp.evidence_level === level ? "bg-accent text-black" : "bg-surface-alt text-text-muted border border-border"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAdd}
                  className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest rounded-xl mt-4 hover:scale-[1.02] transition-all"
                >
                  追加する
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
