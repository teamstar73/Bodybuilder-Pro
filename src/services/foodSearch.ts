import { COMMON_FOODS } from '../data/commonFoods';
import { Micronutrients } from '../types';

export interface FoodItem {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  source: 'preset' | 'openfoodfacts';
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

  // Run API searches
  const offResults = await offPromise();
  results.push(...offResults);

  // Deduplicate by name
  const seen = new Set<string>();
  return results.filter(item => {
    const key = item.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 30);
}
