import { redirect } from "next/navigation";
import { getLatestMeasurement } from "@/lib/data/queries";
import { behaviorByKey, type DimensionKey } from "@/lib/domain";
import { ResultView } from "@/components/result-view";
import { StarterPicker } from "./starter-picker";

export const dynamic = "force-dynamic";
export const metadata = { title: "你的生理年龄" };

/** 短板维度 → 高杠杆低门槛的候选行为（PRD 用户旅程步骤 6） */
const RECOMMEND_MAP: Record<DimensionKey, string[]> = {
  cardio: ["aerobic", "mindfulness"],
  metabolic: ["diet", "strength"],
  musculoskeletal: ["strength", "aerobic"],
  sleep: ["sleep", "mindfulness"],
  lifestyle: ["mindfulness", "diet"],
};

export default async function OnboardingResultPage() {
  const m = await getLatestMeasurement();
  if (!m) redirect("/onboarding/quick-test");

  const sorted = [...m.dimensions].sort((a, b) => b.offset - a.offset);
  const recKeys: string[] = [];
  for (const d of sorted) {
    for (const k of RECOMMEND_MAP[d.key]) {
      if (!recKeys.includes(k)) recKeys.push(k);
      if (recKeys.length >= 3) break;
    }
    if (recKeys.length >= 3) break;
  }
  const recommendations = recKeys
    .map((k) => behaviorByKey(k))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">首次使用 · 步骤 3/3</p>
      <h1 className="mt-1 mb-6 text-2xl font-bold text-slate-900">
        {m.delta <= 0 ? "好消息：你比同龄人更年轻" : "看见你的身体年龄了"}
      </h1>
      <ResultView m={m} />
      <StarterPicker recommendations={recommendations} />
    </main>
  );
}
