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

export const dynamic = "force-dynamic";
export const metadata = { title: "计划" };

const BADGES: { key: string; label: string; desc: string }[] = [
  { key: "younger_1", label: "年轻 1 岁", desc: "生理年龄低于日历 1 岁" },
  { key: "younger_3", label: "年轻 3 岁", desc: "生理年龄低于日历 3 岁" },
  { key: "reverse_5", label: "逆转 5 岁", desc: "实测值较首次改善 5 岁" },
  { key: "streak_7", label: "连续 7 天", desc: "日结算连续一周为正" },
  { key: "streak_30", label: "连续 30 天", desc: "日结算连续一月为正" },
];

const BEHAVIOR_LABELS: Record<string, string> = {
  aerobic: "有氧运动",
  strength: "力量训练",
  sleep: "达标睡眠",
  diet: "饮食质量",
  mindfulness: "正念减压",
  water: "足量饮水",
  social: "社交连接",
};

export default async function PlanPage() {
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
        <h1 className="text-xl font-bold text-slate-900">计划</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          短板驱动的干预计划 · 最多同时 3 个进行中行为
        </p>
      </header>

      {/* 连续记账 */}
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <FlameIcon className="size-6" />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-900">{streak} 天</p>
          <p className="text-xs text-slate-400">日结算连续为正，坚持在积累复利</p>
        </div>
      </Card>

      {/* 当前干预计划 */}
      <Card className="p-5">
        <SectionTitle
          title="当前干预计划"
          sub={worst ? `由五维最短板「${worst.label}」驱动` : "完成首次测量后生成"}
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
                      {BEHAVIOR_LABELS[key] ?? key}
                    </span>
                    <span className="text-xs tabular-nums text-slate-500">近 7 天 {done}/7</span>
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
                  <p className="mt-2 text-xs text-emerald-600">坚持 30 天约可改善 0.4 岁</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            还没有进行中的计划，可在完成测量后从推荐中选择。
          </p>
        )}
      </Card>

      {/* 徽章墙 */}
      <Card className="p-5">
        <SectionTitle title="徽章墙" sub="年龄徽章可生成分享海报（V2.0）" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
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
                    已获得
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        {m && (
          <p className="mt-4 text-xs text-slate-400">
            当前 Δ {fmt1(m.delta)} 岁 · 下一个徽章：{m.delta <= -3 ? "逆转 5 岁" : m.delta <= -1 ? "年轻 3 岁" : "年轻 1 岁"}
          </p>
        )}
      </Card>
    </div>
  );
}
