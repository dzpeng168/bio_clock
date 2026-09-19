import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { buttonLinkStyles } from "@/components/ui";
import { getLatestMeasurement } from "@/lib/data/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { ResultView } from "@/components/result-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).measureResult.title };
}

export default async function MeasureResultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const m = await getLatestMeasurement();
  if (!m) redirect(`/${locale}/measure`);

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/${locale}/measure`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="size-4" /> {t.measureResult.back}
      </Link>
      <h1 className="mb-5 text-2xl font-bold text-slate-900">{t.measureResult.title}</h1>
      <ResultView m={m} />
      <div className="mt-6 text-center">
        <Link href={`/${locale}/trends`} className={buttonLinkStyles.primary}>
          {t.measureResult.viewTrends}
        </Link>
      </div>
    </div>
  );
}