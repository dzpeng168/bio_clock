"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfileAction } from "@/lib/actions";
import type { Gender, Goal } from "@/lib/domain";
import { calendarAge } from "@/lib/domain";
import { saveGuestProfile } from "@/lib/guest";
import { useI18n } from "@/lib/i18n/client";
import { Button, Card, cn } from "@/components/ui";

const GOALS: Goal[] = ["understand", "improve", "prevent"];

export function BasicInfoForm({ guest = false }: { guest?: boolean }) {
  const router = useRouter();
  const { t, href, goal: goalLabel } = useI18n();
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
        setError(t.onboarding.basicInfo.errAge);
        setSaving(false);
        return;
      }
      saveGuestProfile({ birthDate, gender, heightCm, weightKg, goal });
      router.push(href("/onboarding/quick-test"));
      return;
    }
    const res = await saveProfileAction({ birthDate, gender, heightCm, weightKg, goal });
    if (res.ok) router.push(href("/onboarding/quick-test"));
    else {
      setError(res.error);
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">{t.onboarding.basicInfo.step}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">
        {t.onboarding.basicInfo.title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{t.onboarding.basicInfo.desc}</p>
      {guest && (
        <p className="mt-1 text-xs text-emerald-600">{t.onboarding.guestHint}</p>
      )}

      <Card className="mt-6 flex-1 space-y-6 p-5 sm:p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">
            {t.onboarding.basicInfo.birthDate}
          </label>
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
          <label className="text-sm font-medium text-slate-700">
            {t.onboarding.basicInfo.gender}
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((key) => (
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
                {key === "male" ? t.onboarding.basicInfo.male : t.onboarding.basicInfo.female}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              {t.onboarding.basicInfo.height}{" "}
              <span className="ml-1 tabular-nums text-emerald-600">{heightCm} cm</span>
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
              {t.onboarding.basicInfo.weight}{" "}
              <span className="ml-1 tabular-nums text-emerald-600">{weightKg} kg</span>
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
          <label className="text-sm font-medium text-slate-700">
            {t.onboarding.basicInfo.goalLabel}
          </label>
          <div className="mt-2 space-y-2">
            {GOALS.map((g, i) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left transition-colors",
                  goal === g
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{goalLabel(g)}</span>
                  {goal === g && (
                    <span className="text-xs font-medium text-emerald-600">
                      {t.onboarding.basicInfo.selected}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {t.onboarding.basicInfo.goals[i].desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-amber-600">{error}</p>}
      </Card>

      <Button onClick={onNext} disabled={saving} className="mt-5 w-full py-3 text-base">
        {saving ? t.common.saving : t.onboarding.basicInfo.next}
      </Button>
    </main>
  );
}