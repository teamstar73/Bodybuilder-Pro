/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, FoodEntry, Measurement, Supplement, PeakDay, MacroTarget, VisualLogEntry, Friend, FriendRequest, FrequentFood } from '../types';
import { SUPPLEMENT_PRESETS } from '../data/supplements';
import { calculateTDEE, calculateTargetMacros, generatePeakingProtocol, getPersonalizedRecommendations, getRecommendedSupplements } from '../utils/nutrition';
import { db, auth } from '../firebase';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, onSnapshot, query, where, getDocFromServer, getDocs } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppStore {
  user: User | null;
  userId: string | null;
  setUserId: (id: string | null) => void;
  setUser: (u: User) => Promise<void>;
  updateUser: (u: Partial<User>) => Promise<void>;
  
  foodLog: FoodEntry[];
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => Promise<void>;
  removeFoodEntry: (id: string | number) => Promise<void>;
  
  measurements: Measurement[];
  addMeasurement: (m: Omit<Measurement, 'id'>) => Promise<void>;
  removeMeasurement: (id: string | number) => Promise<void>;
  
  visualLog: VisualLogEntry[];
  addVisualLogEntry: (entry: Omit<VisualLogEntry, 'id'>) => Promise<void>;
  removeVisualLogEntry: (id: string | number) => Promise<void>;
  
  friends: Friend[];
  friendRequests: FriendRequest[];
  sendFriendRequest: (toUserId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (email: string) => Promise<{uid: string, name: string}[]>;
  
  waterIntake: number;
  addWater: (amount: number) => Promise<void>;
  getWaterTarget: () => number;
  getTodayWaterIntakeRate: () => number;
  
  frequentFoods: FrequentFood[];
  trackFrequentFood: (food: Omit<FrequentFood, 'count'>) => void;
  
  supplements: Supplement[];
  setSupplements: (s: Supplement[]) => Promise<void>;
  addSupplement: (s: Omit<Supplement, 'id'>) => Promise<void>;
  updateSupplement: (id: string | number, updates: Partial<Supplement>) => Promise<void>;
  removeSupplement: (id: string | number) => Promise<void>;
  toggleSupplementTaken: (id: string | number, date: string) => Promise<void>;
  
  peakingProtocol: PeakDay[];
  setPeakingProtocol: (p: PeakDay[]) => void;
  markDayComplete: (dayOffset: number) => void;
  
  // Computed
  getTodayLog: () => FoodEntry[];
  getTodayMacros: () => { calories: number; protein: number; carbs: number; fat: number };
  getTDEE: () => number;
  getTargetMacros: () => MacroTarget;
  getDaysToCompetition: () => number | null;
  get30DayAvgCalories: () => number;
  getTodaySupplementIntakeRate: () => number;
  resetData: () => void;
  
  // Firebase Sync
  syncWithFirebase: (userId: string) => () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      userId: null,
      setUserId: (userId) => set({ userId }),
      resetData: () => {
        set({
          user: null,
          userId: null,
          foodLog: [],
          measurements: [],
          supplements: [],
          peakingProtocol: [],
          frequentFoods: [],
        });
      },
      setUser: async (user) => {
        const userId = get().userId;
        if (userId) {
          try {
            await setDoc(doc(db, 'users', userId), user);
            
            // Initialize supplements based on recommendations if empty
            const existingSupps = get().supplements;
            if (existingSupps.length === 0) {
              const recNames = getRecommendedSupplements(user.phase);
              const initialSupps = SUPPLEMENT_PRESETS
                .filter(p => recNames.includes(p.name))
                .map((p, i) => ({ ...p, id: (i + 1).toString() }));
              
              for (const s of initialSupps) {
                await setDoc(doc(db, 'users', userId, 'supplements', s.id.toString()), s);
              }
              set({ supplements: initialSupps as Supplement[] });
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
          }
        }
        set({ user });

        if (user.competition_date) {
          const protocol = generatePeakingProtocol(user.competition_date, user.weight_kg);
          set({ peakingProtocol: protocol });
        }
      },
      updateUser: async (updates) => {
        const currentUser = get().user;
        const userId = get().userId;
        if (!currentUser || !userId) return;
        
        const updatedUser = { ...currentUser, ...updates };
        try {
          // Use setDoc with merge: true instead of updateDoc to prevent "No document to update" errors
          await setDoc(doc(db, 'users', userId), updates, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
        }
        set({ user: updatedUser });

        // If phase or weight changed, we might need to update peaking protocol
        if (updates.competition_date || updates.weight_kg) {
          if (updatedUser.competition_date) {
            const protocol = generatePeakingProtocol(updatedUser.competition_date, updatedUser.weight_kg);
            set({ peakingProtocol: protocol });
          }
        }
      },
      
      foodLog: [],
      addFoodEntry: async (entry) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await addDoc(collection(db, 'users', userId, 'foodLog'), entry);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userId}/foodLog`);
        }
        // State will be updated by onSnapshot
      },
      removeFoodEntry: async (id) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await deleteDoc(doc(db, 'users', userId, 'foodLog', id.toString()));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${userId}/foodLog/${id}`);
        }
      },
      
      measurements: [],
      addMeasurement: async (m) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await addDoc(collection(db, 'users', userId, 'measurements'), m);
          // Also update the user's current weight and body fat
          await setDoc(doc(db, 'users', userId), { 
            weight_kg: m.weight_kg, 
            body_fat_pct: m.body_fat_pct 
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userId}/measurements`);
        }
      },
      removeMeasurement: async (id) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await deleteDoc(doc(db, 'users', userId, 'measurements', id.toString()));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${userId}/measurements/${id}`);
        }
      },
      
      visualLog: [],
      addVisualLogEntry: async (entry) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await addDoc(collection(db, 'users', userId, 'visualLog'), entry);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userId}/visualLog`);
        }
      },
      removeVisualLogEntry: async (id) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await deleteDoc(doc(db, 'users', userId, 'visualLog', id.toString()));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${userId}/visualLog/${id}`);
        }
      },
      
      friends: [],
      friendRequests: [],
      sendFriendRequest: async (toUserId) => {
        const { userId, user } = get();
        if (!userId || !user) return;
        try {
          await addDoc(collection(db, 'friendRequests'), {
            fromId: userId,
            fromName: user.name,
            toId: toUserId,
            status: 'pending',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'friendRequests');
        }
      },
      acceptFriendRequest: async (requestId) => {
        const { userId, user, friendRequests } = get();
        if (!userId || !user) return;
        const request = friendRequests.find(r => r.id === requestId);
        if (!request) return;

        try {
          // Update request status
          await setDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' }, { merge: true });
          
          // Add to both users' friends subcollection
          const friendData = {
            uid: request.fromId,
            name: request.fromName,
            addedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', userId, 'friends', request.fromId), friendData);
          
          const myData = {
            uid: userId,
            name: user.name,
            addedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', request.fromId, 'friends', userId), myData);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${requestId}`);
        }
      },
      rejectFriendRequest: async (requestId) => {
        try {
          await setDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${requestId}`);
        }
      },
      removeFriend: async (friendId) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await deleteDoc(doc(db, 'users', userId, 'friends', friendId));
          await deleteDoc(doc(db, 'users', friendId, 'friends', userId));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${userId}/friends/${friendId}`);
        }
      },
      searchUsers: async (email) => {
        try {
          const q = query(collection(db, 'users'), where('email', '==', email));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ uid: doc.id, name: doc.data().name }));
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
          return [];
        }
      },
      
      waterIntake: 0,
      addWater: async (amount) => {
        const userId = get().userId;
        if (!userId) return;
        const today = new Date().toISOString().split('T')[0];
        const newTotal = Math.max(0, get().waterIntake + amount);
        try {
          // Use a subcollection for daily hydration to persist by date
          await setDoc(doc(db, 'users', userId, 'hydration', today), { 
            amount: newTotal,
            updatedAt: new Date().toISOString()
          });
          set({ waterIntake: newTotal });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/hydration/${today}`);
        }
      },
      
      frequentFoods: [],
      trackFrequentFood: (food) => {
        const current = get().frequentFoods || [];
        const existing = current.find(f => f.name === food.name);
        let updated;
        if (existing) {
          updated = current.map(f => f.name === food.name ? { ...f, count: f.count + 1 } : f);
        } else {
          updated = [...current, { ...food, count: 1 }];
        }
        set({ frequentFoods: updated.sort((a, b) => b.count - a.count) });
      },
      
      supplements: [],
      setSupplements: async (supplements) => {
        set({ supplements });
      },
      addSupplement: async (s) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await addDoc(collection(db, 'users', userId, 'supplements'), s);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userId}/supplements`);
        }
      },
      updateSupplement: async (id, updates) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await setDoc(doc(db, 'users', userId, 'supplements', id.toString()), updates, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/supplements/${id}`);
        }
      },
      removeSupplement: async (id) => {
        const userId = get().userId;
        if (!userId) return;
        try {
          await deleteDoc(doc(db, 'users', userId, 'supplements', id.toString()));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${userId}/supplements/${id}`);
        }
      },
      toggleSupplementTaken: async (id, date) => {
        const userId = get().userId;
        if (!userId) return;
        
        const s = get().supplements.find(s => s.id.toString() === id.toString());
        if (!s) return;
        
        const taken = s.taken_dates.includes(date);
        const newTakenDates = taken 
          ? s.taken_dates.filter(d => d !== date)
          : [...s.taken_dates, date];
          
        try {
          await setDoc(doc(db, 'users', userId, 'supplements', id.toString()), {
            taken_dates: newTakenDates
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/supplements/${id}`);
        }
      },

      syncWithFirebase: (userId) => {
        const unsubUser = onSnapshot(doc(db, 'users', userId), (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as any;
            set({ user: userData });
            if (userData.competition_date) {
              const protocol = generatePeakingProtocol(userData.competition_date, userData.weight_kg);
              set({ peakingProtocol: protocol });
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}`);
        });

        const today = new Date().toISOString().split('T')[0];
        const unsubHydration = onSnapshot(doc(db, 'users', userId, 'hydration', today), (doc) => {
          if (doc.exists()) {
            set({ waterIntake: doc.data()?.amount || 0 });
          } else {
            set({ waterIntake: 0 });
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/hydration/${today}`);
        });

        const unsubFood = onSnapshot(collection(db, 'users', userId, 'foodLog'), (snapshot) => {
          const foodLog = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
          set({ foodLog });
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/foodLog`);
        });

        const unsubMeasurements = onSnapshot(collection(db, 'users', userId, 'measurements'), (snapshot) => {
          const measurements = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
          set({ measurements });
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/measurements`);
        });

        const unsubSupplements = onSnapshot(collection(db, 'users', userId, 'supplements'), (snapshot) => {
          const supplements = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
          set({ supplements });
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/supplements`);
        });

        const unsubVisualLog = onSnapshot(collection(db, 'users', userId, 'visualLog'), (snapshot) => {
          const visualLog = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
          set({ visualLog });
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/visualLog`);
        });

        const unsubFriends = onSnapshot(collection(db, 'users', userId, 'friends'), (snapshot) => {
          const friends = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
          set({ friends });
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}/friends`);
        });

        const unsubFriendRequests = onSnapshot(
          query(collection(db, 'friendRequests'), where('toId', '==', userId), where('status', '==', 'pending')),
          (snapshot) => {
            const friendRequests = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
            set({ friendRequests });
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `friendRequests`);
          }
        );

        return () => {
          unsubUser();
          unsubHydration();
          unsubFood();
          unsubMeasurements();
          unsubSupplements();
          unsubVisualLog();
          unsubFriends();
          unsubFriendRequests();
        };
      },
      
      peakingProtocol: [],
      setPeakingProtocol: (peakingProtocol) => set({ peakingProtocol }),
      markDayComplete: (dayOffset) => set((state) => ({
        peakingProtocol: state.peakingProtocol.map(p => 
          p.day_offset === dayOffset ? { ...p, completed: !p.completed } : p
        )
      })),
      
      getTodayLog: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().foodLog.filter(e => e.date === today);
      },
      
      getTodayMacros: () => {
        const todayLog = get().getTodayLog();
        return todayLog.reduce((acc, curr) => ({
          calories: acc.calories + curr.calories,
          protein: acc.protein + curr.protein_g,
          carbs: acc.carbs + curr.carbs_g,
          fat: acc.fat + curr.fat_g,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      },
      
      getTDEE: () => {
        const { user } = get();
        return user ? calculateTDEE(user) : 0;
      },
      
      getTargetMacros: () => {
        const { user } = get();
        return user ? calculateTargetMacros(user) : { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
      },
      
      getDaysToCompetition: () => {
        const { user } = get();
        if (!user?.competition_date) return null;
        const comp = new Date(user.competition_date);
        const today = new Date();
        const diffTime = comp.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },
      get30DayAvgCalories: () => {
        const { foodLog } = get();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentLogs = foodLog.filter(e => new Date(e.date) >= thirtyDaysAgo);
        if (recentLogs.length === 0) return 0;
        
        // Group by date to find daily totals
        const dailyTotals: Record<string, number> = {};
        recentLogs.forEach(e => {
          dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.calories;
        });
        
        const totals = Object.values(dailyTotals);
        return totals.reduce((a, b) => a + b, 0) / totals.length;
      },
      getTodaySupplementIntakeRate: () => {
        const { supplements } = get();
        if (supplements.length === 0) return 0;
        const today = new Date().toISOString().split('T')[0];
        const takenCount = supplements.filter(s => s.taken_dates.includes(today)).length;
        return (takenCount / supplements.length) * 100;
      },
      getWaterTarget: () => {
        const { user } = get();
        if (!user?.weight_kg) return 2000; // Default 2L
        return Math.round(user.weight_kg * 35);
      },
      getTodayWaterIntakeRate: () => {
        const current = get().waterIntake;
        const target = get().getWaterTarget();
        return (current / target) * 100;
      }
    }),
    {
      name: 'bodybuilder-pro-storage',
    }
  )
);
