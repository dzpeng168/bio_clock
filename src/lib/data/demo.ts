// 演示模式内存数据（Supabase 未配置时使用；进程重启后重置）
import type {
  BehaviorDef,
  Measurement,
  Profile,
} from "@/lib/domain";
import { DIMENSION_WEIGHTS } from "@/lib/bioage";
import { POSITIVE_BEHAVIORS, NEGATIVE_BEHAVIORS } from "@/lib/domain";

export interface DemoDB {
  profile: Profile | null;
  measurements: Measurement[];
  behaviorLogs: Record<string, string[]>; // date -> behavior keys
  plan: { behaviors: string[]; startedAt: string } | null;
  badges: string[];
}

/** 确定性伪随机（保证每次重置后的演示数据一致） */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateNDaysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86400000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(d);
}

function seedDimension(bioAge: number, calAge: number, spread: number, rnd: () => number) {
  return DIMENSION_WEIGHTS.map((d, i) => {
    const offset = round1((rnd() - 0.45) * spread + (i % 2 === 0 ? 0.6 : -0.4));
    const age = round1(calAge + offset);
    return {
      key: d.key,
      label: d.label,
      age,
      offset,
      reasons:
        offset > 0
          ? ["该维度指标弱于同龄平均，建议优先改善"]
          : ["该维度指标优于同龄平均水平"],
    };
  });
}

const round1 = (v: number) => Math.round(v * 10) / 10;

function seed(): DemoDB {
  const rnd = mulberry32(42);
  const profile: Profile = {
    birthDate: "1989-06-15",
    gender: "male",
    heightCm: 175,
    weightKg: 73,
    goal: "improve",
    onboardedAt: new Date(Date.now() - 180 * 86400000).toISOString(),
  };
  const calAge = 37;

  // 历史测量：180 天内 34.9 → 34.9，整体缓慢变年轻
  const history: [number, "quick" | "standard", number][] = [
    [180, "standard", 38.4],
    [150, "quick", 37.9],
    [120, "quick", 37.4],
    [90, "standard", 36.8],
    [60, "quick", 36.1],
    [30, "quick", 35.4],
    [7, "standard", 34.9],
  ];
  const measurements: Measurement[] = history.map(([daysAgo, mode, bioAge]) => ({
    id: `demo-m-${daysAgo}`,
    mode,
    bioAge,
    calendarAge: calAge,
    delta: round1(bioAge - calAge),
    confidence: mode === "standard" ? 2 : 3,
    dimensions: seedDimension(bioAge, calAge, 3, rnd),
    algorithmVersion: "v1.0-simplified",
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  }));

  // 近 60 天行为打卡（不含今天；今日预置 2 条正向便于体验打卡交互）
  const behaviorLogs: Record<string, string[]> = {};
  const pos = POSITIVE_BEHAVIORS.map((b) => b.key);
  const neg = NEGATIVE_BEHAVIORS.map((b) => b.key);
  for (let d = 60; d >= 1; d--) {
    const date = dateNDaysAgo(d);
    const keys: string[] = [];
    if (rnd() < 0.55) keys.push(pos[0]); // aerobic
    if (rnd() < 0.35) keys.push(pos[1]); // strength
    if (rnd() < 0.6) keys.push(pos[2]); // sleep
    if (rnd() < 0.5) keys.push(pos[3]); // diet
    if (rnd() < 0.7) keys.push(pos[5]); // water
    if (rnd() < 0.25) keys.push(pos[4]); // mindfulness
    if (rnd() < 0.3) keys.push(neg[0]); // late_sleep
    if (rnd() < 0.35) keys.push(neg[2]); // sedentary
    if (rnd() < 0.45) keys.push(neg[4]); // screen
    behaviorLogs[date] = keys;
  }
  behaviorLogs[dateNDaysAgo(0)] = ["aerobic", "diet"];

  return {
    profile,
    measurements,
    behaviorLogs,
    plan: {
      behaviors: ["sleep", "diet", "strength"],
      startedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
    badges: ["younger_1"],
  };
}

// 挂到 globalThis，避免 dev 热更新时丢失演示数据
const g = globalThis as unknown as { __bioDemoDB?: DemoDB };

export const demoDB: DemoDB = g.__bioDemoDB ?? (g.__bioDemoDB = seed());

export function resetDemoDB() {
  g.__bioDemoDB = seed();
  Object.assign(demoDB, g.__bioDemoDB);
}

export const demoBehaviorDef = (key: string): BehaviorDef | undefined =>
  [...POSITIVE_BEHAVIORS, ...NEGATIVE_BEHAVIORS].find((b) => b.key === key);

export { dateNDaysAgo };
