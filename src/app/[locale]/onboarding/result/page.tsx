import { redirect } from "next/navigation";
import { getCurrentUser, getLatestMeasurement, isDemoMode } from "@/lib/data/queries";
import { recommendStarters } from "@/lib/domain";
import { ResultView } from "@/components/result-view";
import { StarterPicker } from "./starter-picker";
import { GuestResult } from "./guest-result";

export const dynamic = "force-dynamic";
export const metadata = { title: "你的生理年龄" };

export default async function OnboardingResultPage() {
  // 游客模式：读取本机暂存的结果展示，并引导登录保存
  const guest = !isDemoMode() && !(await getCurrentUser());
  if (guest) return <GuestResult />;

  const m = await getLatestMeasurement();
  if (!m) redirect("/onboarding/quick-test");

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">首次使用 · 步骤 3/3</p>
      <h1 className="mt-1 mb-6 text-2xl font-bold text-slate-900">
        {m.delta <= 0 ? "好消息：你比同龄人更年轻" : "看见你的身体年龄了"}
      </h1>
      <ResultView m={m} />
      <StarterPicker recommendations={recommendStarters(m.dimensions)} />
    </main>
  );
}
