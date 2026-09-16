import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data/queries";
import { QuickTestForm } from "./quick-test-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "首次快测" };

export default async function QuickTestPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding/basic-info");
  if (profile.onboardedAt) redirect("/today");
  return <QuickTestForm mode="quick" redirectTo="/onboarding/result" />;
}
