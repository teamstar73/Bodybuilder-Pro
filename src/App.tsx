/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import FoodLogScreen from './screens/FoodLogScreen';
import PeakingScreen from './screens/PeakingScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Home, Utensils, Timer, BarChart2, Menu, Settings, User as UserIcon, X, Trash2, LogOut, ChevronRight, LogIn } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth, loginWithGoogle, logout as firebaseLogout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const { user, userId, setUserId, syncWithFirebase, resetData } = useAppStore();
  const [activeTab, setActiveTab] = useState<'home' | 'log' | 'peaking' | 'progress' | 'profile' | 'settings'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
      } else {
        setUserId(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, [setUserId]);

  useEffect(() => {
    if (userId) {
      const unsubSync = syncWithFirebase(userId);
      return () => unsubSync();
    }
  }, [userId, syncWithFirebase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-amber-500 italic">BODYBUILDER PRO</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">The Ultimate Physique Management System</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={loginWithGoogle}
            className="w-full h-16 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors"
          >
            <LogIn size={24} />
            GOOGLEでログイン
          </button>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">
            ログインすることで、すべてのデータがクラウドに保存され、複数のデバイスで同期されます。
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <OnboardingScreen />;
  }

  const handleReset = () => {
    if (window.confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) {
      resetData();
      setIsSidebarOpen(false);
      setActiveTab('home');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <DashboardScreen />;
      case 'log': return <FoodLogScreen />;
      case 'peaking': return <PeakingScreen />;
      case 'progress': return <ProgressScreen />;
      case 'profile': return <ProfileScreen />;
      case 'settings': return <SettingsScreen onNavigate={navigateTo} />;
    }
  };

  const navigateTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      firebaseLogout();
      resetData();
      setIsSidebarOpen(false);
      setActiveTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-amber-500/30">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-zinc-950 border-r border-zinc-800 z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                <h2 className="font-black text-amber-500 tracking-tighter text-xl">MENU</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button 
                  onClick={() => navigateTo('profile')}
                  className="w-full px-2 py-4 mb-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:bg-zinc-900 transition-all text-left"
                >
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500 p-0.5 overflow-hidden">
                      <img 
                        src="https://picsum.photos/seed/user/100/100" 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{user.phase}</div>
                    </div>
                  </div>
                </button>

                <SidebarItem 
                  icon={<UserIcon size={20} />} 
                  label="プロフィール設定" 
                  onClick={() => navigateTo('profile')} 
                  active={activeTab === 'profile'}
                />
                <SidebarItem 
                  icon={<Settings size={20} />} 
                  label="アプリ設定" 
                  onClick={() => navigateTo('settings')} 
                  active={activeTab === 'settings'}
                />
                
                <div className="pt-4 mt-4 border-t border-zinc-900">
                  <SidebarItem 
                    icon={<LogOut size={20} />} 
                    label="ログアウト" 
                    onClick={handleLogout}
                    variant="danger"
                  />
                  <SidebarItem 
                    icon={<Trash2 size={20} />} 
                    label="データを初期化" 
                    onClick={handleReset}
                    variant="danger"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-zinc-900">
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] text-center">
                  BodyBuilder Pro v1.0
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-amber-500 active:scale-90 transition-transform">
            <Menu size={24} />
          </button>
          <h1 className="font-headline text-xl font-black tracking-tighter text-amber-500">BODYBUILDER PRO</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full border-2 border-amber-500 p-0.5 overflow-hidden active:scale-95 transition-transform"
          >
            <img 
              src="https://picsum.photos/seed/user/100/100" 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-zinc-800 flex justify-around items-center h-20 pb-safe z-50">
        <NavItem 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<Home size={24} />} 
          label="Home" 
        />
        <NavItem 
          active={activeTab === 'log'} 
          onClick={() => setActiveTab('log')} 
          icon={<Utensils size={24} />} 
          label="Log" 
        />
        <NavItem 
          active={activeTab === 'peaking'} 
          onClick={() => setActiveTab('peaking')} 
          icon={<Timer size={24} />} 
          label="Peaking" 
        />
        <NavItem 
          active={activeTab === 'progress'} 
          onClick={() => setActiveTab('progress')} 
          icon={<BarChart2 size={24} />} 
          label="Progress" 
        />
      </nav>
    </div>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  onClick, 
  variant = 'default',
  active = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  variant?: 'default' | 'danger';
  active?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl transition-all active:scale-[0.98]",
        variant === 'danger' ? "text-rose-500 hover:bg-rose-500/10" : 
        active ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight size={16} className={cn("opacity-30", active && "opacity-100")} />
    </button>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all active:scale-90",
        active ? "text-amber-500 bg-amber-500/10" : "text-zinc-500"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{label}</span>
    </button>
  );
}
