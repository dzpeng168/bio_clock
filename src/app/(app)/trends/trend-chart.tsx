"use client";

// 双线年龄曲线：实测离散点 + 预测连续线 + 半透明预测带（PRD 5.1）
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  day: string; // M/D
  iso: string; // YYYY-MM-DD
  predicted: number;
  calendar: number;
  measured: number | null;
  bandLow: number;
  bandSpan: number;
}

export function TrendChart({
  data,
  domain,
}: {
  data: TrendPoint[];
  domain: [number, number];
}) {
  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as TrendPoint;
              return (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                  <p className="mb-1 font-medium text-slate-500">{label}</p>
                  <p className="text-emerald-600">预测生理年龄 {p.predicted.toFixed(1)} 岁</p>
                  <p className="text-slate-400">日历年龄 {p.calendar} 岁</p>
                  {p.measured !== null && (
                    <p className="mt-0.5 font-medium text-slate-800">
                      实测 {p.measured.toFixed(1)} 岁
                    </p>
                  )}
                </div>
              );
            }}
          />
          {/* 预测区间（半透明带，随时间展宽） */}
          <Area
            dataKey="bandLow"
            stackId="band"
            stroke="none"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            dataKey="bandSpan"
            stackId="band"
            stroke="none"
            fill="#10b981"
            fillOpacity={0.08}
            isAnimationActive={false}
          />
          {/* 日历年龄参考线 */}
          <ReferenceLine
            y={data[0]?.calendar}
            stroke="#cbd5e1"
            strokeDasharray="6 4"
            label={{ value: "日历年龄", position: "insideTopRight", fontSize: 10, fill: "#94a3b8" }}
          />
          {/* 预测轨迹 */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#059669" }}
          />
          {/* 实测值离散点 */}
          <Scatter dataKey="measured" fill="#0f172a" shape="circle" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
