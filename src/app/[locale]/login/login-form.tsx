"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { claimGuestDataAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { clearGuestData, readGuestProfile, readGuestResult } from "@/lib/guest";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";

export function LoginForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** 登录成功后认领游客模式暂存的数据（失败不影响登录流程） */
  async function tryClaimGuestData() {
    const profile = readGuestProfile();
    const measurement = readGuestResult();
    if (!profile || !measurement) return;
    const res = await claimGuestDataAction({ profile, measurement });
    if (res.ok) clearGuestData();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      try {
        await tryClaimGuestData();
      } catch {
        // 认领失败不影响登录
      }
      router.replace(`/${locale}/today`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="text-lg font-semibold text-slate-900">
        {mode === "signin" ? t.login.signinTitle : t.login.signupTitle}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "signin" ? t.login.signinSub : t.login.signupSub}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder={t.login.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder={t.login.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {error && <p className="text-sm text-amber-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? t.common.loading
            : mode === "signin"
              ? t.login.signinButton
              : t.login.signupButton}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-center text-sm text-slate-500 hover:text-emerald-600"
      >
        {mode === "signin" ? t.login.toSignup : t.login.toSignin}
      </button>

      {demo && (
        <div className="mt-5 rounded-xl bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-emerald-800">
          {t.login.demoNotice}
        </div>
      )}
    </Card>
  );
}
