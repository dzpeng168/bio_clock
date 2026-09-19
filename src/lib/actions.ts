"use server";
// Server Actions：所有写操作统一入口
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { computeBioAge } from "@/lib/bioage";
import {
  calendarAge,
  type DailySummary,
  type Measurement,
  type MeasureMode,
  type PhysicalTests,
  type Profile,
  type QuickTestAnswers,
} from "@/lib/domain";
import {
  getCurrentUser,
  getProfile,
  isDemoMode,
  saveMeasurement,
  savePlan,
  saveProfile,
  toggleBehavior,
} from "@/lib/data/queries";

export async function saveProfileAction(input: {
  birthDate: string;
  gender: Profile["gender"];
  heightCm: number;
  weightKg: number;
  goal: Profile["goal"];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const age = calendarAge(input.birthDate);
    if (age < 18 || age > 100) throw new Error("年龄需在 18–100 岁之间");
    if (input.heightCm < 100 || input.heightCm > 250) throw new Error("身高需在 100–250 cm");
    if (input.weightKg < 30 || input.weightKg > 250) throw new Error("体重需在 30–250 kg");
    const existing = await getProfile();
    await saveProfile({ ...input, onboardedAt: existing?.onboardedAt ?? null });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function submitTestAction(input: {
  answers: QuickTestAnswers;
  tests?: PhysicalTests;
  mode: MeasureMode;
  redirectTo: string;
}): Promise<{ ok: false; error: string } | { ok: true }> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "请先完成基础信息" };
  const result = computeBioAge(profile, input.answers, input.tests, input.mode);
  await saveMeasurement(result);
  // 快测/标准测完成即视为完成 onboarding（硬更新能力：标准测）
  if (!profile.onboardedAt) {
    await saveProfile({ ...profile, onboardedAt: new Date().toISOString() });
  }
  revalidatePath("/", "layout");
  redirect(input.redirectTo);
}

/** 游客模式数据认领：登录后将本机暂存的基础信息与快测结果保存到账户 */
export async function claimGuestDataAction(input: {
  profile: Profile;
  measurement: Measurement;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "未登录" };
    // 已有账户数据时不覆盖，仅首次认领
    const existing = await getProfile();
    if (!existing) {
      await saveProfile({ ...input.profile, onboardedAt: new Date().toISOString() });
      await saveMeasurement({
        mode: input.measurement.mode,
        bioAge: input.measurement.bioAge,
        calendarAge: input.measurement.calendarAge,
        delta: input.measurement.delta,
        confidence: input.measurement.confidence,
        dimensions: input.measurement.dimensions,
        algorithmVersion: input.measurement.algorithmVersion,
      });
      revalidatePath("/", "layout");
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function toggleBehaviorAction(key: string): Promise<DailySummary> {
  const summary = await toggleBehavior(key);
  revalidatePath("/", "layout");
  return summary;
}

export async function savePlanAction(behaviorKeys: string[]): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (behaviorKeys.length < 1 || behaviorKeys.length > 3)
      throw new Error("请选择 1–3 个启动行为");
    await savePlan(behaviorKeys);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function logoutAction() {
  if (!isDemoMode()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requireUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/** 导出全部个人数据（PRD 非功能：用户可一键导出） */
export async function exportDataAction(): Promise<string> {
  const { getDailySummaries, getMeasurements } = await import("@/lib/data/queries");
  const [profile, measurements, summaries, badges, plan] = await Promise.all([
    getProfile(),
    getMeasurements(200),
    getDailySummaries(90),
    (await import("@/lib/data/queries")).getBadges(),
    (await import("@/lib/data/queries")).getActivePlan(),
  ]);
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), profile, measurements, dailySummaries: summaries, badges, plan },
    null,
    2
  );
}

/** 彻底删除全部数据（PRD 非功能需求） */
export async function deleteAllDataAction(): Promise<{ ok: true }> {
  const { resetAllData } = await import("@/lib/data/queries");
  await resetAllData();
  revalidatePath("/", "layout");
  return { ok: true };
}
