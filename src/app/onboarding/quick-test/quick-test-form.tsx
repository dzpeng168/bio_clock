"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitTestAction } from "@/lib/actions";
import { computeBioAge } from "@/lib/bioage";
import type { MeasureMode, PhysicalTests, QuickTestAnswers } from "@/lib/domain";
import { readGuestProfile, saveGuestResult } from "@/lib/guest";
import { ArrowLeftIcon } from "@/components/icons";
import { Button, Card, cn } from "@/components/ui";

/** 多步问卷表单（onboarding 首次快测与测量 Tab 复用） */
export function QuickTestForm({
  mode,
  redirectTo,
  stepLabel,
  guest = false,
}: {
  mode: MeasureMode;
  redirectTo: string;
  stepLabel?: string;
  guest?: boolean;
}) {
  const router = useRouter();
  const standard = mode === "standard";
  const [step, setStep] = useState(0);
  const [a, setA] = useState<QuickTestAnswers>({
    restingHr: 68,
    sleepHours: 7,
    sleepRegularity: 3,
    aerobicDays: 2,
    strengthDays: 1,
    sittingHours: 8,
    smoking: false,
    drinking: 1,
    dietQuality: 3,
    stress: 3,
  });
  const [t, setT] = useState<PhysicalTests>({
    gripKg: 35,
    chairStand30s: 15,
    singleLegBalanceS: 15,
    walkSpeedMs: 1.2,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const steps: { title: string; desc: string }[] = [
    { title: "静息心率", desc: "晨起未活动时测量，或参考可穿戴设备 7 天均值" },
    { title: "睡眠", desc: "过去一周的平均情况" },
    { title: "运动", desc: "当前每周的规律运动次数" },
    { title: "久坐", desc: "工作日的日均久坐时长" },
    { title: "生活方式", desc: "吸烟、饮酒、饮食与压力自评" },
    ...(standard
      ? [
          {
            title: "体能微测试",
            desc: "四项 30 秒内可完成的测试（找不到可跳过）",
          },
        ]
      : []),
  ];
  const isLast = step === steps.length - 1;

  async function onSubmit() {
    setSubmitting(true);
    setError("");
    if (guest) {
      // 游客模式：读取本机暂存的基础信息，本地计算并暂存结果
      const profile = readGuestProfile();
      if (!profile) {
        router.push("/onboarding/basic-info");
        return;
      }
      const result = computeBioAge(profile, a, standard ? t : undefined, mode);
      saveGuestResult({ ...result, id: "guest", createdAt: new Date().toISOString() });
      router.push(redirectTo);
      return;
    }
    const res = await submitTestAction({
      answers: a,
      tests: standard ? t : undefined,
      mode,
      redirectTo,
    });
    if (!res.ok) {
      setError(res.error);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-8 sm:py-12">
      {stepLabel ? (
        <p className="text-sm font-medium text-emerald-600">{stepLabel}</p>
      ) : (
        <button
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="size-4" /> 返回
        </button>
      )}
      <h1 className="text-2xl font-bold text-slate-900">
        {standard ? "标准测" : "首次快测"}
      </h1>
      {guest && (
        <p className="mt-1 text-xs text-emerald-600">游客模式 · 结果暂存本机，登录后可保存</p>
      )}

      {/* 进度条 */}
      <div className="mt-4 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-emerald-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <Card className="mt-6 flex-1 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">{steps[step].title}</h2>
        <p className="mt-1 text-sm text-slate-500">{steps[step].desc}</p>

        <div className="mt-6 space-y-6">
          {step === 0 && (
            <NumberField
              label="静息心率"
              unit="bpm"
              value={a.restingHr}
              min={40}
              max={110}
              onChange={(v) => setA({ ...a, restingHr: v })}
            />
          )}

          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  日均睡眠时长{" "}
                  <span className="ml-1 tabular-nums text-emerald-600">{a.sleepHours} 小时</span>
                </label>
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={0.5}
                  value={a.sleepHours}
                  onChange={(e) => setA({ ...a, sleepHours: Number(e.target.value) })}
                  className="mt-3 w-full accent-emerald-600"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>4h</span>
                  <span>7–9h 达标</span>
                  <span>10h</span>
                </div>
              </div>
              <Segmented
                label="作息规律性"
                value={a.sleepRegularity}
                items={["很不规律", "较不规律", "一般", "较规律", "很规律"]}
                onChange={(v) => setA({ ...a, sleepRegularity: v })}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Chips
                label="每周有氧运动次数（≥30 分钟中等强度）"
                max={7}
                value={a.aerobicDays}
                onChange={(v) => setA({ ...a, aerobicDays: v })}
              />
              <Chips
                label="每周力量训练次数（≥20 分钟）"
                max={7}
                value={a.strengthDays}
                onChange={(v) => setA({ ...a, strengthDays: v })}
              />
            </>
          )}

          {step === 3 && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                日均久坐时长{" "}
                <span className="ml-1 tabular-nums text-emerald-600">{a.sittingHours} 小时</span>
              </label>
              <input
                type="range"
                min={2}
                max={14}
                value={a.sittingHours}
                onChange={(e) => setA({ ...a, sittingHours: Number(e.target.value) })}
                className="mt-3 w-full accent-emerald-600"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>2h</span>
                <span>&gt;8h 开始扣分</span>
                <span>14h</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">吸烟</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([["否", false], ["是", true]] as const).map(([label, val]) => (
                    <button
                      key={label}
                      onClick={() => setA({ ...a, smoking: val })}
                      className={cn(
                        "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                        a.smoking === val
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Segmented
                label="饮酒频率"
                value={a.drinking}
                items={["从不", "偶尔", "每周", "几乎每天"]}
                onChange={(v) => setA({ ...a, drinking: v })}
              />
              <Segmented
                label="饮食质量自评"
                value={a.dietQuality}
                items={["外卖为主", "偏外卖", "均衡", "偏健康", "蔬果全谷"]}
                onChange={(v) => setA({ ...a, dietQuality: v })}
              />
              <Segmented
                label="压力自评"
                value={a.stress}
                items={["很低", "较低", "中等", "较高", "很高"]}
                onChange={(v) => setA({ ...a, stress: v })}
              />
            </>
          )}

          {step === 5 && standard && (
            <>
              <NumberField
                label="握力（握力计或手机握力传感器）"
                unit="kg"
                value={t.gripKg ?? 35}
                min={10}
                max={80}
                onChange={(v) => setT({ ...t, gripKg: v })}
              />
              <NumberField
                label="30 秒坐站次数"
                unit="次"
                value={t.chairStand30s ?? 15}
                min={5}
                max={30}
                onChange={(v) => setT({ ...t, chairStand30s: v })}
              />
              <NumberField
                label="单腿闭眼站立"
                unit="秒"
                value={t.singleLegBalanceS ?? 15}
                min={2}
                max={60}
                onChange={(v) => setT({ ...t, singleLegBalanceS: v })}
              />
              <NumberField
                label="6 米步速"
                unit="m/s"
                value={t.walkSpeedMs ?? 1.2}
                min={0.5}
                max={2.5}
                step={0.1}
                onChange={(v) => setT({ ...t, walkSpeedMs: v })}
              />
            </>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-amber-600">{error}</p>}
      </Card>

      <div className="mt-5 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 py-3">
            上一步
          </Button>
        )}
        {isLast ? (
          <Button onClick={onSubmit} disabled={submitting} className="flex-[2] py-3 text-base">
            {submitting ? "计算中…" : "提交并查看结果"}
          </Button>
        ) : (
          <Button onClick={() => setStep(step + 1)} className="flex-[2] py-3 text-base">
            下一步
          </Button>
        )}
      </div>
    </main>
  );
}

/* ---------- 表单原子 ---------- */

function NumberField({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="size-11 shrink-0 rounded-xl border border-slate-300 text-lg text-slate-600 hover:bg-slate-50"
          aria-label="减少"
        >
          −
        </button>
        <div className="flex flex-1 items-baseline justify-center gap-1.5">
          <span className="text-3xl font-bold tabular-nums text-slate-900">{value}</span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="size-11 shrink-0 rounded-xl border border-slate-300 text-lg text-slate-600 hover:bg-slate-50"
          aria-label="增加"
        >
          +
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-emerald-600"
      />
    </div>
  );
}

function Segmented({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: number;
  items: string[];
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div
        className={cn(
          "mt-2 grid gap-1.5",
          items.length === 4 ? "grid-cols-4" : "grid-cols-5"
        )}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn(
              "truncate rounded-xl border px-1 py-2 text-xs font-medium transition-colors sm:text-sm",
              value === i
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            )}
            title={item}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chips({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-2 grid grid-cols-8 gap-1.5">
        {Array.from({ length: max + 1 }, (_, i) => i).map((i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn(
              "rounded-xl border py-2 text-sm font-medium tabular-nums transition-colors",
              value === i
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
