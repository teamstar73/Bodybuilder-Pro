import { COMMON_FOODS } from '../data/commonFoods';
import { Micronutrients } from '../types';

export interface FoodItem {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  source: 'preset' | 'openfoodfacts' | 'edamam';
  brand?: string;
  micronutrients?: Micronutrients;
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const results: FoodItem[] = [];

  // Step 1: Preset matching (immediate)
  const presetMatches = COMMON_FOODS.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) || 
    query.toLowerCase().includes(f.name.toLowerCase().slice(0, 2))
  ).map(f => ({
    name: f.name,
    cal: f.cal,
    p: f.p,
    c: f.c,
    f: f.f,
    source: 'preset' as const,
    micronutrients: f.micronutrients
  }));
  results.push(...presetMatches);

  // Step 2: Open Food Facts (via proxy)
  const offPromise = async () => {
    try {
      const res = await fetch(`/api/food/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.products || [])
        .filter((p: any) => p.nutriments?.['energy-kcal_100g'] > 0)
        .map((p: any) => ({
          name: p.product_name_ja || p.product_name || '不明',
          brand: p.brands,
          cal: Math.round(p.nutriments['energy-kcal_100g'] || 0),
          p: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
          c: Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
          f: Math.round((p.nutriments['fat_100g'] || 0) * 10) / 10,
          source: 'openfoodfacts' as const,
          micronutrients: {
            vitamin_d_iu: p.nutriments?.['vitamin-d_value'] || 0,
            magnesium_mg: p.nutriments?.['magnesium_value'] || 0,
            zinc_mg: p.nutriments?.['zinc_value'] || 0,
            iron_mg: p.nutriments?.['iron_value'] || 0,
            calcium_mg: p.nutriments?.['calcium_value'] || 0,
            potassium_mg: p.nutriments?.['potassium_value'] || 0,
            vitamin_b12_ug: p.nutriments?.['vitamin-b12_value'] || 0,
            vitamin_c_mg: p.nutriments?.['vitamin-c_value'] || 0,
            omega3_mg: p.nutriments?.['omega-3-fat_value'] || 0,
          }
        }));
    } catch (e) {
      console.error('OpenFoodFacts search failed:', e);
      return [];
    }
  };

  // Step 3: Edamam (via proxy)
  const edamamPromise = async () => {
    try {
      const res = await fetch(`/api/food/edamam?query=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.hints || []).map((hint: any) => {
        const food = hint.food;
        return {
          name: food.label,
          brand: food.brand,
          cal: Math.round(food.nutrients.ENERC_KCAL || 0),
          p: Math.round((food.nutrients.PROCNT || 0) * 10) / 10,
          c: Math.round((food.nutrients.CHOCDF || 0) * 10) / 10,
          f: Math.round((food.nutrients.FAT || 0) * 10) / 10,
          source: 'edamam' as const,
          // Edamam free tier doesn't provide full micros in parser, usually just main ones
          micronutrients: {
            magnesium_mg: food.nutrients.MG || 0,
            zinc_mg: food.nutrients.ZN || 0,
            iron_mg: food.nutrients.FE || 0,
            calcium_mg: food.nutrients.CA || 0,
            potassium_mg: food.nutrients.K || 0,
            vitamin_c_mg: food.nutrients.VITC || 0,
          }
        };
      });
    } catch (e) {
      console.error('Edamam search failed:', e);
      return [];
    }
  };

  // Run API searches in parallel
  const [offResults, edamamResults] = await Promise.all([offPromise(), edamamPromise()]);
  results.push(...offResults, ...edamamResults);

  // Deduplicate by name
  const seen = new Set<string>();
  return results.filter(item => {
    const key = item.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 30);
}
