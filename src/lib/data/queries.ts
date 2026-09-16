// 服务端数据访问层：Supabase 已配置走数据库，否则走演示数据
// 页面与 Server Action 统一经由此层读写，便于无缝切换
import { createClient } from "@/lib/supabase/server";
import {
  ALL_BEHAVIORS,
  settlement,
  todayKey,
  type BehaviorDef,
  type DailySummary,
  type Measurement,
  type Profile,
} from "@/lib/domain";
import { demoDB, resetDemoDB, dateNDaysAgo, demoBehaviorDef } from "./demo";

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !url ||
    !key ||
    !url.startsWith("https://") ||
    url.includes("your-project") ||
    key.includes("your-anon")
  );
}

export async function getCurrentUser() {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/* ---------- profiles ---------- */

export async function getProfile(): Promise<Profile | null> {
  if (isDemoMode()) return demoDB.profile;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data) return null;
  return {
    birthDate: data.birth_date,
    gender: data.gender,
    heightCm: Number(data.height_cm),
    weightKg: Number(data.weight_kg),
    goal: data.goal,
    onboardedAt: data.onboarded_at,
  };
}

export async function saveProfile(p: Profile) {
  if (isDemoMode()) {
    demoDB.profile = p;
    return;
  }
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");
  const supabase = await createClient();
  const row = {
    id: user.id,
    birth_date: p.birthDate,
    gender: p.gender,
    height_cm: p.heightCm,
    weight_kg: p.weightKg,
    goal: p.goal,
    ...(p.onboardedAt ? { onboarded_at: p.onboardedAt } : {}),
  };
  const { error } = await supabase.from("profiles").upsert(row);
  if (error) throw error;
}

/* ---------- measurements ---------- */

export async function getMeasurements(limit = 50): Promise<Measurement[]> {
  if (isDemoMode())
    return [...demoDB.measurements]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, limit);
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("measurements")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapMeasurement);
}

export async function getLatestMeasurement(): Promise<Measurement | null> {
  const list = await getMeasurements(1);
  return list[0] ?? null;
}

export async function saveMeasurement(
  m: Omit<Measurement, "id" | "createdAt">
): Promise<Measurement> {
  if (isDemoMode()) {
    const saved: Measurement = {
      ...m,
      id: `demo-m-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    demoDB.measurements.push(saved);
    return saved;
  }
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("measurements")
    .insert({
      user_id: user.id,
      mode: m.mode,
      bio_age: m.bioAge,
      calendar_age: m.calendarAge,
      delta: m.delta,
      confidence: m.confidence,
      dimensions: m.dimensions,
      algorithm_version: m.algorithmVersion,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMeasurement(data);
}

function mapMeasurement(d: Record<string, unknown>): Measurement {
  return {
    id: String(d.id),
    mode: d.mode as Measurement["mode"],
    bioAge: Number(d.bio_age),
    calendarAge: Number(d.calendar_age),
    delta: Number(d.delta),
    confidence: Number(d.confidence),
    dimensions: d.dimensions as Measurement["dimensions"],
    algorithmVersion: String(d.algorithm_version),
    createdAt: String(d.created_at),
  };
}

/* ---------- 行为打卡与日结算 ---------- */

export async function getBehaviorKeys(date: string): Promise<string[]> {
  if (isDemoMode()) return [...(demoDB.behaviorLogs[date] ?? [])];
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("behavior_logs")
    .select("behavior_key")
    .eq("user_id", user.id)
    .eq("log_date", date);
  return (data ?? []).map((r) => r.behavior_key);
}

/** 打卡/取消打卡，返回当日最新状态 */
export async function toggleBehavior(key: string): Promise<DailySummary> {
  const date = todayKey();
  if (isDemoMode()) {
    const keys = new Set(demoDB.behaviorLogs[date] ?? []);
    if (keys.has(key)) keys.delete(key);
    else keys.add(key);
    demoDB.behaviorLogs[date] = [...keys];
    return summarize([...keys], date);
  }
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");
  const supabase = await createClient();
  const existing = await supabase
    .from("behavior_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("log_date", date)
    .eq("behavior_key", key)
    .maybeSingle();
  if (existing.data) {
    await supabase.from("behavior_logs").delete().eq("id", existing.data.id);
  } else {
    const def = ALL_BEHAVIORS.find((b) => b.key === key);
    if (!def) throw new Error("未知行为");
    await supabase.from("behavior_logs").insert({
      user_id: user.id,
      log_date: date,
      behavior_key: key,
      direction: def.direction,
      score: def.score,
      source: "manual",
    });
  }
  return summarize(await getBehaviorKeys(date), date);
}

/** 由当日行为 key 集合计算日结算摘要 */
export function summarize(keys: string[], date: string): DailySummary {
  let positive = 0;
  let negative = 0;
  const positiveKeys: string[] = [];
  const negativeKeys: string[] = [];
  for (const key of keys) {
    const def = demoBehaviorDef(key) ?? ALL_BEHAVIORS.find((b) => b.key === key);
    if (!def) continue;
    if (def.direction === 1) {
      positive += def.score;
      positiveKeys.push(key);
    } else {
      negative += def.score;
      negativeKeys.push(key);
    }
  }
  const net = positive - negative;
  return {
    date,
    positiveKeys,
    negativeKeys,
    positive,
    negative,
    net,
    ...settlement(net),
  };
}

export async function getTodaySummary(): Promise<DailySummary> {
  const date = todayKey();
  return summarize(await getBehaviorKeys(date), date);
}

/** 近 N 天每日结算（用于趋势曲线与周报） */
export async function getDailySummaries(days: number): Promise<DailySummary[]> {
  const dates: string[] = [];
  for (let d = days - 1; d >= 0; d--) dates.push(dateNDaysAgo(d));
  if (isDemoMode()) return dates.map((date) => summarize(demoDB.behaviorLogs[date] ?? [], date));
  const user = await getCurrentUser();
  if (!user) return dates.map((date) => summarize([], date));
  const supabase = await createClient();
  const { data } = await supabase
    .from("behavior_logs")
    .select("log_date, behavior_key")
    .eq("user_id", user.id)
    .gte("log_date", dates[0]);
  const byDate = new Map<string, string[]>();
  for (const r of data ?? []) {
    const arr = byDate.get(r.log_date) ?? [];
    arr.push(r.behavior_key);
    byDate.set(r.log_date, arr);
  }
  return dates.map((date) => summarize(byDate.get(date) ?? [], date));
}

/** 连续净值为正的天数（streak，含今日） */
export async function getStreak(): Promise<number> {
  const summaries = await getDailySummaries(90);
  let streak = 0;
  for (let i = summaries.length - 1; i >= 0; i--) {
    if (summaries[i].net >= 1) streak++;
    else if (i !== summaries.length - 1) break;
    else continue; // 今日尚未结算为正不中断历史 streak
  }
  return streak;
}

/* ---------- 计划与徽章 ---------- */

export async function getActivePlan(): Promise<string[] | null> {
  if (isDemoMode()) return demoDB.plan?.behaviors ?? null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("intervention_plans")
    .select("behaviors")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.behaviors as string[] | null) ?? null;
}

export async function savePlan(behaviorKeys: string[]) {
  if (isDemoMode()) {
    demoDB.plan = { behaviors: behaviorKeys, startedAt: new Date().toISOString() };
    return;
  }
  const user = await getCurrentUser();
  if (!user) throw new Error("未登录");
  const supabase = await createClient();
  await supabase.from("intervention_plans").update({ status: "archived" }).eq("user_id", user.id);
  await supabase
    .from("intervention_plans")
    .insert({ user_id: user.id, behaviors: behaviorKeys });
}

export async function getBadges(): Promise<string[]> {
  if (isDemoMode()) return [...demoDB.badges];
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_badges")
    .select("badge_key")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => r.badge_key);
}

export async function addBadge(key: string) {
  if (isDemoMode()) {
    if (!demoDB.badges.includes(key)) demoDB.badges.push(key);
    return;
  }
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("user_badges").insert({ user_id: user.id, badge_key: key });
}

/** 演示数据重置（"我的-彻底删除"入口） */
export async function resetAllData() {
  if (isDemoMode()) {
    resetDemoDB();
    return;
  }
  // 真实模式：删除用户全部数据（保留账户）
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("behavior_logs").delete().eq("user_id", user.id);
  await supabase.from("daily_logs").delete().eq("user_id", user.id);
  await supabase.from("measurements").delete().eq("user_id", user.id);
  await supabase.from("intervention_plans").delete().eq("user_id", user.id);
  await supabase.from("user_badges").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);
}

export type { BehaviorDef };
