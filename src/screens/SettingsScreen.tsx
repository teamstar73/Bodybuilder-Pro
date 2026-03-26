/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, Shield, Moon, Smartphone, Globe, Info, ChevronRight, Trash2, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { logout as firebaseLogout } from '../firebase';

export default function SettingsScreen({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { resetData, user } = useAppStore();

  const handleReset = () => {
    if (window.confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) {
      resetData();
    }
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      firebaseLogout();
      resetData();
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="py-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">Settings</h2>
        <p className="text-zinc-500 text-xs">アプリの環境設定とデータ管理</p>
      </header>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">アカウント</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <SettingsItem 
            icon={<UserIcon size={18} />} 
            label="プロフィール編集" 
            onClick={() => onNavigate('profile')}
          />
          <SettingsItem 
            icon={<LogOut size={18} />} 
            label="ログアウト" 
            onClick={handleLogout}
            variant="danger"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">一般設定</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <SettingsItem icon={<Bell size={18} />} label="通知設定" onClick={() => alert('通知設定は現在開発中です')} />
          <SettingsItem icon={<Shield size={18} />} label="プライバシー" onClick={() => alert('プライバシー設定は現在開発中です')} />
          <SettingsItem icon={<Moon size={18} />} label="ダークモード" value="ON" onClick={() => alert('ダークモードは現在固定です')} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">アプリ情報</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <SettingsItem icon={<Smartphone size={18} />} label="バージョン" value="1.0.0" />
          <SettingsItem icon={<Globe size={18} />} label="言語" value="日本語" />
          <SettingsItem icon={<Info size={18} />} label="ヘルプ & サポート" onClick={() => alert('サポート窓口へお問い合わせください')} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest px-2">危険な操作</h3>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl overflow-hidden">
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={18} />
              <span className="text-sm font-bold">データを初期化</span>
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ 
  icon, 
  label, 
  value, 
  onClick, 
  variant = 'default' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string; 
  onClick?: () => void;
  variant?: 'default' | 'danger';
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-all",
        variant === 'danger' ? "text-rose-500" : "text-zinc-200"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(variant === 'danger' ? "text-rose-500" : "text-zinc-400")}>
          {icon}
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-bold text-zinc-500">{value}</span>}
        <ChevronRight size={16} className="text-zinc-600" />
      </div>
    </button>
  );
}
