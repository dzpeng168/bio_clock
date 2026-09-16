import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data/queries";
import { BasicInfoForm } from "./basic-info-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "基础信息" };

export default async function BasicInfoPage() {
  const profile = await getProfile();
  if (profile?.onboardedAt) redirect("/today");
  return <BasicInfoForm />;
}
