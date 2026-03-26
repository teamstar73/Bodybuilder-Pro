/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Scale, Droplets, Dumbbell, TrendingDown, TrendingUp, Camera, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProgressScreen() {
  const { user, measurements } = useAppStore();

  // Mock data for charts
  const weightData = [
    { date: 'Oct 15', weight: 93.5 },
    { date: 'Oct 22', weight: 93.8 },
    { date: 'Oct 29', weight: 94.2 },
    { date: 'Nov 05', weight: 94.5 },
    { date: 'Today', weight: 94.2 },
  ];

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
        <MetricCard label="FFMI / LEAN MASS" value={24.1} unit="INDEX" icon={<Dumbbell size={14}/>} delta="+0.15" deltaType="up" period="LBM ACCRETION" />
      </div>

      {/* Weight Chart */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-amber-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Weight Log Analysis</h3>
          </div>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
            <button className="px-3 py-1 text-[10px] font-bold bg-amber-500 text-black rounded transition-all">30D</button>
            <button className="px-3 py-1 text-[10px] font-bold text-zinc-500 hover:text-white transition-all">90D</button>
          </div>
        </div>
        <div className="p-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
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
          <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Target: 7.5%</span>
        </div>
        <div className="p-6 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
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
          <button className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:underline">
            <Camera size={14} /> Add Entry
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] rounded-xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
            <img 
              src="https://picsum.photos/seed/bodybuilder1/600/800" 
              alt="Baseline" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-[10px] font-black uppercase text-zinc-400">Baselines</div>
              <div className="text-sm font-bold">SEPT 12, 2023</div>
            </div>
          </div>
          <div className="aspect-[3/4] rounded-xl bg-zinc-900 border border-amber-500/30 relative overflow-hidden group">
            <img 
              src="https://picsum.photos/seed/bodybuilder2/600/800" 
              alt="Current" 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 bg-amber-500 text-black text-[9px] font-black px-2 py-1 rounded uppercase">Current</div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent border-b-2 border-amber-500">
              <div className="text-[10px] font-black uppercase text-amber-500">Latest Update</div>
              <div className="text-sm font-bold">TODAY, NOV 14</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Markers */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Clinical Markers (30D Avg)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-zinc-400">Avg. Daily Intake</span>
            <span className="text-sm font-bold text-teal-500">3,142 kcal</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full bg-amber-500" style={{ width: '65%' }} />
            <div className="h-full bg-teal-500" style={{ width: '25%' }} />
            <div className="h-full bg-rose-500" style={{ width: '10%' }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-600">
            <span>PRO: 250G</span>
            <span>CHO: 380G</span>
            <span>FAT: 65G</span>
          </div>
        </div>
      </section>
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
