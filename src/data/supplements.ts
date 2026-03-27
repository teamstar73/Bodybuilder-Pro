/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Supplement } from '../types';

export const SUPPLEMENT_PRESETS: Omit<Supplement, 'id'>[] = [
  {
    name: 'クレアチン',
    dose_g: 5,
    timing: 'トレ後',
    evidence: 'A',
    mechanism: 'ATP再合成速度を向上させる。筋内クレアチンリン酸を20-40%増加させ、高強度運動の反復能力と筋出力を高める。ローディング不要、毎日5gで4週で飽和。',
    synergy: 'βアラニンと併用で相乗効果。水分摂取量を必ず増やすこと。',
    contraindication: '腎機能に問題がある場合は医師に相談。水分不足で筋痙攣リスク。',
    upper_dose_g: 10,
    stock_days_remaining: 30,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'カフェイン',
    dose_g: 0.2,
    timing: 'トレ前60分',
    evidence: 'A',
    mechanism: 'アデノシン受容体を競合的に阻害し覚醒・集中・持久力を向上。脂肪酸動員を促進しパフォーマンスを平均11%向上させる。耐性形成に注意。',
    synergy: 'Lテアニンと1:2比率（カフェイン200mg:テアニン400mg）で副作用を軽減しつつ集中力を最大化。',
    contraindication: '16時以降の摂取は睡眠を阻害。週2-3回の休薬日で耐性リセット。心疾患リスクがある場合は注意。',
    upper_dose_g: 0.6,
    stock_days_remaining: 60,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'βアラニン',
    dose_g: 3.2,
    timing: '食後（分割摂取）',
    evidence: 'A',
    mechanism: '筋肉内カルノシン合成を増加させ、運動中のpH低下（乳酸蓄積による酸性化）を緩衝する。1-4分の高強度運動で特に有効。蓄積型なので毎日継続が必要。',
    synergy: 'クレアチンと併用することで筋量・筋持久力の両方を向上。',
    contraindication: '皮膚のピリピリ感（パレステジア）は正常反応。分割摂取で軽減できる。',
    upper_dose_g: 6.4,
    stock_days_remaining: 45,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'シトルリン',
    dose_g: 6,
    timing: 'トレ前30-45分',
    evidence: 'B',
    mechanism: '一酸化窒素（NO）の前駆体として血管拡張と血流増加を促進。アルギニンより腸管吸収率が高く、筋パンプと持久力を向上させる。',
    synergy: 'アグマチンと併用でNO産生効果が増強。',
    contraindication: 'ED治療薬（PDE5阻害薬）との併用は血圧過降下のリスク。',
    upper_dose_g: 10,
    stock_days_remaining: 30,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'ビタミンD3',
    dose_g: 0.005,
    timing: '食後（脂質含む食事と共に）',
    evidence: 'B',
    mechanism: 'テストステロン合成・免疫機能・筋タンパク合成・骨密度維持に関与するステロイドホルモン前駆体。日本人の約80%が慢性的に不足。',
    synergy: 'K2（MK-7型100μg）と併用することでカルシウム代謝を最適化し動脈石灰化を防ぐ。',
    contraindication: '長期の高用量摂取（10,000IU以上）で高カルシウム血症リスク。定期的な血中濃度測定を推奨。',
    upper_dose_g: 0.1,
    stock_days_remaining: 90,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'マグネシウム',
    dose_g: 0.4,
    timing: '就寝前30分',
    evidence: 'B',
    mechanism: '体内300以上の酵素反応に関与。テストステロン結合グロブリン（SHBG）を低下させ遊離テストステロンを増加。睡眠の質向上・筋痙攣予防・インスリン感受性改善。',
    synergy: '亜鉛と就寝前に摂取するZMAスタックが有名. グリシン酸マグネシウム型が最も吸収率高く胃腸への負担が少ない。',
    contraindication: '酸化マグネシウム型は吸収率4%と極めて低く下痢を引き起こしやすい。グリシン酸塩またはリンゴ酸塩を選ぶこと。',
    upper_dose_g: 0.8,
    stock_days_remaining: 60,
    is_active: true,
    taken_dates: []
  },
  {
    name: '亜鉛',
    dose_g: 0.03,
    timing: '就寝前（空腹時）',
    evidence: 'B',
    mechanism: 'テストステロン合成・タンパク合成・免疫・創傷治癒に必須のミネラル。激しい運動により汗から大量喪失する。亜鉛不足でテストステロンが最大74%低下する研究あり。',
    synergy: 'マグネシウムと就寝前に併用（ZMAスタック）。ビタミンB6と共に吸収促進。',
    contraindication: '鉄と競合吸収するため食事と時間をずらして摂取。長期高用量摂取で銅欠乏リスク。',
    upper_dose_g: 0.04,
    stock_days_remaining: 90,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'オメガ3 EPA/DHA',
    dose_g: 3,
    timing: '食後',
    evidence: 'B',
    mechanism: '炎症性サイトカイン（IL-6・TNF-α）を抑制し筋損傷からの回復を促進。筋タンパク合成をmTOR経路を介して促進。コルチゾール低下・メンタル改善・心血管保護。EPA+DHA合計2-3gが有効域。',
    synergy: 'ビタミンD3と相乗的に作用。高品質な魚油はASTAXANチンと一緒に酸化防止。',
    contraindication: '血液凝固薬（ワーファリン等）との併用は出血リスク。酸化した魚油は逆効果なので冷蔵保存。',
    upper_dose_g: 6,
    stock_days_remaining: 30,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'Lカルニチン',
    dose_g: 2,
    timing: '有酸素運動前30分',
    evidence: 'B',
    mechanism: '長鎖脂肪酸をミトコンドリア内膜に輸送しβ酸化（脂肪燃焼）を促進。インスリン感受性改善・運動後の筋損傷マーカー低下。減量期・有酸素運動時に特に有効。',
    synergy: 'カフェインと併用で脂肪酸動員効果が相乗的に増強。',
    contraindication: '酒石酸カルニチン型が最も吸収率高い。トリメチルアミン産生で魚臭が出る場合あり。',
    upper_dose_g: 4,
    stock_days_remaining: 45,
    is_active: true,
    taken_dates: []
  },
  {
    name: 'NMN',
    dose_g: 0.5,
    timing: '起床後（空腹時）',
    evidence: 'C',
    mechanism: 'NAD+の直接前駆体。加齢とともに低下するNAD+を補充しミトコンドリア機能・サーチュイン（長寿遺伝子）活性化・DNA修復を促進。アンチエイジング分野で最注目のサプリ。',
    synergy: 'レスベラトロール（250-500mg）と併用することでサーチュイン活性化効果が増強されるとDavid Sinclair博士が主張。',
    contraindication: 'ヒトでの長期安全性データはまだ限定的。がん既往歴がある場合は医師に相談。高価格に見合う効果の確証はまだ研究段階。',
    upper_dose_g: 1,
    stock_days_remaining: 30,
    is_active: false,
    taken_dates: []
  }
];
