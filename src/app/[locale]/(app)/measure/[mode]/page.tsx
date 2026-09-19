import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/data/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { QuickTestForm } from "@/app/[locale]/onboarding/quick-test/quick-test-form";

export const dynamic = "force-dynamic";

export default async function MeasureModePage({
  params,
}: {
  params: Promise<{ locale: string; mode: string }>;
}) {
  const { mode } = await params;
  if (mode !== "quick" && mode !== "standard") notFound();
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const profile = await getProfile();
  if (!profile) redirect(`/${locale}/onboarding/basic-info`);

  return (
    <QuickTestForm
      mode={mode}
      redirectTo={`/${locale}/measure/result`}
      stepLabel={`${t.measure.modes[mode].label} · ${t.measure.modes[mode].time}`}
    />
  );
}