import { redirect } from "next/navigation";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { QuickTestForm } from "./quick-test-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "首次快测" };

export default async function QuickTestPage() {
  // 游客模式：已配置 Supabase 但未登录的访客，免登录完成快测
  const guest = !isDemoMode() && !(await getCurrentUser());
  if (!guest) {
    const profile = await getProfile();
    if (!profile) redirect("/onboarding/basic-info");
    if (profile.onboardedAt) redirect("/today");
  }
  return <QuickTestForm mode="quick" redirectTo="/onboarding/result" guest={guest} />;
}
