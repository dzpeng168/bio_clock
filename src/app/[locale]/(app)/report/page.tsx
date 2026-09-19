import { Card } from "@/components/ui";
import { fmt1, fmtDate, todayKey } from "@/lib/domain";
import { getActivePlan, getDailySummaries } from "@/lib/data/queries";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).report.title };
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const f = interpolate;
  const today = todayKey();
  const summaries = await getDailySummaries(7);
  const planKeys = (await getActivePlan()) ?? [];

  // 本周（最近 7 天）
  const weekNet = summaries.reduce((a, s) => a + s.net, 0);
  const weekDrift = round1(summaries.reduce((a, s) => a + s.drift, 0));
  const positiveDays = summaries.filter((s) => s.net >= 1).length;

  const counts = new Map<string, number>();
  for (const s of summaries) {
    for (const k of [...s.positiveKeys, ...s.negativeKeys]) {
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const label = (k: string) =>
    t.domain.behaviors[k as keyof typeof t.domain.behaviors]?.label ?? k;
  const top = (positive: boolean) =>
    [...counts.entries()]
      .filter(([k]) => {
        const posKeys = ["aerobic", "strength", "sleep", "diet", "mindfulness", "water", "social"];
        return positive ? posKeys.includes(k) : !posKeys.includes(k);
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

  const maxAbs = Math.max(4, ...summaries.map((s) => Math.abs(s.net)));

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{t.report.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {fmtDate(summaries[0]?.date ?? today, locale)} – {fmtDate(today, locale)}
        </p>
      </header>

      {/* 本周总览 */}
      <Card className="p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400">{t.report.weekNet}</p>
            <p
              className={`text-3xl font-bold tabular-nums ${
                weekNet >= 0 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {weekNet > 0 ? "+" : ""}
              {weekNet}
            </p>
          </div>
          <div className="text-right text-xs leading-relaxed text-slate-500">
            <p>{f(t.report.daysPositive, { n: positiveDays })}</p>
            <p>
              {f(t.report.trajectory, {
                delta: `${weekDrift > 0 ? "+" : ""}${fmt1(weekDrift)}`,
                unit: t.common.years,
              })}
            </p>
          </div>
        </div>
        {/* 每日净值柱状图 */}
        <div className="mt-5 flex h-24 items-end gap-1.5">
          {summaries.map((s) => (
            <div key={s.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-20 w-full items-end justify-center">
                <div
                  className={`w-full max-w-8 rounded-md ${
                    s.net >= 0 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ height: `${(Math.abs(s.net) / maxAbs) * 100}%` }}
                  title={f(t.report.netTooltip, { n: `${s.net > 0 ? "+" : ""}${s.net}` })}
                />
              </div>
              <span className="text-[10px] text-slate-400">{s.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 正负行为 Top3（正向叙事优先，PRD 风险应对） */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold text-emerald-700">{t.report.topPositive}</p>
          <ul className="mt-3 space-y-2">
            {top(true).map(([k, c]) => (
              <li key={k} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{label(k)}</span>
                <span className="tabular-nums text-emerald-600">
                  {f(t.report.countTimes, { n: c })}
                </span>
              </li>
            ))}
            {top(true).length === 0 && (
              <li className="text-sm text-slate-400">{t.report.emptyPositive}</li>
            )}
          </ul>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-amber-700">{t.report.topNegative}</p>
          <ul className="mt-3 space-y-2">
            {top(false).map(([k, c]) => (
              <li key={k} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{label(k)}</span>
                <span className="tabular-nums text-amber-600">
                  {f(t.report.countTimes, { n: c })}
                </span>
              </li>
            ))}
            {top(false).length === 0 && (
              <li className="text-sm text-slate-400">{t.report.emptyNegative}</li>
            )}
          </ul>
        </Card>
      </div>

      {/* 下周计划 */}
      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-900">{t.report.nextWeekTitle}</p>
        <p className="mt-1 text-xs text-slate-400">{t.report.nextWeekSub}</p>
        <ul className="mt-3 space-y-2">
          {(planKeys.length ? planKeys : ["sleep", "diet", "strength"]).map((k, i) => (
            <li
              key={k}
              className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {label(k)}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          {t.report.nextWeekAdvice}
        </p>
      </Card>
    </div>
  );
}