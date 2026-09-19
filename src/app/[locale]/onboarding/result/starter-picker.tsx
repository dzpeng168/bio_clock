"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePlanAction } from "@/lib/actions";
import type { BehaviorDef } from "@/lib/domain";
import { useI18n } from "@/lib/i18n/client";
import { CheckIcon } from "@/components/icons";
import { Button, Card, SectionTitle, cn } from "@/components/ui";

/** 选择 3 个启动行为（PRD 用户旅程步骤 6：只推荐高杠杆 + 低门槛项） */
export function StarterPicker({ recommendations }: { recommendations: BehaviorDef[] }) {
  const router = useRouter();
  const { t, href, f, behavior } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : prev.length < 3 ? [...prev, key] : prev
    );
  }

  async function onDone() {
    setSaving(true);
    setError("");
    const res = await savePlanAction(selected);
    if (res.ok) router.push(href("/today"));
    else {
      setError(res.error);
      setSaving(false);
    }
  }

  return (
    <Card className="mt-4 p-5 sm:p-6">
      <SectionTitle
        title={t.onboarding.starter.title}
        sub={f(t.onboarding.starter.sub, { n: selected.length })}
      />
      <div className="space-y-2">
        {recommendations.map((b) => {
          const def = behavior(b.key);
          const active = selected.includes(b.key);
          return (
            <button
              key={b.key}
              onClick={() => toggle(b.key)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                active
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {active && <CheckIcon className="size-3.5" />}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{def.label}</span>
                  <span className="text-xs font-medium text-emerald-600">
                    {f(t.onboarding.starter.perDay, { n: b.score })}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {def.criteria} · {def.mechanism}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-amber-600">{error}</p>}
      <Button onClick={onDone} disabled={saving} className="mt-4 w-full py-3 text-base">
        {saving ? t.common.saving : t.onboarding.starter.cta}
      </Button>
      <button
        onClick={() => router.push(href("/today"))}
        className="mt-2 w-full py-2 text-center text-sm text-slate-400 hover:text-slate-600"
      >
        {t.onboarding.starter.skip}
      </button>
    </Card>
  );
}