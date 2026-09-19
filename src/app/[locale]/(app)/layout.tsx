import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { resolveLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  // 路由守卫：登录 + 完成 onboarding 才可进入主应用
  const user = await getCurrentUser();
  if (!isDemoMode() && !user) redirect(`/${locale}/login`);
  const profile = await getProfile();
  if (!profile?.onboardedAt) redirect(`/${locale}/onboarding/basic-info`);

  return (
    <AppShell demo={isDemoMode()} email={user?.email}>
      {children}
    </AppShell>
  );
}