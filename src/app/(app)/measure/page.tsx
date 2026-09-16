import Link from "next/link";
import {
  ActivityIcon,
  ChevronRightIcon,
  FileTextIcon,
  ZapIcon,
} from "@/components/icons";
import { Badge, Card, SectionTitle, buttonLinkStyles, cn } from "@/components/ui";
import { fmt1, GOAL_LABELS } from "@/lib/domain";
import { getMeasurements, getProfile } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "测量" };

const MODE_META = {
  quick: { label: "快测", time: "3 分钟" },
  standard: { label: "标准测", time: "10 分钟" },
  deep: { label: "深测", time: "上传即得" },
} as const;

export default async function MeasurePage() {
  const [measurements, profile] = await Promise.all([
    getMeasurements(20),
    getProfile(),
  ]);
  const last = measurements[0] ?? null;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">测量</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {profile
            ? `日历年龄 ${new Date().getFullYear() - Number(profile.birthDate.slice(0, 4))} 岁 · ${GOAL_LABELS[profile.goal]}`
            : "生理年龄测量引擎"}
        </p>
      </header>

      {/* 上次结果卡 */}
      {last ? (
        <Card className="p-5">
          <SectionTitle
            title="上次结果"
            sub={new Date(last.createdAt).toLocaleDateString("zh-CN", {
              month: "long",
              day: "numeric",
            }) + " · " + MODE_META[last.mode].label}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold tabular-nums text-slate-900">
                {fmt1(last.bioAge)}
                <span className="ml-1 text-lg font-semibold text-slate-400">岁</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                日历年龄 {fmt1(last.calendarAge)} 岁 · ±{fmt1(last.confidence)} 岁
              </p>
            </div>
            <Badge tone={last.delta <= 0 ? "positive" : "negative"}>
              {last.delta <= 0
                ? `年轻 ${fmt1(Math.abs(last.delta))} 岁`
                : `偏老 ${fmt1(last.delta)} 岁`}
            </Badge>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            建议每 30 天完成一次标准测校准实测值；每日行为只移动预测轨迹。
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-sm text-slate-500">还没有测量记录，从快测开始。</Card>
      )}

      {/* 三种测量模式入口（PRD 3.1 阶梯式设计） */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/measure/quick"
          className="group rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 transition-colors hover:border-emerald-400"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ZapIcon className="size-5" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-900">快测</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            3 分钟 · 生活方式问卷，建立基线估算（每 7 天）
          </p>
        </Link>
        <Link
          href="/measure/standard"
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-emerald-400"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-700 text-white">
            <ActivityIcon className="size-5" />
          </span>
          <h3 className="mt-3 flex items-center gap-2 font-semibold text-slate-900">
            标准测
            <Badge tone="brand">硬更新</Badge>
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            10 分钟 · 加入体能微测试，唯一可改写实测值（每 30 天）
          </p>
        </Link>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5 opacity-70">
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-300 text-white">
            <FileTextIcon className="size-5" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-500">深测</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            上传体检报告 OCR · V2.0 开放
          </p>
        </div>
      </div>

      {/* 历史测量记录 */}
      <Card className="p-5">
        <SectionTitle title="历史记录" sub="实测生理年龄只被标准测 / 深测硬更新" />
        {measurements.length === 0 ? (
          <p className="text-sm text-slate-400">暂无记录</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {measurements.map((m, i) => {
              const prev = measurements[i + 1];
              const diff = prev ? m.bioAge - prev.bioAge : null;
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {MODE_META[m.mode].label} · {fmt1(m.bioAge)} 岁
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString("zh-CN")} · ±{fmt1(m.confidence)} 岁
                    </p>
                  </div>
                  {diff !== null && (
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        diff < 0 ? "text-emerald-600" : diff > 0 ? "text-amber-600" : "text-slate-400"
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
        <Link href="/trends" className={`${buttonLinkStyles.outline} text-sm`}>
          查看趋势曲线 <ChevronRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
