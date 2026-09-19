import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { Card } from "@/components/ui";
import { DIMENSION_WEIGHTS } from "@/lib/bioage";

export const metadata = { title: "算法白皮书" };

const RULES = [
  "各维度先归一化为「维度年龄」：日历年龄 + 行为与指标的偏移量（每维 clamp ±8 岁）",
  "生理年龄 = 日历年龄 + Σ（维度偏移 × 维度权重），保留 1 位小数",
  "硬更新：仅标准测 / 深测可改写实测生理年龄，快测用于基线估算",
  "软轨迹：每日行为净值只移动预测曲线；7 天累计偏差超过 ±0.5 岁时提示复测校准",
  "平滑规则：单次硬更新幅度超过 2 岁时，拆分到 14 天渐变展示",
  "置信区间：快测 ±3 岁 → 标准测 ±2 岁 → 深测 ±1 岁，数据源越少区间越宽",
];

export default function AlgorithmPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="size-4" /> 返回我的
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">算法白皮书</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        V1 采用公开可解释的简化加权框架（体能年龄模型 + PhenoAge 思路），
        随数据积累逐步过渡到个性化回归模型。所有权重与换算规则在此公开，
        算法版本号随测量结果一同展示，保证结果可复现、可追溯。
      </p>

      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold text-slate-900">五维权重</h2>
        <div className="mt-3 space-y-2.5">
          {DIMENSION_WEIGHTS.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-slate-700">{d.label}</span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.weight * 100}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-slate-500">
                {Math.round(d.weight * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">换算规则</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-slate-600">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">数据来源</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          心血管（静息心率等）、代谢（体成分、饮食）、肌肉骨骼（体能微测试）、
          睡眠恢复（时长与规律性）、生活方式（吸烟、饮酒、压力、久坐）。
          网页版 V1 为手动录入；可穿戴自动同步（心率 / 睡眠 / 步数）在 V1.1 接入。
        </p>
      </Card>

      <p className="mt-6 pb-6 text-xs leading-relaxed text-slate-400">
        当前算法版本：v1.0-simplified。本产品并非医疗器械，算法输出仅供健康管理参考，
        不构成诊断或治疗建议。支持第三方模型对照与数据导出复核。
      </p>
    </div>
  );
}
