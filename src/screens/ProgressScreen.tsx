/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Scale, Droplets, Dumbbell, TrendingDown, TrendingUp, Camera, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ProgressScreen() {
  const { user, measurements, addMeasurement, removeMeasurement, visualLog, addVisualLogEntry, removeVisualLogEntry, get30DayAvgCalories, getTodayMacros } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [modalType, setModalType] = useState<'measurement' | 'visual'>('measurement');
  const [newWeight, setNewWeight] = useState(user?.weight_kg?.toString() || '');
  const [newBodyFat, setNewBodyFat] = useState(user?.body_fat_pct?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  // Process measurements for charts
  const weightData = measurements
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      weight: m.weight_kg,
      bodyFat: m.body_fat_pct
    }));

  // Fallback if no measurements
  const displayData = weightData.length > 0 ? weightData : [
    { date: 'No Data', weight: user?.weight_kg || 0, bodyFat: user?.body_fat_pct || 0 }
  ];

  // Calculate FFMI
  const calculateFFMI = () => {
    if (!user?.weight_kg || !user?.height_cm) return 0;
    const heightM = user.height_cm / 100;
    const bf = user.body_fat_pct || 15; // Default to 15% if unknown
    const lbm = user.weight_kg * (1 - bf / 100);
    const ffmi = lbm / (heightM * heightM);
    return Math.round(ffmi * 10) / 10;
  };

  const handleAddMeasurement = async () => {
    if (!newWeight) return;
    setIsSaving(true);
    try {
      await addMeasurement({
        date: new Date().toISOString().split('T')[0],
        weight_kg: parseFloat(newWeight),
        body_fat_pct: newBodyFat ? parseFloat(newBodyFat) : undefined,
        ffmi: calculateFFMI()
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding measurement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVisualEntry = async () => {
    setIsSaving(true);
    try {
      // Simulate image upload with a random placeholder
      const randomId = Math.floor(Math.random() * 1000);
      await addVisualLogEntry({
        date: new Date().toISOString().split('T')[0],
        image_url: `https://picsum.photos/seed/progress${randomId}/600/800`,
        label: 'Progress Update'
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding visual log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const avgCalories = get30DayAvgCalories();
  const todayMacros = getTodayMacros();

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight">PROGRESS</h2>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Clinical View</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="体重 / WEIGHT" value={user?.weight_kg || 0} unit="KG" icon={<Scale size={14}/>} delta="-0.8 kg" deltaType="down" period="THIS WEEK" />
        <MetricCard label="体脂肪% / BODY FAT" value={user?.body_fat_pct || 0} unit="%" icon={<Droplets size={14}/>} delta="-0.2 %" deltaType="down" period="SINCE OCT 01" />
        <MetricCard label="FFMI / LEAN MASS" value={calculateFFMI()} unit="INDEX" icon={<Dumbbell size={14}/>} delta="+0.15" deltaType="up" period="LBM ACCRETION" />
      </div>

      {/* Weight Chart */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-amber-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Weight Log Analysis</h3>
          </div>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
            <button className="px-3 py-1 text-[10px] font-bold bg-amber-500 text-black rounded transition-all">ALL</button>
          </div>
        </div>
        <div className="p-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#525252' }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#525252' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px' }}
                itemStyle={{ color: '#F59E0B', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Composition Chart */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-teal-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Composition Variance</h3>
          </div>
          <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Target: {user?.goal_weight_kg || 0}kg</span>
        </div>
        <div className="p-6 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="weight" stroke="#14B8A6" fillOpacity={1} fill="url(#colorComp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Visual Log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest">Visual Log</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => { setModalType('measurement'); setIsModalOpen(true); }}
              className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:underline"
            >
              <Plus size={14} /> Weight
            </button>
            <button 
              onClick={() => { setModalType('visual'); setIsModalOpen(true); }}
              className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:underline"
            >
              <Camera size={14} /> Photo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {visualLog.length === 0 ? (
            <div className="col-span-2 py-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
              <Camera className="mx-auto text-zinc-700 mb-2" size={32} />
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">No photos logged yet</p>
            </div>
          ) : (
            visualLog.slice(-4).map((entry, i) => (
              <div key={entry.id} className="aspect-[3/4] rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
                <img 
                  src={entry.image_url} 
                  alt={entry.label} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => removeVisualLogEntry(entry.id)}
                    className="p-2 bg-black/50 backdrop-blur-md rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-[10px] font-black uppercase text-zinc-400">{entry.label}</div>
                  <div className="text-sm font-bold">{new Date(entry.date).toLocaleDateString('ja-JP')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* History Section */}
      <section className="space-y-4">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
        >
          {showHistory ? 'Hide History' : 'Show Full History'}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-800 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Measurement History</span>
                </div>
                <div className="divide-y divide-zinc-800">
                  {measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                    <div key={m.id} className="p-4 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold">{m.weight_kg} kg <span className="text-zinc-500 text-xs font-normal">/ {m.body_fat_pct}% BF</span></div>
                        <div className="text-[10px] text-zinc-500 uppercase">{new Date(m.date).toLocaleDateString('ja-JP')}</div>
                      </div>
                      <button 
                        onClick={() => removeMeasurement(m.id)}
                        className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {measurements.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">No history found</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Clinical Markers */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Clinical Markers (30D Avg)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-400">Avg. Daily Intake</span>
            <span className="text-sm font-bold text-teal-500">{Math.round(avgCalories).toLocaleString()} kcal</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full bg-amber-500" style={{ width: `${(todayMacros.protein * 4 / (todayMacros.calories || 1)) * 100}%` }} />
            <div className="h-full bg-teal-500" style={{ width: `${(todayMacros.carbs * 4 / (todayMacros.calories || 1)) * 100}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${(todayMacros.fat * 9 / (todayMacros.calories || 1)) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-600">
            <span>PRO: {todayMacros.protein}G</span>
            <span>CHO: {todayMacros.carbs}G</span>
            <span>FAT: {todayMacros.fat}G</span>
          </div>
        </div>
      </section>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {modalType === 'measurement' ? '体重を記録' : '写真を記録'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {modalType === 'measurement' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">体重 (KG)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-amber-500"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="85.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">体脂肪率 (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-amber-500"
                      value={newBodyFat}
                      onChange={(e) => setNewBodyFat(e.target.value)}
                      placeholder="12.0"
                    />
                  </div>
                  <button 
                    onClick={handleAddMeasurement}
                    disabled={isSaving || !newWeight || !newBodyFat}
                    className="w-full bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest disabled:opacity-50 mt-4"
                  >
                    {isSaving ? '保存中...' : '保存する'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={handleAddVisualEntry}
                    disabled={isSaving}
                    className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:border-amber-500 hover:text-amber-500 transition-all group"
                  >
                    <Camera size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Tap to Upload</p>
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center">※デモ版ではランダムな画像が保存されます</p>
                  <button 
                    onClick={handleAddVisualEntry}
                    disabled={isSaving}
                    className="w-full bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest disabled:opacity-50 mt-4"
                  >
                    {isSaving ? '保存中...' : '写真を保存'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, unit, icon, delta, deltaType, period }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <span className="text-zinc-700">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black tabular-nums">{value}</span>
        <span className="text-xs text-zinc-500 font-bold">{unit}</span>
      </div>
      <div className={cn("mt-4 flex items-center gap-1.5 text-xs font-bold", deltaType === 'down' ? "text-rose-500" : "text-teal-500")}>
        {deltaType === 'down' ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
        {delta}
        <span className="text-[10px] text-zinc-600 ml-1">{period}</span>
      </div>
    </div>
  );
}
