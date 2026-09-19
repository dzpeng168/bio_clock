import { SparklesIcon } from "@/components/icons";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { agingRate } from "@/lib/bioage";
import { fmt1 } from "@/lib/domain";
import { getDailySummaries, getLatestMeasurement, getMeasurements } from "@/lib/data/queries";
import { TrendChart, type TrendPoint } from "./trend-chart";

export const dynamic = "force-dynamic";
export const metadata = { title: "趋势" };

const round1 = (v: number) => Math.round(v * 10) / 10;

export default async function TrendsPage() {
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
    const anchorDayIdx = anchorIdx >= 0
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
  const in5y = predictedToday !== null && perDay !== null ? round1(predictedToday + perDay * 365 * 5) : null;
  const in10y = predictedToday !== null && perDay !== null ? round1(predictedToday + perDay * 365 * 10) : null;
  const calIn5 = calendarAge !== null ? calendarAge + 5 : null;
  const calIn10 = calendarAge !== null ? calendarAge + 10 : null;

  // 里程碑预测日：按目前老化速率，生理年龄追上日历年龄的日期（PRD 5.1）
  let milestone: string | null = null;
  if (predictedToday !== null && calendarAge !== null && perDay !== null && perDay < 0) {
    const delta = predictedToday - calendarAge;
    if (delta > 0) {
      const days = Math.ceil(delta / -perDay);
      const target = new Date(Date.now() + days * 86400000);
      milestone = `${target.getFullYear()} 年 ${target.getMonth() + 1} 月`;
    } else {
      milestone = "已达成";
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
        <h1 className="text-xl font-bold text-slate-900">趋势</h1>
        <p className="mt-0.5 text-sm text-slate-500">行为积累 → 复测验证的因果关系</p>
      </header>

      {/* 双线年龄曲线 */}
      <Card className="p-5">
        <SectionTitle
          title="生理年龄曲线"
          sub="连续线为预测轨迹 · 实心点为实测值 · 阴影带为预测区间"
          right={
            predictedToday !== null && calendarAge !== null ? (
              <Badge tone={predictedToday <= calendarAge ? "positive" : "negative"}>
                预测 {fmt1(predictedToday)} 岁
              </Badge>
            ) : undefined
          }
        />
        <TrendChart data={points} domain={domain} />
      </Card>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-slate-400">老化速率</p>
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
            <span className="ml-1 text-xs font-normal text-slate-400">岁/30天</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">今日预测年龄</p>
          <p className="text-xl font-bold tabular-nums text-slate-900">
            {predictedToday !== null ? fmt1(predictedToday) : "—"}
            <span className="ml-1 text-xs font-normal text-slate-400">岁</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">Δ 年龄差</p>
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
            <span className="ml-1 text-xs font-normal text-slate-400">岁</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400">里程碑预测日</p>
          <p className="text-sm font-semibold leading-6 text-slate-900">
            {milestone === null ? "复测两次后可预测" : milestone === "已达成" ? "生理年龄已年轻于日历年龄 🎉" : `${milestone}追上日历年龄`}
          </p>
        </Card>
      </div>

      {/* 基线预测（PRD 5.1：若维持当前习惯） */}
      <Card className="p-5">
        <SectionTitle title="基线预测" sub="若维持当前习惯，5 / 10 年后的对比" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">5 年后</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900">
                {in5y !== null ? fmt1(in5y) : "—"}
              </span>
              <span className="text-sm text-slate-400">
                预测 vs 日历 {calIn5 ?? "—"}
              </span>
            </div>
            {in5y !== null && calIn5 !== null && (
              <p className="mt-1 text-xs text-emerald-600">
                {in5y <= calIn5 ? `维持住了 ${fmt1(calIn5 - in5y)} 岁的优势` : `将落后日历年龄 ${fmt1(in5y - calIn5)} 岁`}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">10 年后</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900">
                {in10y !== null ? fmt1(in10y) : "—"}
              </span>
              <span className="text-sm text-slate-400">
                预测 vs 日历 {calIn10 ?? "—"}
              </span>
            </div>
            {in10y !== null && calIn10 !== null && (
              <p className="mt-1 text-xs text-emerald-600">
                {in10y <= calIn10 ? `维持住了 ${fmt1(calIn10 - in10y)} 岁的优势` : `将落后日历年龄 ${fmt1(in10y - calIn10)} 岁`}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          基线预测由近 60 天行为净值外推，仅供动机参考，不构成医学判断。
        </p>
      </Card>

      {/* 场景模拟器（V1.1 付费点，先占位） */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-500">场景模拟器</span>
          <Badge>V1.1 开放</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          拖动滑块模拟「戒烟」「每天走 8000 步」「23 点前睡」，即时查看 1 / 5 年后的生理年龄变化。
        </p>
      </div>
    </div>
  );
}
