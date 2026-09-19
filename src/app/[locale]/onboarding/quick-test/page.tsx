import { redirect } from "next/navigation";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { QuickTestForm } from "./quick-test-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).onboarding.quickTest.title };
}

export default async function QuickTestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  // 游客模式：已配置 Supabase 但未登录的访客，免登录完成快测
  const guest = !isDemoMode() && !(await getCurrentUser());
  if (!guest) {
    const profile = await getProfile();
    if (!profile) redirect(`/${locale}/onboarding/basic-info`);
    if (profile.onboardedAt) redirect(`/${locale}/today`);
  }
  return (
    <QuickTestForm
      mode="quick"
      redirectTo={`/${locale}/onboarding/result`}
      guest={guest}
    />
  );
}