import { redirect } from "next/navigation";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { BasicInfoForm } from "./basic-info-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "基础信息" };

export default async function BasicInfoPage() {
  // 游客模式：已配置 Supabase 但未登录的访客，免登录完成快测
  const guest = !isDemoMode() && !(await getCurrentUser());
  if (!guest) {
    const profile = await getProfile();
    if (profile?.onboardedAt) redirect("/today");
  }
  return <BasicInfoForm guest={guest} />;
}
