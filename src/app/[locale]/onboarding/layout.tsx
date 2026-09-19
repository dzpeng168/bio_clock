// 允许未登录游客进入（免登录快测）；鉴权与游客分支由各页面自行处理
import { LocaleSwitcher } from "@/components/locale-switcher";

export const dynamic = "force-dynamic";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh bg-slate-50">
      <div className="absolute right-4 top-4 z-10">
        <LocaleSwitcher />
      </div>
      {children}
    </div>
  );
}