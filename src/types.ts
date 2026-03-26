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
  allergies: string[];
  competition_date?: string;
  fasting_window?: string; // e.g. "16:8"
}

export interface FoodEntry {
  id: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  amount_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Measurement {
  id: number;
  date: string;
  weight_kg: number;
  body_fat_pct?: number;
  muscle_mass_kg?: number;
  ffmi: number;
  notes?: string;
}

export interface Supplement {
  id: number;
  name: string;
  dose_g: number;
  timing: string;
  frequency: string;
  evidence_level: 'A' | 'B' | 'C';
  stock_days_remaining: number;
  is_active: boolean;
  taken_dates: string[]; // ISO dates
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
