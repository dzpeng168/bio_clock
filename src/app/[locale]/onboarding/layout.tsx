// 允许未登录游客进入（免登录快测）；鉴权与游客分支由各页面自行处理
export const dynamic = "force-dynamic";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-slate-50">{children}</div>;
}
