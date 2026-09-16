"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";

export function LoginForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      router.replace("/today");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="text-lg font-semibold text-slate-900">
        {mode === "signin" ? "登录" : "创建账户"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "signin" ? "继续你的逆龄之旅" : "3 分钟快测，看见你的身体年龄"}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        {error && <p className="text-sm text-amber-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "请稍候…" : mode === "signin" ? "登录" : "注册"}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-center text-sm text-slate-500 hover:text-emerald-600"
      >
        {mode === "signin" ? "没有账户？注册一个" : "已有账户？直接登录"}
      </button>

      {demo && (
        <div className="mt-5 rounded-xl bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-emerald-800">
          当前未配置 Supabase，处于演示模式：无需登录即可体验全部页面，
          数据保存在本地进程中。
        </div>
      )}
    </Card>
  );
}
