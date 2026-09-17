"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recommendStarters, type Measurement } from "@/lib/domain";
import { readGuestResult } from "@/lib/guest";
import { ResultView } from "@/components/result-view";
import { Card, SectionTitle } from "@/components/ui";

/** 游客模式结果页：读取本机暂存结果 + 登录保存引导 */
export function GuestResult() {
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
        <h1 className="text-xl font-bold text-slate-900">还没有快测结果</h1>
        <p className="mt-2 text-sm text-slate-500">先完成 3 分钟快测，看看你的身体年龄。</p>
        <Link
          href="/onboarding/quick-test"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          开始快测
        </Link>
      </main>
    );
  }

  const recommendations = recommendStarters(m.dimensions);

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <p className="text-sm font-medium text-emerald-600">首次使用 · 步骤 3/3</p>
      <h1 className="mt-1 mb-6 text-2xl font-bold text-slate-900">
        {m.delta <= 0 ? "好消息：你比同龄人更年轻" : "看见你的身体年龄了"}
      </h1>
      <ResultView m={m} />

      <Card className="mt-4 p-5 sm:p-6">
        <SectionTitle
          title="登录保存你的结果"
          sub="注册后保存基础信息与快测结果，开启每日行为干预"
        />
        <div className="space-y-2">
          {recommendations.map((b) => (
            <div key={b.key} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{b.label}</span>
                <span className="text-xs font-medium text-emerald-600">+{b.score}/天</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                {b.criteria} · {b.mechanism}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/login"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          登录 / 注册，保存结果
        </Link>
        <p className="mt-3 text-center text-xs text-slate-400">
          游客数据仅保存在当前浏览器会话中
        </p>
      </Card>
    </main>
  );
}
