"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfileAction } from "@/lib/actions";
import type { Gender, Goal } from "@/lib/domain";
import { GOAL_LABELS, calendarAge } from "@/lib/domain";
import { saveGuestProfile } from "@/lib/guest";
import { Button, Card, cn } from "@/components/ui";

const GOALS: { key: Goal; desc: string }[] = [
  { key: "understand", desc: "「我的身体到底还好吗？现在改还来得及吗？」" },
  { key: "improve", desc: "已有运动习惯，想科学量化训练效果，看见变年轻" },
  { key: "prevent", desc: "指标临界或有家族史，需要可执行的非药物干预路径" },
];

export function BasicInfoForm({ guest = false }: { guest?: boolean }) {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(65);
  const [goal, setGoal] = useState<Goal>("improve");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onNext() {
    setSaving(true);
    setError("");
    if (guest) {
      // 游客模式：本地校验后暂存，直接进入快测
      const age = calendarAge(birthDate);
      if (age < 18 || age > 100) {
        setError("年龄需在 18–100 岁之间");
        setSaving(false);
        return;
      }
      saveGuestProfile({ birthDate, gender, heightCm, weightKg, goal });
      router.push("/onboarding/quick-test");
      return;
    }
    const res = await saveProfileAction({ birthDate, gender, heightCm, weightKg, goal });
    if (res.ok) router.push("/onboarding/quick-test");
    else {
      setError(res.error);
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">首次使用 · 步骤 1/3</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">先认识一下你</h1>
      <p className="mt-2 text-sm text-slate-500">
        这些信息用于计算你的日历年龄与体成分维度，仅自己可见。
      </p>
      {guest && (
        <p className="mt-1 text-xs text-emerald-600">
          游客模式 · 无需注册，完成快测后可再决定是否保存结果
        </p>
      )}

      <Card className="mt-6 flex-1 space-y-6 p-5 sm:p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">出生日期</label>
          <input
            type="date"
            value={birthDate}
            max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().slice(0, 10)}
            min="1926-01-01"
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">性别</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([["male", "男"], ["female", "女"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setGender(key)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  gender === key
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              身高 <span className="ml-1 tabular-nums text-emerald-600">{heightCm} cm</span>
            </label>
            <input
              type="range"
              min={100}
              max={220}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              体重 <span className="ml-1 tabular-nums text-emerald-600">{weightKg} kg</span>
            </label>
            <input
              type="range"
              min={30}
              max={200}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">你的目标（三选一）</label>
          <div className="mt-2 space-y-2">
            {GOALS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left transition-colors",
                  goal === g.key
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{GOAL_LABELS[g.key]}</span>
                  {goal === g.key && (
                    <span className="text-xs font-medium text-emerald-600">已选</span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-amber-600">{error}</p>}
      </Card>

      <Button onClick={onNext} disabled={saving} className="mt-5 w-full py-3 text-base">
        {saving ? "保存中…" : "下一步：首次快测"}
      </Button>
    </main>
  );
}
