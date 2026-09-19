// 今日净值环形图（纯 SVG，服务端渲染）：绿色=健康资产，琥珀=老化负债
import { cn } from "@/components/ui";

export function NetRing({
  asset,
  debt,
  net,
  label,
}: {
  asset: number;
  debt: number;
  net: number;
  label: string;
}) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const scale = Math.max(asset + debt, 10); // 环形满刻度，避免小数值比例失真
  const assetLen = (asset / scale) * C;
  const debtLen = (debt / scale) * C;
  const gapLen = Math.max(C - assetLen - debtLen, 0);

  const tone = net > 0 ? "text-emerald-600" : net < 0 ? "text-amber-600" : "text-slate-600";

  return (
    <div className="relative size-36 shrink-0 sm:size-40">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth={12} />
        {asset > 0 && (
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="#10b981"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={`${assetLen} ${C - assetLen}`}
            strokeDashoffset={0}
          />
        )}
        {debt > 0 && (
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={`${debtLen} ${C - debtLen}`}
            strokeDashoffset={-assetLen - Math.min(gapLen, 6)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold tabular-nums", tone)}>
          {net > 0 ? "+" : ""}
          {net}
        </span>
        <span className="mt-0.5 text-xs text-slate-400">{label}</span>
      </div>
    </div>
  );
}
