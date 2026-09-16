// 领域类型与常量（对照 PRD 第二章/第四章）

export type Gender = "male" | "female";
export type Goal = "understand" | "improve" | "prevent";
export type MeasureMode = "quick" | "standard" | "deep";

export const GOAL_LABELS: Record<Goal, string> = {
  understand: "了解真实状态",
  improve: "改善习惯",
  prevent: "慢病预防",
};

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
  label: string;
  age: number; // 该维度等效年龄
  offset: number; // 相对日历年龄的偏移（岁）
  reasons: string[]; // 可解释归因
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

/** 每日结算摘要 */
export interface DailySummary {
  date: string;
  positiveKeys: string[];
  negativeKeys: string[];
  positive: number; // 健康资产
  negative: number; // 老化负债（绝对值）
  net: number; // 净值 N
  title: string; // 结算文案
  tone: "positive" | "negative" | "neutral";
  drift: number; // 对预测轨迹的影响（岁）
  daysText: string;
}

/** 每日行为定义（PRD 4.3 / 4.4；网页端为手动打卡） */
export interface BehaviorDef {
  key: string;
  label: string;
  criteria: string; // 判定标准
  score: number;
  direction: 1 | -1;
  mechanism: string; // 机制说明
  capGroup?: string; // 单项日封顶组（PRD 4.5：运动每日最多 +6）
  remedy?: string; // 负向行为的挽回方案（PRD 4.1：负反馈必带替代方案）
}

export const POSITIVE_BEHAVIORS: BehaviorDef[] = [
  {
    key: "aerobic",
    label: "有氧运动",
    criteria: "≥30 分钟中等强度",
    score: 3,
    direction: 1,
    mechanism: "提升心肺功能与 VO₂max",
    capGroup: "exercise",
  },
  {
    key: "strength",
    label: "力量训练",
    criteria: "≥20 分钟，每周 ≥2 次有加成",
    score: 3,
    direction: 1,
    mechanism: "对抗 30 岁后每年 1% 的肌肉流失",
    capGroup: "exercise",
  },
  {
    key: "sleep",
    label: "达标睡眠",
    criteria: "7–9 小时且入睡规律",
    score: 3,
    direction: 1,
    mechanism: "深睡修复、HRV 提升",
  },
  {
    key: "diet",
    label: "饮食质量",
    criteria: "蔬果 ≥400g 或全谷物、少加工",
    score: 2,
    direction: 1,
    mechanism: "抗炎、血糖平稳",
  },
  {
    key: "mindfulness",
    label: "正念减压",
    criteria: "呼吸 / 冥想 ≥10 分钟",
    score: 2,
    direction: 1,
    mechanism: "降低皮质醇与静息心率",
  },
  {
    key: "water",
    label: "足量饮水",
    criteria: "1500–2000 ml",
    score: 1,
    direction: 1,
    mechanism: "维持代谢效率",
  },
  {
    key: "social",
    label: "社交连接",
    criteria: "线下面对面交流 ≥30 分钟",
    score: 1,
    direction: 1,
    mechanism: "长寿蓝区研究的核心因子",
  },
];

export const NEGATIVE_BEHAVIORS: BehaviorDef[] = [
  {
    key: "late_sleep",
    label: "熬夜",
    criteria: "睡眠 <6h 或 0 点后入睡",
    score: 3,
    direction: -1,
    mechanism: "皮质醇升高、深睡受损",
    remedy: "今晚 23 点前入睡，明天可追回约 0.5 天",
  },
  {
    key: "smoke_drink",
    label: "吸烟 / 过量饮酒",
    criteria: "任何吸烟；酒精 >15g/日",
    score: 3,
    direction: -1,
    mechanism: "证据最明确的加速衰老因子",
    remedy: "设置每周上限并逐步减半，任何一次减少都计正向",
  },
  {
    key: "sedentary",
    label: "久坐",
    criteria: "单次 >60 分钟或全天 >8h",
    score: 2,
    direction: -1,
    mechanism: "血流瘀滞、代谢下降",
    remedy: "每小时起身活动 3 分钟，全天打断 4 次即可抵消大半",
  },
  {
    key: "sugar_salt",
    label: "高糖高盐",
    criteria: "添加糖 >25g 或钠 >5g",
    score: 2,
    direction: -1,
    mechanism: "糖化反应、血压升高",
    remedy: "下一餐先吃蔬果与蛋白质，可减缓血糖波动",
  },
  {
    key: "screen_before_bed",
    label: "睡前屏幕",
    criteria: "入睡前 1 小时蓝光暴露",
    score: 1,
    direction: -1,
    mechanism: "入睡延迟、深睡减少",
    remedy: "睡前 30 分钟改听音频或纸质书",
  },
  {
    key: "chronic_stress",
    label: "持续高压",
    criteria: "压力自评连续 ≥2 天偏高",
    score: 1,
    direction: -1,
    mechanism: "慢性炎症因子升高",
    remedy: "10 分钟盒式呼吸练习，今晚即可完成",
  },
];

export const ALL_BEHAVIORS: BehaviorDef[] = [
  ...POSITIVE_BEHAVIORS,
  ...NEGATIVE_BEHAVIORS,
];

export const behaviorByKey = (key: string) =>
  ALL_BEHAVIORS.find((b) => b.key === key);

/** 日结算（PRD 4.5）：净值 N → 反馈文案 + 预测轨迹影响（岁） */
export function settlement(net: number): {
  title: string;
  tone: "positive" | "negative" | "neutral";
  drift: number;
  daysText: string;
} {
  if (net >= 4)
    return {
      title: "今天年轻了约 1.5 天",
      tone: "positive",
      drift: -0.04,
      daysText: "≈ 年轻 1.5 天",
    };
  if (net >= 1)
    return {
      title: "今天年轻了 0.3–1 天",
      tone: "positive",
      drift: -0.02,
      daysText: "≈ 年轻 0.3–1 天",
    };
  if (net === 0)
    return {
      title: "今天持平，维持住了",
      tone: "neutral",
      drift: 0,
      daysText: "持平",
    };
  if (net > -4)
    return {
      title: "今天老了 0.3–1 天",
      tone: "negative",
      drift: 0.02,
      daysText: "≈ 老 0.3–1 天",
    };
  return {
    title: "今天老了约 1.5 天",
    tone: "negative",
    drift: 0.04,
    daysText: "≈ 老 1.5 天",
  };
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

export function fmtDateCN(key: string): string {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const [y, m, d] = key.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}月${d}日 周${weekdays[wd]}`;
}
