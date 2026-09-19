import Link from "next/link";
import { CalendarIcon, FlameIcon } from "@/components/icons";
import { Badge, Card } from "@/components/ui";
import { fmt1, fmtDate, todayKey } from "@/lib/domain";
import {
  getActivePlan,
  getDailySummaries,
  getLatestMeasurement,
  getStreak,
  getTodaySummary,
} from "@/lib/data/queries";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { NetRing } from "./net-ring";
import { TodayBehaviorList } from "./behavior-list";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).today.title };
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export default async function TodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const f = interpolate;
  const date = todayKey();
  const [summary, m, streak, planKeys, summaries] = await Promise.all([
    getTodaySummary(),
    getLatestMeasurement(),
    getStreak(),
    getActivePlan(),
    getDailySummaries(60),
  ]);

  // 预测生理年龄 = 实测值 + 测量日以来每日净值对轨迹的累积影响（PRD 2.2 软更新）
  let predictedAge: number | null = null;
  if (m) {
    const mDate = m.createdAt.slice(0, 10);
    const driftSum = summaries
      .filter((s) => s.date >= mDate)
      .reduce((acc, s) => acc + s.drift, 0);
    predictedAge = round1(m.bioAge + driftSum);
  }

  return (
    <div className="space-y-4">
      {/* 头部：日期 + 年龄状态 */}
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t.today.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{fmtDate(date, locale)}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Badge tone="positive">
              <FlameIcon className="size-3.5" />
              {f(t.today.streakBadge, { n: streak })}
            </Badge>
          )}
          {predictedAge !== null && m && (
            <Badge>
              {f(t.today.predictedBadge, {
                age: fmt1(predictedAge),
                unit: t.common.years,
                delta: fmt1(predictedAge - m.calendarAge),
              })}
            </Badge>
          )}
        </div>
      </header>

      {/* 今日净值环形图 + 日结算（PRD §7 今日 Tab） */}
      <Card className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:gap-8">
        <NetRing
          asset={summary.positive}
          debt={summary.negative}
          net={summary.net}
          label={t.today.netLabel}
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p
            className={
              summary.tone === "positive"
                ? "text-lg font-semibold text-emerald-700"
                : summary.tone === "negative"
                  ? "text-lg font-semibold text-amber-700"
                  : "text-lg font-semibold text-slate-700"
            }
          >
            {t.domain.settlement[summary.settlementKey].title}
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm sm:justify-start">
            <span className="text-emerald-600">
              {f(t.today.healthAsset, { n: summary.positive })}
            </span>
            <span className="text-amber-600">
              {f(t.today.agingDebt, { n: summary.negative })}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {f(t.today.driftHint, {
              delta: `${summary.drift > 0 ? "+" : ""}${summary.drift}`,
            })}
          </p>
          <Link
            href={`/${locale}/report`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <CalendarIcon className="size-4" /> {t.today.reportLink}
          </Link>
        </div>
      </Card>

      {/* 正负行为清单 + 快捷打卡 */}
      <TodayBehaviorList initialSummary={summary} planKeys={planKeys ?? []} />

      {/* 免责声明 */}
      <p className="px-2 text-center text-xs leading-relaxed text-slate-400">
        {t.today.disclaimer}
      </p>
    </div>
  );
}