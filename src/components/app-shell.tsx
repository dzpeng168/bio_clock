"use client";

// 主应用外壳：H5 底部 5 Tab / PC 左侧固定侧边栏（lg 断点切换，同一套路由与图标）
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClockIcon,
  HeartPulseIcon,
  LogOutIcon,
  SunIcon,
  TargetIcon,
  TrendingUpIcon,
  UserIcon,
} from "@/components/icons";
import { cn } from "@/components/ui";
import { logoutAction } from "@/lib/actions";

const NAV = [
  { href: "/today", label: "今日", icon: SunIcon },
  { href: "/measure", label: "测量", icon: HeartPulseIcon },
  { href: "/trends", label: "趋势", icon: TrendingUpIcon },
  { href: "/plan", label: "计划", icon: TargetIcon },
  { href: "/profile", label: "我的", icon: UserIcon },
];

function Logo() {
  return (
    <Link href="/today" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <ClockIcon className="size-4.5" />
      </span>
      <span className="text-base font-semibold">逆龄时钟</span>
    </Link>
  );
}

export function AppShell({
  children,
  demo,
  email,
}: {
  children: React.ReactNode;
  demo: boolean;
  email?: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-dvh">
      {/* PC 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          {demo ? (
            <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
              演示模式
            </span>
          ) : (
            <p className="mb-2 truncate text-xs text-slate-400">{email}</p>
          )}
          <form action={logoutAction}>
            <button
              className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
              type="submit"
            >
              <LogOutIcon className="size-4" /> 退出登录
            </button>
          </form>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="lg:pl-60">
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      {/* H5 底部 Tab */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive(href) ? "text-emerald-600" : "text-slate-400"
              )}
            >
              <Icon className="size-6" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
