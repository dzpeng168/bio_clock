import { SparklesIcon } from "@/components/icons";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { agingRate } from "@/lib/bioage";
import { fmt1 } from "@/lib/domain";
import { getDailySummaries, getLatestMeasurement, getMeasurements } from "@/lib/data/queries";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { TrendChart, type TrendPoint } from "./trend-chart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).trends.title };
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export default async function TrendsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const f = interpolate;
  const [summaries, measurements, latest] = await Promise.all([
    getDailySummaries(60),
    getMeasurements(50),
    getLatestMeasurement(),
  ]);

  const msAsc = [...measurements].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
  );

  // 预测轨迹：以每个日期之前最近的实测值为锚点，累加每日行为净值带来的漂移（PRD 2.2 软轨迹）
  const prefix: number[] = [0];
  summaries.forEach((s, i) => prefix.push(prefix[i] + s.drift));
  const dateOf = (iso: string) => iso.slice(0, 10);

  const points: TrendPoint[] = summaries.map((s, i) => {
    let anchorIdx = -1;
    msAsc.forEach((m, j) => {
      if (dateOf(m.createdAt) <= s.date) anchorIdx = j;
    });
    const m = anchorIdx >= 0 ? msAsc[anchorIdx] : msAsc[0];
    const anchorDayIdx =
      anchorIdx >= 0
        ? summaries.findIndex((x) => x.date === dateOf(msAsc[anchorIdx].createdAt))
        : -1;
    const anchorPrefix = anchorDayIdx >= 0 ? prefix[anchorDayIdx] : 0;
    const predicted = round1(m.bioAge + prefix[i] - anchorPrefix);
    // 预测带宽度随距锚点时间展宽（快测 ±3 岁置信度的时间衰减示意）
    const daysSinceAnchor = anchorDayIdx >= 0 ? i - anchorDayIdx : i;
    const half = round1(0.15 + 0.008 * Math.max(0, daysSinceAnchor));
    return {
      day: `${Number(s.date.slice(5, 7))}/${Number(s.date.slice(8, 10))}`,
      iso: s.date,
      predicted,
      calendar: m.calendarAge,
      measured: null as number | null,
      bandLow: round1(predicted - half),
      bandSpan: round1(half * 2),
    };
  });

  // 实测值离散点
  for (const m of msAsc) {
    const p = points.find((x) => x.iso === dateOf(m.createdAt));
    if (p) p.measured = m.bioAge;
  }

  const rates = agingRate(measurements);
  const todayPoint = points[points.length - 1];
  const predictedToday = todayPoint?.predicted ?? latest?.bioAge ?? null;
  const calendarAge = latest?.calendarAge ?? null;
  const perDay = rates !== null ? rates / 30 : null;
  const in5y =
    predictedToday !== null && perDay !== null ? round1(predictedToday + perDay * 365 * 5) : null;
  const in10y =
    predictedToday !== null && perDay !== null ? round1(predictedToday + perDay * 365 * 10) : null;
  const calIn5 = calendarAge !== null ? calendarAge + 5 : null;
  const calIn10 = calendarAge !== null ? calendarAge + 10 : null;

  // 里程碑预测日：按目前老化速率，生理年龄追上日历年龄的日期（PRD 5.1）
  let milestone: string | null = null;
  if (predictedToday !== null && calendarAge !== null && perDay !== null && perDay < 0) {
    const delta = predictedToday - calendarAge;
    if (delta > 0) {
      const days = Math.ceil(delta / -perDay);
      const target = new Date(Date.now() + days * 86400000);
      milestone = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
        year: "numeric",
        month: "long",
      }).format(target);
    } else {
      milestone = t.trends.milestoneReached;
    }
  }

  const ages = points.flatMap((p) => [p.predicted, p.calendar]);
  const domain: [number, number] = [
    Math.floor(Math.min(...ages) - 1),
    Math.ceil(Math.max(...ages) + 1),
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{t.trends.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{t.trends.sub}</p>
      </header>

      {/* 双线年龄曲线 */}
      <Card className="p-5">
        <SectionTitle
          title={t.trends.chartTitle}
          sub={t.trends.chartSub}
          right={
            predictedToday !== null && calendarAge !== null ? (
              <Badge tone={predictedToday <= calendarAge ? "positive" : "negative"}>
                {f(t.trends.predictedBadge, {
                  age: fmt1(predictedToday),
                  unit: t.common.years,
                })}
              </Badge>
            ) : undefined
          }
        />
        <TrendChart data={points} domain={domain} />
      </Card>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400">{t.trends.agingRate}</p>
          <p
            className={
              rates === null
                ? "text-xl font-bold tabular-nums text-slate-400"
                : rates <= 0
                  ? "text-xl font-bold tabular-nums text-emerald-600"
                  : "text-xl font-bold tabular-nums text-amber-600"
            }
          >
            {rates === null ? "—" : `${rates > 0 ? "+" : ""}${fmt1(rates)}`}
            <span className="ml-1 text-xs font-normal text-slate-400">
              {t.common.perMonth}
            </span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">{t.trends.todayPredicted}</p>
          <p className="text-xl font-bold tabular-nums text-slate-900">
            {predictedToday !== null ? fmt1(predictedToday) : "—"}
            <span className="ml-1 text-xs font-normal text-slate-400">{t.common.years}</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">{t.trends.deltaAge}</p>
          <p
            className={
              predictedToday !== null && calendarAge !== null
                ? `text-xl font-bold tabular-nums ${
                    predictedToday <= calendarAge ? "text-emerald-600" : "text-amber-600"
                  }`
                : "text-xl font-bold tabular-nums text-slate-400"
            }
          >
            {predictedToday !== null && calendarAge !== null
              ? `${predictedToday - calendarAge > 0 ? "+" : ""}${fmt1(predictedToday - calendarAge)}`
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-400">{t.common.years}</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">{t.trends.milestone}</p>
          <p className="text-sm font-semibold leading-6 text-slate-900">
            {milestone === null
              ? t.trends.milestoneNeedTwo
              : milestone === t.trends.milestoneReached
                ? milestone
                : f(t.trends.milestoneCatchUp, { date: milestone })}
          </p>
        </Card>
      </div>

      {/* 基线预测（PRD 5.1：若维持当前习惯） */}
      <Card className="p-5">
        <SectionTitle title={t.trends.baselineTitle} sub={t.trends.baselineSub} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">{t.trends.in5y}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900">
                {in5y !== null ? fmt1(in5y) : "—"}
              </span>
              <span className="text-sm text-slate-400">
                {f(t.trends.predictedVsCalendar, { age: calIn5 ?? "—" })}
              </span>
            </div>
            {in5y !== null && calIn5 !== null && (
              <p className="mt-1 text-xs text-emerald-600">
                {in5y <= calIn5
                  ? f(t.trends.keepAdvantage, { n: fmt1(calIn5 - in5y) })
                  : f(t.trends.fallBehind, { n: fmt1(in5y - calIn5) })}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">{t.trends.in10y}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900">
                {in10y !== null ? fmt1(in10y) : "—"}
              </span>
              <span className="text-sm text-slate-400">
                {f(t.trends.predictedVsCalendar, { age: calIn10 ?? "—" })}
              </span>
            </div>
            {in10y !== null && calIn10 !== null && (
              <p className="mt-1 text-xs text-emerald-600">
                {in10y <= calIn10
                  ? f(t.trends.keepAdvantage, { n: fmt1(calIn10 - in10y) })
                  : f(t.trends.fallBehind, { n: fmt1(in10y - calIn10) })}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          {t.trends.baselineFootnote}
        </p>
      </Card>

      {/* 场景模拟器（V1.1 付费点，先占位） */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-500">
            {t.trends.simulatorTitle}
          </span>
          <Badge>{t.trends.simulatorBadge}</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {t.trends.simulatorDesc}
        </p>
      </div>
    </div>
  );
}