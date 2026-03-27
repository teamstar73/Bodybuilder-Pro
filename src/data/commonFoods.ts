/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Micronutrients } from '../types';

export interface CommonFood {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  micronutrients?: Micronutrients;
}

export const COMMON_FOODS: CommonFood[] = [
  { 
    name:'鶏胸肉（皮なし）', cal:108, p:22.3, c:0, f:1.5,
    micronutrients: { zinc_mg: 0.7, iron_mg: 0.3, vitamin_b12_ug: 0.3 }
  },
  { 
    name:'鶏もも肉（皮なし）', cal:127, p:19.0, c:0, f:5.0,
    micronutrients: { zinc_mg: 0.6, iron_mg: 0.5, vitamin_b12_ug: 0.2 }
  },
  { 
    name:'卵（全卵）', cal:151, p:12.3, c:0.3, f:10.3,
    micronutrients: { vitamin_d_iu: 82, zinc_mg: 1.3, vitamin_b12_ug: 0.9, iron_mg: 1.8 }
  },
  { name:'卵白', cal:47, p:10.5, c:0.5, f:0.1 },
  { name:'白米（炊飯後）', cal:168, p:2.5, c:37.1, f:0.3 },
  { name:'玄米（炊飯後）', cal:165, p:2.8, c:35.6, f:1.0 },
  { name:'オートミール（乾燥）', cal:380, p:13.7, c:69.3, f:5.7 },
  { 
    name:'サーモン（生）', cal:208, p:20.1, c:0, f:13.4,
    micronutrients: { vitamin_d_iu: 447, omega3_mg: 2260, vitamin_b12_ug: 3.2 }
  },
  { name:'マグロ（赤身）', cal:125, p:26.4, c:0.1, f:1.4 },
  { name:'タラ（生）', cal:77, p:17.6, c:0, f:0.2 },
  { 
    name:'ブロッコリー', cal:33, p:3.5, c:5.2, f:0.4,
    micronutrients: { vitamin_c_mg: 89, calcium_mg: 47, iron_mg: 0.7, potassium_mg: 316 }
  },
  { 
    name:'ほうれん草', cal:20, p:2.2, c:3.1, f:0.4,
    micronutrients: { iron_mg: 2.7, calcium_mg: 99, vitamin_c_mg: 28, potassium_mg: 558 }
  },
  { name:'バナナ', cal:86, p:1.1, c:22.5, f:0.2 },
  { name:'さつまいも（蒸し）', cal:132, p:1.5, c:31.5, f:0.2 },
  { name:'じゃがいも（蒸し）', cal:84, p:1.8, c:19.7, f:0.1 },
  { name:'ギリシャヨーグルト（無糖）', cal:59, p:10.2, c:3.6, f:0.4 },
  { name:'木綿豆腐', cal:72, p:6.6, c:1.6, f:4.2 },
  { 
    name:'納豆', cal:200, p:16.5, c:12.1, f:10.0,
    micronutrients: { iron_mg: 3.3, calcium_mg: 90, potassium_mg: 660 }
  },
  { 
    name:'アーモンド', cal:598, p:20.3, c:19.7, f:54.1,
    micronutrients: { magnesium_mg: 270, calcium_mg: 264, zinc_mg: 3.1 }
  },
  { name:'くるみ', cal:674, p:14.6, c:11.7, f:68.8 },
  { name:'アボカド', cal:187, p:2.5, c:6.2, f:18.7 },
  { name:'オリーブオイル', cal:894, p:0, c:0, f:100 },
  { name:'プロテイン（WPI）', cal:380, p:85, c:5, f:2 },
  { name:'カッテージチーズ', cal:105, p:13.8, c:2.9, f:4.3 },
  { name:'低脂肪牛乳', cal:46, p:3.5, c:5.0, f:1.0 },
  { name:'そば（茹で）', cal:132, p:4.8, c:26.0, f:1.0 },
  { name:'全粒粉パン', cal:252, p:9.5, c:47.1, f:3.5 },
  { 
    name:'サバ缶（水煮）', cal:174, p:20.9, c:0.2, f:10.7,
    micronutrients: { vitamin_d_iu: 360, omega3_mg: 1700, vitamin_b12_ug: 8.7 }
  },
  { name:'ツナ缶（水煮）', cal:71, p:16.0, c:0.1, f:0.7 },
  { name:'プロテインバー（目安）', cal:200, p:20, c:20, f:5 },
];
