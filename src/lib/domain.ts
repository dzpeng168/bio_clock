// 领域类型与常量（对照 PRD 第二章/第四章）
// 展示文案统一收敛到 @/lib/i18n 字典，此处只保留 key 与数值逻辑

import type { Locale } from "@/lib/i18n/config";

export type Gender = "male" | "female";
export type Goal = "understand" | "improve" | "prevent";
export type MeasureMode = "quick" | "standard" | "deep";

/** 可解释归因：code 对应 dict.domain.reasons，params 用于模板插值 */
export interface Reason {
  code: string;
  params?: Record<string, string | number>;
}
/** 兼容历史数据中以明文存储的归因 */
export type ReasonLike = Reason | string;

export interface Profile {
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  onboardedAt?: string | null;
}

/** 快测问卷（PRD 3.1：生活方式问卷 + 可穿戴 7 天均值；网页端为手动录入） */
export interface QuickTestAnswers {
  restingHr: number; // 静息心率 bpm
  sleepHours: number; // 日均睡眠时长
  sleepRegularity: number; // 作息规律自评 1-5
  aerobicDays: number; // 每周有氧次数
  strengthDays: number; // 每周力量次数
  sittingHours: number; // 日均久坐时长
  smoking: boolean;
  drinking: number; // 0 从不 / 1 偶尔 / 2 每周 / 3 几乎每天
  dietQuality: number; // 饮食质量自评 1-5
  stress: number; // 压力自评 1-5
}

/** 标准测新增：体能微测试（PRD 3.2） */
export interface PhysicalTests {
  gripKg?: number; // 握力
  chairStand30s?: number; // 30 秒坐站次数
  singleLegBalanceS?: number; // 单腿闭眼站立秒数
  walkSpeedMs?: number; // 6 米步速 m/s
}

export type DimensionKey =
  | "cardio"
  | "metabolic"
  | "musculoskeletal"
  | "sleep"
  | "lifestyle";

export interface DimensionResult {
  key: DimensionKey;
  age: number; // 该维度等效年龄
  offset: number; // 相对日历年龄的偏移（岁）
  reasons: ReasonLike[]; // 可解释归因（字典 code，兼容历史明文）
}

export interface Measurement {
  id: string;
  mode: MeasureMode;
  bioAge: number;
  calendarAge: number;
  delta: number; // 生理 - 日历，负 = 更年轻
  confidence: number; // ± 岁（快测 3 / 标准 2 / 深测 1）
  dimensions: DimensionResult[];
  algorithmVersion: string;
  createdAt: string;
}

/** 日结算文案分支：对应 dict.domain.settlement */
export type SettlementKey = "highPos" | "pos" | "neutral" | "neg" | "highNeg";

export interface DailySummary {
  date: string;
  positiveKeys: string[];
  negativeKeys: string[];
  positive: number; // 健康资产
  negative: number; // 老化负债（绝对值）
  net: number; // 净值 N
  settlementKey: SettlementKey; // 结算文案字典键
  tone: "positive" | "negative" | "neutral";
  drift: number; // 对预测轨迹的影响（岁）
}

/** 行为 key：文案见 dict.domain.behaviors */
export type BehaviorKey =
  | "aerobic"
  | "strength"
  | "sleep"
  | "diet"
  | "mindfulness"
  | "water"
  | "social"
  | "late_sleep"
  | "smoke_drink"
  | "sedentary"
  | "sugar_salt"
  | "screen_before_bed"
  | "chronic_stress";

/** 每日行为定义（PRD 4.3 / 4.4；网页端为手动打卡） */
export interface BehaviorDef {
  key: BehaviorKey;
  score: number;
  direction: 1 | -1;
  capGroup?: string; // 单项日封顶组（PRD 4.5：运动每日最多 +6）
}

export const POSITIVE_BEHAVIORS: BehaviorDef[] = [
  { key: "aerobic", score: 3, direction: 1, capGroup: "exercise" },
  { key: "strength", score: 3, direction: 1, capGroup: "exercise" },
  { key: "sleep", score: 3, direction: 1 },
  { key: "diet", score: 2, direction: 1 },
  { key: "mindfulness", score: 2, direction: 1 },
  { key: "water", score: 1, direction: 1 },
  { key: "social", score: 1, direction: 1 },
];

export const NEGATIVE_BEHAVIORS: BehaviorDef[] = [
  { key: "late_sleep", score: 3, direction: -1 },
  { key: "smoke_drink", score: 3, direction: -1 },
  { key: "sedentary", score: 2, direction: -1 },
  { key: "sugar_salt", score: 2, direction: -1 },
  { key: "screen_before_bed", score: 1, direction: -1 },
  { key: "chronic_stress", score: 1, direction: -1 },
];

export const ALL_BEHAVIORS: BehaviorDef[] = [
  ...POSITIVE_BEHAVIORS,
  ...NEGATIVE_BEHAVIORS,
];

export const behaviorByKey = (key: string) =>
  ALL_BEHAVIORS.find((b) => b.key === key);

/** 短板维度 → 高杠杆低门槛的候选行为（PRD 用户旅程步骤 6） */
export const RECOMMEND_MAP: Record<DimensionKey, string[]> = {
  cardio: ["aerobic", "mindfulness"],
  metabolic: ["diet", "strength"],
  musculoskeletal: ["strength", "aerobic"],
  sleep: ["sleep", "mindfulness"],
  lifestyle: ["mindfulness", "diet"],
};

/** 按短板排序推荐最多 3 个启动行为 */
export function recommendStarters(dimensions: DimensionResult[]): BehaviorDef[] {
  const sorted = [...dimensions].sort((a, b) => b.offset - a.offset);
  const keys: string[] = [];
  for (const d of sorted) {
    for (const k of RECOMMEND_MAP[d.key]) {
      if (!keys.includes(k)) keys.push(k);
      if (keys.length >= 3) break;
    }
    if (keys.length >= 3) break;
  }
  return keys
    .map((k) => behaviorByKey(k))
    .filter((b): b is BehaviorDef => Boolean(b));
}

/** 日结算（PRD 4.5）：净值 N → 文案字典键 + 预测轨迹影响（岁） */
export function settlement(net: number): {
  settlementKey: SettlementKey;
  tone: "positive" | "negative" | "neutral";
  drift: number;
} {
  if (net >= 4) return { settlementKey: "highPos", tone: "positive", drift: -0.04 };
  if (net >= 1) return { settlementKey: "pos", tone: "positive", drift: -0.02 };
  if (net === 0) return { settlementKey: "neutral", tone: "neutral", drift: 0 };
  if (net > -4) return { settlementKey: "neg", tone: "negative", drift: 0.02 };
  return { settlementKey: "highNeg", tone: "negative", drift: 0.04 };
}

/* ---------- 工具 ---------- */

/** 数字格式化：保留 1 位小数并去掉 .0 */
export const fmt1 = (n: number) =>
  (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");

/** 以北京时间取当日日期键 YYYY-MM-DD */
export function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(new Date());
}

export function calendarAge(birthDate: string): number {
  const birth = new Date(birthDate + "T00:00:00Z");
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

/** 日期键 YYYY-MM-DD → 本地化短日期（zh：9月17日周三 / en：Wed, Sep 17） */
export function fmtDate(key: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${key}T00:00:00Z`));
}

const dateTimeLocale = (locale: Locale) => (locale === "zh" ? "zh-CN" : "en-US");

/** ISO 时间戳 → 月日（zh：9月17日 / en：September 17） */
export function fmtMonthDay(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(dateTimeLocale(locale), {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(new Date(iso));
}

/** ISO 时间戳 → 完整日期（zh：2026/9/17 / en：9/17/2026） */
export function fmtFullDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(dateTimeLocale(locale), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(new Date(iso));
}
