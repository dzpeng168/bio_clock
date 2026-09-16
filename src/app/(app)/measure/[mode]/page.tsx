import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/data/queries";
import { QuickTestForm } from "@/app/onboarding/quick-test/quick-test-form";

export const dynamic = "force-dynamic";

const MODES = {
  quick: { title: "快测", metadata: "快测" },
  standard: { title: "标准测", metadata: "标准测" },
} as const;

export default async function MeasureModePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (mode !== "quick" && mode !== "standard") notFound();
  const profile = await getProfile();
  if (!profile) redirect("/onboarding/basic-info");

  return (
    <QuickTestForm
      mode={mode}
      redirectTo="/measure/result"
      stepLabel={`${MODES[mode as keyof typeof MODES].title} · 约 ${mode === "quick" ? "3" : "10"} 分钟`}
    />
  );
}
