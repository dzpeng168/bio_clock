import { redirect } from "next/navigation";
import { getCurrentUser, getLatestMeasurement, isDemoMode } from "@/lib/data/queries";
import { recommendStarters } from "@/lib/domain";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { ResultView } from "@/components/result-view";
import { StarterPicker } from "./starter-picker";
import { GuestResult } from "./guest-result";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).onboarding.result.headingNeutral };
}

export default async function OnboardingResultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  // 游客模式：读取本机暂存的结果展示，并引导登录保存
  const guest = !isDemoMode() && !(await getCurrentUser());
  if (guest) return <GuestResult />;

  const m = await getLatestMeasurement();
  if (!m) redirect(`/${locale}/onboarding/quick-test`);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">{t.onboarding.result.step}</p>
      <h1 className="mt-1 mb-6 text-2xl font-bold text-slate-900">
        {m.delta <= 0 ? t.onboarding.result.headingPositive : t.onboarding.result.headingNeutral}
      </h1>
      <ResultView m={m} />
      <StarterPicker recommendations={recommendStarters(m.dimensions)} />
    </main>
  );
}