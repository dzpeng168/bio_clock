"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recommendStarters, type Measurement } from "@/lib/domain";
import { readGuestResult } from "@/lib/guest";
import { useI18n } from "@/lib/i18n/client";
import { ResultView } from "@/components/result-view";
import { Card, SectionTitle } from "@/components/ui";

/** 游客模式结果页：读取本机暂存结果 + 登录保存引导 */
export function GuestResult() {
  const { t, href, f, behavior } = useI18n();
  const r = t.onboarding.result;
  const [m, setM] = useState<Measurement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setM(readGuestResult());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!m) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">{r.noResultTitle}</h1>
        <p className="mt-2 text-sm text-slate-500">{r.noResultDesc}</p>
        <Link
          href={href("/onboarding/quick-test")}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          {r.noResultCta}
        </Link>
      </main>
    );
  }

  const recommendations = recommendStarters(m.dimensions);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">{r.step}</p>
      <h1 className="mt-1 mb-6 text-2xl font-bold text-slate-900">
        {m.delta <= 0 ? r.headingPositive : r.headingNeutral}
      </h1>
      <ResultView m={m} />

      <Card className="mt-4 p-5 sm:p-6">
        <SectionTitle title={r.saveTitle} sub={r.saveSub} />
        <div className="space-y-2">
          {recommendations.map((b) => {
            const def = behavior(b.key);
            return (
              <div key={b.key} className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{def.label}</span>
                  <span className="text-xs font-medium text-emerald-600">
                    {f(t.onboarding.starter.perDay, { n: b.score })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  {def.criteria} · {def.mechanism}
                </p>
              </div>
            );
          })}
        </div>
        <Link
          href={href("/login")}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          {r.saveCta}
        </Link>
        <p className="mt-3 text-center text-xs text-slate-400">{r.saveHint}</p>
      </Card>
    </main>
  );
}