import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { Card } from "@/components/ui";
import { DIMENSION_WEIGHTS } from "@/lib/bioage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).algorithm.title };
}

export default async function AlgorithmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/${locale}/profile`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="size-4" /> {t.algorithm.back}
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">{t.algorithm.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.algorithm.intro}</p>

      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-slate-900">{t.algorithm.weightsTitle}</h2>
        <div className="mt-3 space-y-2.5">
          {DIMENSION_WEIGHTS.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-slate-700">
                {t.domain.dimensions[d.key]}
              </span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${d.weight * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-slate-500">
                {Math.round(d.weight * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">{t.algorithm.rulesTitle}</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-slate-600">
          {t.algorithm.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">{t.algorithm.sourcesTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t.algorithm.sourcesDesc}
        </p>
      </Card>

      <p className="mt-6 pb-6 text-xs leading-relaxed text-slate-400">
        {t.algorithm.versionFootnote}
      </p>
    </div>
  );
}