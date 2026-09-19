import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 路由守卫：登录 + 完成 onboarding 才可进入主应用
  const user = await getCurrentUser();
  if (!isDemoMode() && !user) redirect("/login");
  const profile = await getProfile();
  if (!profile?.onboardedAt) redirect("/onboarding/basic-info");

  return (
    <AppShell demo={isDemoMode()} email={user?.email}>
      {children}
    </AppShell>
  );
}
