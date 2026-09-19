"use client";

// 测量结果卡：大数字 + Δ 徽章 + 五维雷达 + 短板解读（onboarding 与测量 Tab 复用）
import { DimensionRadar } from "@/components/dimension-radar";
import { Badge, Card, SectionTitle, cn } from "@/components/ui";
import { fmt1, type Measurement } from "@/lib/domain";
import { useI18n } from "@/lib/i18n/client";

export function ResultView({ m }: { m: Measurement }) {
  const { t, f, reason, dimension } = useI18n();
  const sorted = [...m.dimensions].sort((a, b) => b.offset - a.offset);
  const weakest = sorted[0];

  return (
    <div className="space-y-4">
      {/* 年龄大数字卡（PRD 3.4） */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-b from-emerald-50/80 to-transparent px-5 pb-6 pt-6 text-center sm:px-8">
          <p className="text-sm text-slate-500">{t.result.bodyLabel}</p>
          <p className="mt-1 text-6xl font-bold tabular-nums text-slate-900 sm:text-7xl">
            {fmt1(m.bioAge)}
            <span className="ml-2 text-2xl font-semibold text-slate-400">
              {t.result.yearsUnit}
            </span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {f(t.result.calendarLine, { age: fmt1(m.calendarAge) })}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge tone={m.delta <= 0 ? "positive" : "negative"}>
              {m.delta <= 0
                ? f(t.result.youngerBadge, { n: fmt1(Math.abs(m.delta)) })
                : f(t.result.olderBadge, { n: fmt1(m.delta) })}
            </Badge>
            <Badge>
              {f(t.result.confidenceBadge, {
                conf: fmt1(m.confidence),
                mode: t.result.modeLabels[m.mode],
              })}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 五维雷达 */}
      <Card className="p-5 sm:p-6">
        <SectionTitle title={t.result.radarTitle} sub={t.result.radarSub} />
        <DimensionRadar m={m} />
      </Card>

      {/* 可解释归因 */}
      <Card className="p-5 sm:p-6">
        <SectionTitle title={t.result.reasonsTitle} sub={t.result.reasonsSub} />
        <div className="space-y-3">
          {sorted.slice(0, 3).map((d) => (
            <div
              key={d.key}
              className={cn(
                "rounded-xl border p-3.5",
                d.offset > 0.5
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-emerald-200 bg-emerald-50/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {dimension(d.key)}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    d.offset > 0.5 ? "text-amber-700" : "text-emerald-700"
                  )}
                >
                  {f(t.result.equivalentAge, { age: fmt1(d.age) })}
                </span>
              </div>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed text-slate-600">
                {d.reasons.slice(0, 3).map((r, i) => (
                  <li key={i}>{reason(r)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          {f(t.result.footnote, { version: m.algorithmVersion })}
        </p>
      </Card>

      {weakest && weakest.offset > 0.5 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm leading-relaxed text-emerald-900">
          {f(t.result.nextStep, { dimension: dimension(weakest.key) })}
        </div>
      )}
    </div>
  );
}