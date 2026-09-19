"use client";

// 正负行为清单 + 快捷打卡（PRD §7：3 秒内可完成一次打卡）
import { useState, useTransition } from "react";
import { toggleBehaviorAction } from "@/lib/actions";
import {
  NEGATIVE_BEHAVIORS,
  POSITIVE_BEHAVIORS,
  type DailySummary,
} from "@/lib/domain";
import { CheckIcon, SparklesIcon } from "@/components/icons";
import { Badge, Card, SectionTitle, cn } from "@/components/ui";

export function TodayBehaviorList({
  initialSummary,
  planKeys,
}: {
  initialSummary: DailySummary;
  planKeys: string[];
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ key: string; score: number } | null>(null);

  function toggle(key: string) {
    if (busyKey) return;
    setBusyKey(key);
    startTransition(async () => {
      const next = await toggleBehaviorAction(key);
      setSummary(next);
      const def = [...POSITIVE_BEHAVIORS, ...NEGATIVE_BEHAVIORS].find((b) => b.key === key);
      const wasDone =
        next.positiveKeys.includes(key) || next.negativeKeys.includes(key);
      if (def && wasDone) {
        setFlash({ key, score: def.score });
        setTimeout(() => setFlash(null), 1500);
      }
      setBusyKey(null);
    });
  }

  const done = (key: string) =>
    summary.positiveKeys.includes(key) || summary.negativeKeys.includes(key);

  const anyNegative = summary.negativeKeys.length > 0;
  const remedies = NEGATIVE_BEHAVIORS.filter((b) => summary.negativeKeys.includes(b.key));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 正向分支：健康资产 */}
      <Card className="p-5">
        <SectionTitle
          title="健康资产"
          sub="正向行为分支"
          right={<Badge tone="positive">+{summary.positive}</Badge>}
        />
        <ul className="space-y-2">
          {POSITIVE_BEHAVIORS.map((b) => (
            <li key={b.key}>
              <CheckInItem
                label={b.label}
                criteria={b.criteria}
                score={b.score}
                direction={1}
                inPlan={planKeys.includes(b.key)}
                active={done(b.key)}
                disabled={pending && busyKey === b.key}
                flashing={flash?.key === b.key}
                onClick={() => toggle(b.key)}
              />
            </li>
          ))}
        </ul>
      </Card>

      {/* 负向分支：老化负债 */}
      <Card className="p-5">
        <SectionTitle
          title="老化负债"
          sub="负向行为分支"
          right={<Badge tone="negative">−{summary.negative}</Badge>}
        />
        <ul className="space-y-2">
          {NEGATIVE_BEHAVIORS.map((b) => (
            <li key={b.key}>
              <CheckInItem
                label={b.label}
                criteria={b.criteria}
                score={b.score}
                direction={-1}
                active={done(b.key)}
                disabled={pending && busyKey === b.key}
                flashing={flash?.key === b.key}
                onClick={() => toggle(b.key)}
              />
            </li>
          ))}
        </ul>
        {/* 负反馈必带挽回方案（PRD 4.1.3） */}
        {anyNegative && remedies.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-800">
            <p className="mb-1.5 font-semibold">挽回方案</p>
            <ul className="list-inside list-disc space-y-1">
              {remedies
                .filter((r) => r.remedy)
                .map((r) => (
                  <li key={r.key}>
                    <span className="font-medium">{r.label}：</span>
                    {r.remedy}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 即时反馈动效 */}
      {flash && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center lg:bottom-10">
          <div className="animate-[fade-up_1.4s_ease-out_forwards] rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
            <span className="inline-flex items-center gap-1.5">
              <SparklesIcon className="size-4" />
              {flash.score > 0 ? `+${flash.score} · 今天年轻一点点` : `${flash.score} · 明天可以追回`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckInItem({
  label,
  criteria,
  score,
  direction,
  inPlan,
  active,
  disabled,
  flashing,
  onClick,
}: {
  label: string;
  criteria: string;
  score: number;
  direction: 1 | -1;
  inPlan?: boolean;
  active: boolean;
  disabled: boolean;
  flashing: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
        active
          ? direction === 1
            ? "border-emerald-300 bg-emerald-50/60"
            : "border-amber-300 bg-amber-50/60"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
        flashing && "scale-[1.02]",
        disabled && "opacity-60"
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
          active
            ? direction === 1
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-amber-500 bg-amber-500 text-white"
            : "border-slate-200 bg-slate-50 text-slate-300"
        )}
      >
        {active ? <CheckIcon className="size-4" /> : "+"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          {inPlan && (
            <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
              计划中
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs text-slate-400">{criteria}</span>
      </span>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          direction === 1 ? "text-emerald-600" : "text-amber-600",
          !active && "opacity-40"
        )}
      >
        {direction === 1 ? "+" : "−"}
        {score}
      </span>
    </button>
  );
}
