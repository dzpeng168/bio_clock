"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { Measurement } from "@/lib/domain";
import { fmt1 } from "@/lib/domain";

/** 五维雷达图：各维度等效年龄 vs 日历年龄 */
export function DimensionRadar({ m }: { m: Measurement }) {
  const data = m.dimensions.map((d) => ({
    dim: d.label,
    age: d.age,
    calendar: m.calendarAge,
  }));
  const ages = data.flatMap((d) => [d.age, d.calendar]);
  const min = Math.floor(Math.min(...ages) - 2);
  const max = Math.ceil(Math.max(...ages) + 2);

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12, fill: "#64748b" }} />
          <PolarRadiusAxis domain={[min, max]} tick={false} axisLine={false} />
          <Radar
            name="日历年龄"
            dataKey="calendar"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            fill="none"
          />
          <Radar
            name="维度年龄"
            dataKey="age"
            stroke="#059669"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-emerald-500" />
          维度等效年龄
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full border-2 border-dashed border-slate-400" />
          日历年龄 {fmt1(m.calendarAge)} 岁
        </span>
      </div>
    </div>
  );
}
