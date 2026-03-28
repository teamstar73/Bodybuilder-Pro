/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Supplement } from '../types';
import { SUPPLEMENT_PRESETS } from '../data/supplements';

export function searchSupplements(
  query: string,
  filters: { evidence?: string; phase?: string },
  userCustomSupplements: Supplement[] = []
): Supplement[] {
  // Combine presets with user custom supplements
  // Assign temporary IDs to presets for the search results
  const presetsWithIds: Supplement[] = SUPPLEMENT_PRESETS.map((s, i) => ({
    ...s,
    id: `preset-${i}`
  })) as Supplement[];

  let results = [...presetsWithIds, ...userCustomSupplements];

  // Search by query
  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.timing.toLowerCase().includes(q) ||
      (s.mechanism && s.mechanism.toLowerCase().includes(q)) ||
      (s.synergy && s.synergy.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  }

  // Filter by evidence level
  if (filters.evidence) {
    results = results.filter(s => s.evidence_level === filters.evidence);
  }

  // Filter/Sort by phase
  if (filters.phase) {
    const phaseMap: Record<string, string[]> = {
      bulk:     ['クレアチン', 'βアラニン', '亜鉛', 'マグネシウム', 'ビタミンD3', 'プロテイン'],
      cut:      ['カフェイン', 'Lカルニチン', 'オメガ3', 'ビタミンD3', '亜鉛', 'HMB'],
      peak:     ['カフェイン', 'クレアチン', 'βアラニン', 'シトルリン', 'BCAA', 'EAA'],
      maintain: ['ビタミンD3', '亜鉛', 'マグネシウム', 'オメガ3', 'マルチビタミン']
    };
    
    const recommended = phaseMap[filters.phase] || [];
    
    // In a real search, we might want to filter or just sort.
    // The user request implies we should prioritize these.
    results.sort((a, b) => {
      const aRec = recommended.some(r => a.name.includes(r));
      const bRec = recommended.some(r => b.name.includes(r));
      if (aRec && !bRec) return -1;
      if (!aRec && bRec) return 1;
      return 0;
    });
  }

  return results;
}
