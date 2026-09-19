import Link from "next/link";
import {
  ActivityIcon,
  ChevronRightIcon,
  FileTextIcon,
  ZapIcon,
} from "@/components/icons";
import { Badge, Card, SectionTitle, buttonLinkStyles, cn } from "@/components/ui";
import { fmt1, fmtFullDate, fmtMonthDay } from "@/lib/domain";
import { getMeasurements, getProfile } from "@/lib/data/queries";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).measure.title };
}

export default async function MeasurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const f = interpolate;
  const [measurements, profile] = await Promise.all([getMeasurements(20), getProfile()]);
  const last = measurements[0] ?? null;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{t.measure.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {profile
            ? f(t.measure.subWithProfile, {
                age: new Date().getFullYear() - Number(profile.birthDate.slice(0, 4)),
                unit: t.common.years,
                goal: t.domain.goals[profile.goal],
              })
            : t.measure.subFallback}
        </p>
      </header>

      {/* 上次结果卡 */}
      {last ? (
        <Card className="p-5">
          <SectionTitle
            title={t.measure.lastResult}
            sub={`${fmtMonthDay(last.createdAt, locale)} · ${t.measure.modes[last.mode].label}`}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold tabular-nums text-slate-900">
                {fmt1(last.bioAge)}
                <span className="ml-1 text-lg font-semibold text-slate-400">
                  {t.common.years}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {f(t.measure.calendarLine, {
                  age: fmt1(last.calendarAge),
                  unit: t.common.years,
                  conf: fmt1(last.confidence),
                })}
              </p>
            </div>
            <Badge tone={last.delta <= 0 ? "positive" : "negative"}>
              {last.delta <= 0
                ? f(t.measure.youngerBadge, { n: fmt1(Math.abs(last.delta)) })
                : f(t.measure.olderBadge, { n: fmt1(last.delta) })}
            </Badge>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            {t.measure.calibrationHint}
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-sm text-slate-500">{t.measure.noRecords}</Card>
      )}

      {/* 三种测量模式入口（PRD 3.1 阶梯式设计） */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`/${locale}/measure/quick`}
          className="group rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 transition-colors hover:border-emerald-400"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ZapIcon className="size-5" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-900">{t.measure.modes.quick.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {t.measure.modes.quick.desc}
          </p>
        </Link>
        <Link
          href={`/${locale}/measure/standard`}
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-emerald-400"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-700 text-white">
            <ActivityIcon className="size-5" />
          </span>
          <h3 className="mt-3 flex items-center gap-2 font-semibold text-slate-900">
            {t.measure.modes.standard.label}
            <Badge tone="brand">{t.measure.hardUpdate}</Badge>
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {t.measure.modes.standard.desc}
          </p>
        </Link>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 opacity-70">
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-300 text-white">
            <FileTextIcon className="size-5" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-500">{t.measure.modes.deep.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {t.measure.modes.deep.desc}
          </p>
        </div>
      </div>

      {/* 历史测量记录 */}
      <Card className="p-5">
        <SectionTitle title={t.measure.historyTitle} sub={t.measure.historySub} />
        {measurements.length === 0 ? (
          <p className="text-sm text-slate-400">{t.measure.historyEmpty}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {measurements.map((m, i) => {
              const prev = measurements[i + 1];
              const diff = prev ? m.bioAge - prev.bioAge : null;
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {f(t.measure.historyRow, {
                        mode: t.measure.modes[m.mode].label,
                        age: fmt1(m.bioAge),
                        unit: t.common.years,
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {f(t.measure.historyMeta, {
                        date: fmtFullDate(m.createdAt, locale),
                        conf: fmt1(m.confidence),
                        unit: t.common.years,
                      })}
                    </p>
                  </div>
                  {diff !== null && (
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        diff < 0
                          ? "text-emerald-600"
                          : diff > 0
                            ? "text-amber-600"
                            : "text-slate-400"
                      )}
                    >
                      {diff < 0 ? "" : diff > 0 ? "+" : ""}
                      {fmt1(diff)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="text-center">
        <Link href={`/${locale}/trends`} className={`${buttonLinkStyles.outline} text-sm`}>
          {t.measure.viewTrends} <ChevronRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}