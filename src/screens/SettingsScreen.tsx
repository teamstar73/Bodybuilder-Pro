/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, Shield, Moon, Smartphone, Globe, Info, ChevronRight, Trash2, LogOut, User as UserIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { logout as firebaseLogout } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsScreen({ onNavigate }: { onNavigate: (tab: 'home' | 'log' | 'supplements' | 'peaking' | 'progress' | 'profile' | 'settings') => void }) {
  const { resetData, user, updateUser } = useAppStore();

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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

  const toggleNotifications = () => {
    updateUser({ notifications_enabled: !user?.notifications_enabled });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="py-4">
        <h2 className="text-2xl font-black uppercase tracking-tight">Settings</h2>
        <p className="text-text-muted text-xs">アプリの環境設定とデータ管理</p>
      </header>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">アカウント</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
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
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">一般設定</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <SettingsItem 
            icon={<Bell size={18} />} 
            label="通知設定" 
            value={user?.notifications_enabled ? "ON" : "OFF"}
            onClick={toggleNotifications} 
          />
          <SettingsItem 
            icon={<Shield size={18} />} 
            label="プライバシー" 
            onClick={() => setIsHelpModalOpen(true)} 
          />
          <SettingsItem 
            icon={<Moon size={18} />} 
            label="ダークモード" 
            value="ON" 
            onClick={() => {}} 
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">アプリ情報</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <SettingsItem icon={<Smartphone size={18} />} label="バージョン" value="1.0.0" />
          <SettingsItem icon={<Globe size={18} />} label="言語" value="日本語" />
          <SettingsItem 
            icon={<Info size={18} />} 
            label="ヘルプ & サポート" 
            onClick={() => setIsHelpModalOpen(true)} 
          />
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight">ヘルプ & サポート</h3>
                <button onClick={() => setIsHelpModalOpen(false)} className="text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 text-sm text-text-muted">
                <p>PeakPhysiqueをご利用いただきありがとうございます。</p>
                <p>使い方がわからない場合や不具合がある場合は、以下のサポート窓口までご連絡ください。</p>
                <div className="bg-surface-alt p-4 rounded-xl border border-border-light">
                  <div className="text-[10px] font-bold text-text-faint uppercase mb-1">Email Support</div>
                  <div className="text-white font-bold">support@peakphysique.app</div>
                </div>
                <button 
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-full bg-accent text-black font-black py-3 rounded-xl uppercase tracking-widest mt-4"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">危険な操作</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 text-text-muted hover:bg-surface-alt hover:text-text transition-all"
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
        "w-full flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-surface-high/50 transition-all",
        variant === 'danger' ? "text-text-muted" : "text-text"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(variant === 'danger' ? "text-text-muted" : "text-text-faint")}>
          {icon}
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-bold text-text-muted">{value}</span>}
        <ChevronRight size={16} className="text-text-faint" />
      </div>
    </button>
  );
}
