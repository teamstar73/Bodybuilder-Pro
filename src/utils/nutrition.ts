/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, MacroTarget, PeakDay } from '../types';

/**
 * Mifflin-St Jeor Equation
 */
export const calculateBMR = (user: User): number => {
  const { weight_kg, height_cm, age, sex } = user;
  if (sex === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
};

export const calculateTDEE = (user: User): number => {
  const bmr = calculateBMR(user);
  return bmr * user.activity_factor;
};

export const calculateTargetMacros = (user: User): MacroTarget => {
  const tdee = calculateTDEE(user);
  let adjustedCalories = tdee;

  // Phase Adjustments
  switch (user.phase) {
    case 'bulk':
      adjustedCalories = tdee + 500; // Standard bulk
      break;
    case 'lean-bulk':
      adjustedCalories = tdee + 250; // Lean bulk (muscle focus, minimal fat)
      break;
    case 'cut':
      adjustedCalories = tdee - 500; // Aggressive cut
      break;
    case 'peak':
      adjustedCalories = tdee - 200; // Competition prep
      break;
    case 'maintain':
      adjustedCalories = tdee;
      break;
  }

  // Diet Type Adjustments
  let protein_g = user.weight_kg * 2.2;
  let fatRatio = 0.25;

  if (user.diet_type === 'keto') {
    fatRatio = 0.70;
    protein_g = user.weight_kg * 1.8; // Slightly lower for keto
  } else if (user.diet_type === 'low-carb') {
    fatRatio = 0.40;
  } else if (user.diet_type === 'plant-based') {
    protein_g = user.weight_kg * 2.4; // Higher protein for plant sources
  }

  if (user.phase === 'peak') {
    fatRatio = 0.15; // Shredded focus
  }

  const proteinCalories = protein_g * 4;
  const fatCalories = adjustedCalories * fatRatio;
  const fat_g = fatCalories / 9;

  // Carbs fill the rest
  const remainingCalories = adjustedCalories - (proteinCalories + fatCalories);
  const carbs_g = Math.max(0, remainingCalories / 4);

  return {
    calories: Math.round(adjustedCalories),
    protein_g: Math.round(protein_g),
    carbs_g: Math.round(carbs_g),
    fat_g: Math.round(fat_g),
  };
};

export interface Recommendation {
  meals: string[];
  supplements: string[];
  tips: string[];
}

export const getPersonalizedRecommendations = (user: User): Recommendation => {
  const recs: Recommendation = {
    meals: [],
    supplements: ['マルチビタミン', 'オメガ3'],
    tips: []
  };

  // Supplement recommendations
  if (user.phase === 'bulk' || user.phase === 'lean-bulk') {
    recs.supplements.push('クレアチン (5g/day)', 'ホエイプロテイン');
    recs.tips.push('トレーニング後の糖質摂取を忘れずに。');
  }
  if (user.phase === 'cut') {
    recs.supplements.push('BCAA/EAA', 'カフェイン (プレワークアウト)');
    recs.tips.push('空腹時は炭酸水や食物繊維で紛らわせましょう。');
  }
  if (user.training_experience === 'advanced') {
    recs.supplements.push('ベータアラニン', 'シトルリンマレート');
  }

  // Meal recommendations
  if (user.diet_type === 'plant-based') {
    recs.meals = ['大豆ミートのボロネーゼ', '豆腐ステーキ', 'レンズ豆のスープ', 'ナッツ類'];
    recs.tips.push('ビタミンB12のサプリメントを検討してください。');
  } else if (user.diet_type === 'keto') {
    recs.meals = ['サーモングリル', 'アボカドサラダ', '卵料理', 'MCTオイル'];
  } else {
    recs.meals = ['鶏胸肉のグリル', '玄米', 'ブロッコリー', '白身魚'];
  }

  if (user.diet_type === 'fasting') {
    recs.tips.push(`${user.fasting_window || '16:8'} の窓を守り、水分補給を徹底してください。`);
  }

  if (user.diet_type === 'carb-cycling') {
    recs.tips.push('トレーニング日は高炭水化物、休養日は低炭水化物に設定してください。');
  }

  return recs;
};

export const calculateFFMI = (weight_kg: number, height_cm: number, body_fat_pct: number): { ffmi: number; normalized: number } => {
  const height_m = height_cm / 100;
  const lean_mass_kg = weight_kg * (1 - body_fat_pct / 100);
  const ffmi = lean_mass_kg / (height_m * height_m);
  const normalized = ffmi + 6.1 * (1.8 - height_m);
  return { ffmi, normalized };
};

export const generatePeakingProtocol = (competitionDate: string, weight_kg: number): PeakDay[] => {
  const protocol: Omit<PeakDay, 'completed'>[] = [
    { day_offset: -7, label: "グリコーゲン枯渇開始", carbs_g_per_kg: 0.5, water_ml: 4000, sodium_note: "通常", notes: "高強度トレーニング推奨" },
    { day_offset: -6, label: "カリウム増量（バナナ等）", carbs_g_per_kg: 0.5, water_ml: 4500, sodium_note: "通常", notes: "塩分は控えめに" },
    { day_offset: -5, label: "引き続き枯渇フェーズ", carbs_g_per_kg: 0.5, water_ml: 4500, sodium_note: "通常", notes: "ポージング練習を増やす" },
    { day_offset: -4, label: "カーボローディング開始", carbs_g_per_kg: 7, water_ml: 5000, sodium_note: "通常", notes: "クリーンな炭水化物を摂取" },
    { day_offset: -3, label: "ローディング継続", carbs_g_per_kg: 7, water_ml: 5000, sodium_note: "通常", notes: "筋肉の張りをチェック" },
    { day_offset: -2, label: "水抜き開始、塩分制限", carbs_g_per_kg: 3.5, water_ml: 3500, sodium_note: "制限開始", notes: "塩分を半分にカット" },
    { day_offset: -1, label: "最終調整、塩分最小", carbs_g_per_kg: 2.5, water_ml: 1000, sodium_note: "最小", notes: "水分は一口ずつ" },
    { day_offset: 0, label: "会場ポンピング", carbs_g_per_kg: 1, water_ml: 500, sodium_note: "調整", notes: "パンプアップ前に少量の糖質" },
  ];

  return protocol.map(p => ({ ...p, completed: false }));
};
