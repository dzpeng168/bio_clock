import { FlameIcon, TrophyIcon } from "@/components/icons";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { fmt1 } from "@/lib/domain";
import {
  getActivePlan,
  getBadges,
  getDailySummaries,
  getLatestMeasurement,
  getStreak,
} from "@/lib/data/queries";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).plan.title };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const f = interpolate;
  const [planKeys, badges, streak, m, summaries] = await Promise.all([
    getActivePlan(),
    getBadges(),
    getStreak(),
    getLatestMeasurement(),
    getDailySummaries(7),
  ]);

  const worst = m ? [...m.dimensions].sort((a, b) => b.offset - a.offset)[0] : null;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{t.plan.title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{t.plan.sub}</p>
      </header>

      {/* 连续记账 */}
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <FlameIcon className="size-6" />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {f(t.plan.streakValue, { n: streak })}
          </p>
          <p className="text-xs text-slate-400">{t.plan.streakDesc}</p>
        </div>
      </Card>

      {/* 当前干预计划 */}
      <Card className="p-5">
        <SectionTitle
          title={t.plan.currentTitle}
          sub={
            worst
              ? f(t.plan.currentSubWeakest, {
                  dimension: t.domain.dimensions[worst.key],
                })
              : t.plan.currentSubEmpty
          }
        />
        {planKeys && planKeys.length > 0 ? (
          <ul className="space-y-3">
            {planKeys.map((key) => {
              const done = summaries.filter(
                (s) => s.positiveKeys.includes(key) || s.negativeKeys.includes(key)
              ).length;
              return (
                <li key={key} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {t.domain.behaviors[key as keyof typeof t.domain.behaviors]?.label ?? key}
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">
                      {f(t.plan.last7, { n: done })}
                    </span>
                  </div>
                  <div className="mt-2.5 flex gap-1">
                    {Array.from({ length: 7 }, (_, i) => {
                      const s = summaries[i];
                      const hit = s
                        ? s.positiveKeys.includes(key) || s.negativeKeys.includes(key)
                        : false;
                      return (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${hit ? "bg-emerald-500" : "bg-slate-100"}`}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-emerald-600">{t.plan.planImprove}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">{t.plan.planEmpty}</p>
        )}
      </Card>

      {/* 徽章墙 */}
      <Card className="p-5">
        <SectionTitle title={t.plan.badgesTitle} sub={t.plan.badgesSub} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {t.plan.badges.map((b) => {
            const earned = badges.includes(b.key);
            return (
              <div
                key={b.key}
                className={`rounded-xl border p-3.5 text-center ${
                  earned
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-slate-50/50 opacity-60"
                }`}
              >
                <span
                  className={`mx-auto flex size-10 items-center justify-center rounded-xl ${
                    earned ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <TrophyIcon className="size-5" />
                </span>
                <p className="mt-2 text-sm font-medium text-slate-900">{b.label}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{b.desc}</p>
                {earned && (
                  <Badge tone="positive" className="mt-1.5">
                    {t.plan.earned}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        {m && (
          <p className="mt-4 text-xs text-slate-400">
            {f(t.plan.nextBadge, {
              delta: fmt1(m.delta),
              unit: t.common.years,
              badge:
                m.delta <= -3
                  ? t.plan.badges[2].label
                  : m.delta <= -1
                    ? t.plan.badges[1].label
                    : t.plan.badges[0].label,
            })}
          </p>
        )}
      </Card>
    </div>
  );
}