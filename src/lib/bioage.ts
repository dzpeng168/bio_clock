// BioAge 测量引擎 V1（PRD 3.6：公开可解释的简化加权框架）
// 五维先归一化为"维度年龄"（日历年龄 + 偏移），再线性加权合成
import type {
  DimensionKey,
  DimensionResult,
  Measurement,
  MeasureMode,
  PhysicalTests,
  Profile,
  QuickTestAnswers,
} from "./domain";
import { calendarAge } from "./domain";

export const DIMENSION_WEIGHTS: { key: DimensionKey; label: string; weight: number }[] = [
  { key: "cardio", label: "心血管", weight: 0.25 },
  { key: "metabolic", label: "代谢", weight: 0.2 },
  { key: "musculoskeletal", label: "肌肉骨骼", weight: 0.2 },
  { key: "sleep", label: "睡眠恢复", weight: 0.15 },
  { key: "lifestyle", label: "生活方式", weight: 0.2 },
];

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const round1 = (v: number) => Math.round(v * 10) / 10;

/** 各维度相对日历年龄的偏移（岁）与归因；clamp ±8 */
function dimensionOffsets(
  p: Profile,
  a: QuickTestAnswers,
  t?: PhysicalTests
): Record<DimensionKey, { offset: number; reasons: string[] }> {
  const r: Record<DimensionKey, { offset: number; reasons: string[] }> = {
    cardio: { offset: 0, reasons: [] },
    metabolic: { offset: 0, reasons: [] },
    musculoskeletal: { offset: 0, reasons: [] },
    sleep: { offset: 0, reasons: [] },
    lifestyle: { offset: 0, reasons: [] },
  };

  // 心血管：静息心率 + 有氧频率
  if (a.restingHr < 55) {
    r.cardio.offset -= 3;
    r.cardio.reasons.push("静息心率优秀，心肺状态好于同龄");
  } else if (a.restingHr < 65) {
    r.cardio.offset -= 1.5;
    r.cardio.reasons.push("静息心率处于健康区间");
  } else if (a.restingHr > 85) {
    r.cardio.offset += 4;
    r.cardio.reasons.push("静息心率偏高，建议关注");
  } else if (a.restingHr > 75) {
    r.cardio.offset += 2;
    r.cardio.reasons.push("静息心率略高于理想值");
  }
  if (a.aerobicDays >= 3) {
    r.cardio.offset -= 1;
    r.cardio.reasons.push("规律有氧在持续提升心肺能力");
  } else if (a.aerobicDays === 0) {
    r.cardio.offset += 1;
    r.cardio.reasons.push("缺少有氧运动，心肺刺激不足");
  }

  // 代谢：BMI + 饮食质量
  const bmi = p.weightKg / Math.pow(p.heightCm / 100, 2);
  if (bmi >= 28) {
    r.metabolic.offset += 3;
    r.metabolic.reasons.push(`BMI ${round1(bmi)} 偏高，代谢负担加重`);
  } else if (bmi >= 24) {
    r.metabolic.offset += 1.5;
    r.metabolic.reasons.push(`BMI ${round1(bmi)} 略超标准`);
  } else if (bmi < 18.5) {
    r.metabolic.offset += 1;
    r.metabolic.reasons.push(`BMI ${round1(bmi)} 偏低`);
  }
  if (a.dietQuality >= 4) {
    r.metabolic.offset -= 1;
    r.metabolic.reasons.push("饮食质量较高，抗炎摄入充足");
  } else if (a.dietQuality <= 2) {
    r.metabolic.offset += 1.5;
    r.metabolic.reasons.push("饮食加工食品偏多，影响血糖平稳");
  }

  // 肌肉骨骼：力量频率（+ 标准测体能微测试修正）
  if (a.strengthDays >= 2) {
    r.musculoskeletal.offset -= 2;
    r.musculoskeletal.reasons.push("每周 ≥2 次力量训练有效对抗肌肉流失");
  } else if (a.strengthDays === 1) {
    r.musculoskeletal.offset -= 0.5;
  } else {
    r.musculoskeletal.offset += 1.5;
    r.musculoskeletal.reasons.push("缺少力量训练，肌肉逐年流失");
  }
  if (t) {
    let adjust = 0;
    if (t.chairStand30s !== undefined) {
      if (t.chairStand30s >= 18) adjust -= 0.5;
      else if (t.chairStand30s <= 11) adjust += 0.5;
    }
    if (t.singleLegBalanceS !== undefined) {
      if (t.singleLegBalanceS >= 20) adjust -= 0.5;
      else if (t.singleLegBalanceS <= 8) adjust += 0.5;
    }
    if (t.walkSpeedMs !== undefined) {
      if (t.walkSpeedMs >= 1.3) adjust -= 0.5;
      else if (t.walkSpeedMs <= 1.0) adjust += 0.5;
    }
    if (t.gripKg !== undefined) {
      if (t.gripKg >= 40) adjust -= 0.5;
      else if (t.gripKg <= 28) adjust += 0.5;
    }
    r.musculoskeletal.offset += adjust;
    if (adjust < 0) r.musculoskeletal.reasons.push("体能微测试结果好于同龄参考");
    if (adjust > 0) r.musculoskeletal.reasons.push("体能微测试低于同龄参考值");
  }

  // 睡眠恢复：时长 + 规律性
  if (a.sleepHours < 6) {
    r.sleep.offset += 2;
    r.sleep.reasons.push("睡眠不足 6 小时，深睡修复受限");
  } else if (a.sleepHours < 7) {
    r.sleep.offset += 0.5;
  } else if (a.sleepHours > 9) {
    r.sleep.offset += 0.5;
    r.sleep.reasons.push("睡眠时长偏长，注意睡眠质量");
  } else {
    r.sleep.reasons.push("睡眠时长处于修复区间");
  }
  if (a.sleepRegularity >= 4) {
    r.sleep.offset -= 1;
  } else if (a.sleepRegularity <= 2) {
    r.sleep.offset += 1;
    r.sleep.reasons.push("作息不规律，入睡时间波动大");
  }

  // 生活方式：吸烟 / 饮酒 / 压力 / 久坐
  if (a.smoking) {
    r.lifestyle.offset += 3;
    r.lifestyle.reasons.push("吸烟是证据最明确的加速衰老因子");
  }
  if (a.drinking >= 2) {
    r.lifestyle.offset += 1.5;
    r.lifestyle.reasons.push("饮酒频率偏高");
  } else if (a.drinking === 1) {
    r.lifestyle.offset += 0.5;
  }
  if (a.stress >= 4) {
    r.lifestyle.offset += 1.5;
    r.lifestyle.reasons.push("压力自评偏高，慢性炎症风险上升");
  } else if (a.stress === 3) {
    r.lifestyle.offset += 0.5;
  }
  if (a.sittingHours > 10) {
    r.lifestyle.offset += 2.5;
    r.lifestyle.reasons.push("每日久坐超过 10 小时");
  } else if (a.sittingHours > 8) {
    r.lifestyle.offset += 1.5;
    r.lifestyle.reasons.push("每日久坐超过 8 小时，血流瘀滞");
  } else if (a.sittingHours < 4) {
    r.lifestyle.offset -= 0.5;
  }

  for (const key of Object.keys(r) as DimensionKey[]) {
    r[key].offset = clamp(r[key].offset, -8, 8);
  }
  return r;
}

/** 计算生理年龄（V1 简化加权，快测 ±3 / 标准测 ±2 置信区间） */
export function computeBioAge(
  profile: Profile,
  answers: QuickTestAnswers,
  tests?: PhysicalTests,
  mode: MeasureMode = "quick"
): Omit<Measurement, "id" | "createdAt"> {
  const calAge = calendarAge(profile.birthDate);
  const offsets = dimensionOffsets(profile, answers, tests);

  let bioAge = calAge;
  const dimensions: DimensionResult[] = DIMENSION_WEIGHTS.map((d) => {
    const { offset, reasons } = offsets[d.key];
    bioAge += offset * d.weight;
    return {
      key: d.key,
      label: d.label,
      age: round1(calAge + offset),
      offset: round1(offset),
      reasons: reasons.length ? reasons : ["该维度接近同龄平均水平"],
    };
  });

  bioAge = round1(bioAge);
  const confidence = mode === "quick" ? 3 : mode === "standard" ? 2 : 1;

  return {
    mode,
    bioAge,
    calendarAge: calAge,
    delta: round1(bioAge - calAge),
    confidence,
    dimensions,
    algorithmVersion: "v1.0-simplified",
  };
}

/** 老化速率：实测年龄变化折算为 岁/30天 */
export function agingRate(
  measurements: { bioAge: number; createdAt: string }[]
): number | null {
  if (measurements.length < 2) return null;
  const sorted = [...measurements].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days = Math.max(
    1,
    (+new Date(last.createdAt) - +new Date(first.createdAt)) / 86400000
  );
  return round1(((last.bioAge - first.bioAge) / days) * 30);
}
