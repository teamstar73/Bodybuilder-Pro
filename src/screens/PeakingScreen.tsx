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
        <div className="w-20 h-20 rounded-full bg-surface-alt border border-border flex items-center justify-center">
          <Trophy size={40} className="text-accent" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight">大会日程が未設定です</h2>
          <p className="text-text-muted text-sm max-w-xs">大会日を設定して、ピーキングプロトコルを開始しましょう。</p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <input 
            type="date" 
            className="w-full bg-surface border border-border rounded-xl p-4 text-white outline-none focus:border-accent"
            onChange={(e) => updateUser({ competition_date: e.target.value })}
          />
          <p className="text-[10px] text-text-faint font-bold uppercase tracking-widest">日付を選択するとプロトコルが生成されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Countdown Hero */}
      <section className="bg-surface border border-border rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-4 right-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">Countdown</div>
        <div className="text-[8rem] font-black leading-none text-accent tracking-tighter tabular-nums">
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
                className="bg-surface-alt border border-accent rounded px-2 py-1 text-sm font-black uppercase outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight">{user.competition_name || 'All Japan Championships'}</h2>
              <Edit3 size={12} className="text-text-faint group-hover:text-accent transition-colors" />
            </div>
          )}
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">
            {currentDayOffset === 0 ? 'Competition Day' : `Peak Week Day ${7 + currentDayOffset}`}
          </p>
        </div>
        
        <div className="w-full mt-8 bg-surface-alt border-l-4 border-accent p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Active Phase</div>
            <div className="font-bold text-sm text-text">
              {todayProtocol?.label || '調整中'}
            </div>
          </div>
          <Bolt className="text-accent" size={20} />
        </div>
      </section>

      {/* Today's Protocol */}
      <div className="grid grid-cols-3 gap-4">
        <ProtocolCard label="Carbs" value={todayProtocol?.carbs_g_per_kg ? Math.round(todayProtocol.carbs_g_per_kg * user.weight_kg) : 0} unit="G" icon={<Utensils size={14}/>} color="border-accent-light" />
        <ProtocolCard label="Water" value={todayProtocol?.water_ml ? todayProtocol.water_ml / 1000 : 0} unit="L" icon={<Droplets size={14}/>} color="border-accent" />
        <ProtocolCard label="Sodium" value={3} unit="G" icon={<FlaskConical size={14}/>} color="border-accent-dark" />
      </div>

      {/* Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Peaking Timeline</h3>
          <span className="text-[10px] font-bold text-text-faint">7 Days Out</span>
        </div>
        <div className="space-y-2">
          {peakingProtocol.map((day) => (
            <div 
              key={day.day_offset}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                day.day_offset === currentDayOffset 
                  ? "bg-surface-alt border-accent ring-1 ring-accent/20" 
                  : "bg-surface border border-border opacity-60"
              )}
            >
              <div className={cn("w-10 text-center font-black text-sm", day.day_offset === currentDayOffset ? "text-accent" : "text-text-faint")}>
                D{day.day_offset === 0 ? '±0' : day.day_offset}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                    day.carbs_g_per_kg < 1 ? "bg-accent-dark/10 text-accent-dark border border-accent-dark/20" : 
                    day.carbs_g_per_kg > 5 ? "bg-accent-light/10 text-accent-light border border-accent-light/20" : "bg-accent/10 text-accent border border-accent/20"
                  )}>
                    {day.carbs_g_per_kg < 1 ? '低' : day.carbs_g_per_kg > 5 ? '高' : '中'}
                  </span>
                  <div className="flex gap-0.5">
                    {[1,2,3].map(i => (
                      <Droplets key={i} size={10} className={cn(i <= (day.water_ml / 1500) ? "text-accent" : "text-surface-high")} />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => markDayComplete(day.day_offset)}
                  className={cn("transition-all", day.completed ? "text-accent" : "text-text-faint")}
                >
                  {day.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-accent/20 bg-surface-alt">
            <div className="w-10 text-center font-black text-sm text-accent">SHOW</div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest">{user.competition_name || 'Grand Finals'}</div>
                <div className="text-[9px] font-bold text-accent uppercase opacity-60">Peak Conditioning Achieved</div>
              </div>
              <Trophy className="text-accent" size={24} />
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={() => window.location.hash = '#progress'}
        className="w-full bg-accent text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-accent/10"
      >
        <Edit3 size={18} /> UPDATE TODAY'S MEASUREMENTS
      </button>
    </div>
  );
}

function ProtocolCard({ label, value, unit, icon, color }: { label: string; value: number; unit: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={cn("bg-surface border-l-2 p-4 rounded-xl", color)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
        <span className="text-text-faint">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums">{value}</span>
        <span className="text-[10px] font-bold text-text-muted">{unit}</span>
      </div>
    </div>
  );
}
