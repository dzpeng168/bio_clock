// 测量结果卡：大数字 + Δ 徽章 + 五维雷达 + 短板解读（onboarding 与测量 Tab 复用）
import { DimensionRadar } from "@/components/dimension-radar";
import { Badge, Card, SectionTitle, cn } from "@/components/ui";
import { fmt1, type Measurement } from "@/lib/domain";

const MODE_LABELS = { quick: "快测", standard: "标准测", deep: "深测" } as const;

export function ResultView({ m }: { m: Measurement }) {
  const sorted = [...m.dimensions].sort((a, b) => b.offset - a.offset);
  const weakest = sorted[0];

  return (
    <div className="space-y-4">
      {/* 年龄大数字卡（PRD 3.4） */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-b from-emerald-50/80 to-transparent px-5 pb-6 pt-6 text-center sm:px-8">
          <p className="text-sm text-slate-500">你的身体</p>
          <p className="mt-1 text-6xl font-bold tabular-nums text-slate-900 sm:text-7xl">
            {fmt1(m.bioAge)}
            <span className="ml-2 text-2xl font-semibold text-slate-400">岁</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">日历年龄 {fmt1(m.calendarAge)} 岁</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge tone={m.delta <= 0 ? "positive" : "negative"}>
              {m.delta <= 0
                ? `比同龄人年轻 ${fmt1(Math.abs(m.delta))} 岁`
                : `比同龄人偏老 ${fmt1(m.delta)} 岁`}
            </Badge>
            <Badge>±{fmt1(m.confidence)} 岁 · {MODE_LABELS[m.mode]}</Badge>
          </div>
        </div>
      </Card>

      {/* 五维雷达 */}
      <Card className="p-5 sm:p-6">
        <SectionTitle title="五维雷达" sub="每个维度的等效年龄，一眼看出短板" />
        <DimensionRadar m={m} />
      </Card>

      {/* 可解释归因 */}
      <Card className="p-5 sm:p-6">
        <SectionTitle title="短板解读" sub="拒绝黑盒：结果的主要影响因素" />
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
                <span className="text-sm font-semibold text-slate-900">{d.label}</span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    d.offset > 0.5 ? "text-amber-700" : "text-emerald-700"
                  )}
                >
                  等效 {fmt1(d.age)} 岁
                </span>
              </div>
              <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed text-slate-600">
                {d.reasons.slice(0, 3).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          结果基于 V1 公开可解释的加权模型（{m.algorithmVersion}），数据源越少置信区间越宽，
          诚实呈现精度。每个 30 天建议完成一次标准测校准实测值。
        </p>
      </Card>

      {weakest && weakest.offset > 0.5 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm leading-relaxed text-emerald-900">
          下一步：围绕最短板「{weakest.label}」选择 1–3 个高杠杆行为开始干预，
          每天的正负行为将实时移动你的预测轨迹。
        </div>
      )}
    </div>
  );
}
