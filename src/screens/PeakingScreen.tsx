/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Trophy, Droplets, Utensils, FlaskConical, CheckCircle2, Circle, Edit3, Bolt } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PeakingScreen() {
  const { user, updateUser, peakingProtocol, markDayComplete, getDaysToCompetition } = useAppStore();
  const daysToComp = getDaysToCompetition();

  // Calculate today's protocol day based on the competition date
  const currentDayOffset = daysToComp !== null ? -daysToComp : 0;
  const todayProtocol = peakingProtocol.find(p => p.day_offset === currentDayOffset);

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState(user?.competition_name || 'All Japan Championships');

  const handleUpdateName = () => {
    updateUser({ competition_name: newName });
    setIsEditingName(false);
  };

  if (!user?.competition_date) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
          <Trophy size={40} className="text-zinc-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight">大会日程が未設定です</h2>
          <p className="text-zinc-500 text-sm max-w-xs">大会日を設定して、ピーキングプロトコルを開始しましょう。</p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <input 
            type="date" 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-amber-500"
            onChange={(e) => updateUser({ competition_date: e.target.value })}
          />
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">日付を選択するとプロトコルが生成されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Countdown Hero */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-4 right-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Countdown</div>
        <div className="text-[8rem] font-black leading-none text-amber-500 tracking-tighter tabular-nums">
          D-{daysToComp !== null ? Math.max(0, daysToComp) : '?'}
        </div>
        <div className="text-center mt-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                autoFocus
                className="bg-zinc-800 border border-amber-500 rounded px-2 py-1 text-sm font-black uppercase outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight">{user.competition_name || 'All Japan Championships'}</h2>
              <Edit3 size={12} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
            </div>
          )}
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
            {currentDayOffset === 0 ? 'Competition Day' : `Peak Week Day ${7 + currentDayOffset}`}
          </p>
        </div>
        
        <div className="w-full mt-8 bg-teal-500/10 border-l-4 border-teal-500 p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Active Phase</div>
            <div className="font-bold text-sm text-teal-500">
              {todayProtocol?.label || '調整中'}
            </div>
          </div>
          <Bolt className="text-teal-500" size={20} />
        </div>
      </section>

      {/* Today's Protocol */}
      <div className="grid grid-cols-3 gap-4">
        <ProtocolCard label="Carbs" value={todayProtocol?.carbs_g_per_kg ? Math.round(todayProtocol.carbs_g_per_kg * user.weight_kg) : 0} unit="G" icon={<Utensils size={14}/>} color="border-amber-500" />
        <ProtocolCard label="Water" value={todayProtocol?.water_ml ? todayProtocol.water_ml / 1000 : 0} unit="L" icon={<Droplets size={14}/>} color="border-teal-500" />
        <ProtocolCard label="Sodium" value={3} unit="G" icon={<FlaskConical size={14}/>} color="border-indigo-500" />
      </div>

      {/* Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Peaking Timeline</h3>
          <span className="text-[10px] font-bold text-zinc-700">7 Days Out</span>
        </div>
        <div className="space-y-2">
          {peakingProtocol.map((day) => (
            <div 
              key={day.day_offset}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                day.day_offset === currentDayOffset 
                  ? "bg-zinc-800 border-amber-500 ring-1 ring-amber-500/20" 
                  : "bg-zinc-900 border-zinc-800 opacity-60"
              )}
            >
              <div className={cn("w-10 text-center font-black text-sm", day.day_offset === currentDayOffset ? "text-amber-500" : "text-zinc-500")}>
                D{day.day_offset === 0 ? '±0' : day.day_offset}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                    day.carbs_g_per_kg < 1 ? "bg-rose-500/20 text-rose-500" : 
                    day.carbs_g_per_kg > 5 ? "bg-teal-500/20 text-teal-500" : "bg-amber-500/20 text-amber-500"
                  )}>
                    {day.carbs_g_per_kg < 1 ? '低' : day.carbs_g_per_kg > 5 ? '高' : '中'}
                  </span>
                  <div className="flex gap-0.5">
                    {[1,2,3].map(i => (
                      <Droplets key={i} size={10} className={cn(i <= (day.water_ml / 1500) ? "text-teal-500" : "text-zinc-800")} />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => markDayComplete(day.day_offset)}
                  className={cn("transition-all", day.completed ? "text-amber-500" : "text-zinc-700")}
                >
                  {day.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-amber-500/20 bg-amber-500/5">
            <div className="w-10 text-center font-black text-sm text-amber-500">SHOW</div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest">{user.competition_name || 'Grand Finals'}</div>
                <div className="text-[9px] font-bold text-amber-500/70 uppercase">Peak Conditioning Achieved</div>
              </div>
              <Trophy className="text-amber-500" size={24} />
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={() => window.location.hash = '#progress'}
        className="w-full bg-amber-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-amber-500/10"
      >
        <Edit3 size={18} /> UPDATE TODAY'S MEASUREMENTS
      </button>
    </div>
  );
}

function ProtocolCard({ label, value, unit, icon, color }: { label: string; value: number; unit: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={cn("bg-zinc-900 border-l-2 p-4 rounded-xl", color)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
        <span className="text-zinc-500">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums">{value}</span>
        <span className="text-[10px] font-bold text-zinc-500">{unit}</span>
      </div>
    </div>
  );
}
