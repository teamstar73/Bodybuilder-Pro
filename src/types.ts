/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserPhase = 'bulk' | 'lean-bulk' | 'cut' | 'peak' | 'maintain';
export type DietType = 'standard' | 'plant-based' | 'keto' | 'low-carb' | 'carb-cycling' | 'fasting';
export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id?: number;
  name: string;
  email: string;
  sex: 'male' | 'female';
  age: number;
  height_cm: number;
  weight_kg: number;
  body_fat_pct?: number;
  activity_factor: number;
  phase: UserPhase;
  diet_type: DietType;
  training_experience: TrainingExperience;
  goal_weight_kg?: number;
  goal_body_fat_pct?: number;
  allergies: string[];
  competition_date?: string;
  competition_name?: string;
  notifications_enabled?: boolean;
  fasting_window?: string; // e.g. "16:8"
}

export interface Micronutrients {
  vitamin_d_iu?: number;
  magnesium_mg?: number;
  zinc_mg?: number;
  iron_mg?: number;
  calcium_mg?: number;
  potassium_mg?: number;
  vitamin_b12_ug?: number;
  vitamin_c_mg?: number;
  omega3_mg?: number;
}

export interface FoodEntry {
  id: string | number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  amount_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  micronutrients?: Micronutrients;
  // Legacy fields (optional for backward compatibility)
  vitamin_d_ug?: number;
  magnesium_mg?: number;
  zinc_mg?: number;
  iron_mg?: number;
  calcium_mg?: number;
  potassium_mg?: number;
  vitamin_b12_ug?: number;
  vitamin_c_mg?: number;
  omega_3_mg?: number;
}

export interface Measurement {
  id: string | number;
  date: string;
  weight_kg: number;
  body_fat_pct?: number;
  muscle_mass_kg?: number;
  ffmi: number;
  notes?: string;
}

export interface FrequentFood {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  count: number;
  micronutrients?: Micronutrients;
}

export interface Supplement {
  id: string | number;
  name: string;
  dose_g: number;
  upper_dose_g?: number;
  timing: string;
  evidence_level: 'A' | 'B' | 'C';
  category?: string;
  mechanism?: string;
  synergy?: string;
  contraindication?: string;
  stock_days_remaining: number;
  is_active: boolean;
  taken_dates: string[]; // ISO dates (YYYY-MM-DD)
}

export interface PeakDay {
  day_offset: number;
  label: string;
  carbs_g_per_kg: number;
  water_ml: number;
  sodium_note: string;
  notes: string;
  completed: boolean;
}

export interface MacroTarget {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface VisualLogEntry {
  id: string | number;
  date: string;
  image_url: string;
  label?: string;
  notes?: string;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface Friend {
  id: string;
  uid: string;
  name: string;
  photoUrl?: string;
  addedAt: string;
}
