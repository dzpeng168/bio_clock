import { redirect } from "next/navigation";
import { getCurrentUser, isDemoMode } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!isDemoMode() && !user) redirect("/login");
  return <div className="min-h-dvh bg-slate-50">{children}</div>;
}
