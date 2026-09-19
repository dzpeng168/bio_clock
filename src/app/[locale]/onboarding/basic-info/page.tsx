import { redirect } from "next/navigation";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { BasicInfoForm } from "./basic-info-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).onboarding.basicInfo.title };
}

export default async function BasicInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  // 游客模式：已配置 Supabase 但未登录的访客，免登录完成快测
  const guest = !isDemoMode() && !(await getCurrentUser());
  if (!guest) {
    const profile = await getProfile();
    if (profile?.onboardedAt) redirect(`/${locale}/today`);
  }
  return <BasicInfoForm guest={guest} />;
}