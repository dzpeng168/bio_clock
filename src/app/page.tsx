import Link from "next/link";
import { redirect } from "next/navigation";
import { ClockIcon, SparklesIcon, TrendingUpIcon, ZapIcon } from "@/components/icons";
import { Badge, buttonLinkStyles } from "@/components/ui";
import { getCurrentUser, isDemoMode } from "@/lib/data/queries";
import { DIMENSION_WEIGHTS } from "@/lib/bioage";

export const dynamic = "force-dynamic";

const VALUE_PROPS = [
  {
    title: "一个数字说清楚",
    desc: "把上百项健康数据收敛为「生理年龄」一个结果，10 秒理解身体状态。",
  },
  {
    title: "因果可视化",
    desc: "每条行为都有明确正负分值与机制解释——「熬夜一次 = 老了 1.5 天」比「睡眠质量 62 分」更有行动力。",
  },
  {
    title: "可逆的希望感",
    desc: "生理年龄可升可降。负向反馈永远附带替代方案，年龄差可以一天一天缩小。",
  },
];

const MODES = [
  { name: "快测", time: "3 分钟", desc: "生活方式问卷 + 穿戴均值，建立基线" },
  { name: "标准测", time: "10 分钟", desc: "加入体成分与体能微测试，唯一可硬更新实测值" },
  { name: "深测", time: "上传即得", desc: "对接体检报告血液指标（V2.0）" },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/today");
  const demo = isDemoMode();

  return (
    <main className="min-h-dvh">
      {/* 顶部导航 */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ClockIcon className="size-5" />
          </span>
          <span className="text-lg font-semibold">逆龄时钟</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          {demo && <Badge tone="brand">演示模式</Badge>}
          <Link href="/login" className="rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100">
            登录
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pt-16">
        <Badge className="mb-5">以「生理年龄」为核心的健康管理</Badge>
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-snug text-slate-900 sm:text-5xl sm:leading-tight">
          把你的身体年龄算清楚，
          <br className="hidden sm:block" />
          再一天一天把它<span className="text-emerald-600">管理回来</span>。
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          日历年龄只增不减；生理年龄可升可降。测量你的 BioAge，
          每天的习惯正在让身体「变年轻」还是「变老」，看得见。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/onboarding/basic-info" className={`${buttonLinkStyles.primary} w-full px-8 py-3 text-base sm:w-auto`}>
            <ZapIcon className="size-4" />
            免费快测 · 3 分钟
          </Link>
          <Link href="/login" className={`${buttonLinkStyles.outline} w-full px-8 py-3 text-base sm:w-auto`}>
            登录
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {demo
            ? "当前为演示模式，可直接体验全部功能，数据仅存于本地进程"
            : "免登录游客模式即可完成首次快测；已有账户？登录后继续你的逆龄之旅"}
        </p>
      </section>

      {/* 三大价值主张 */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUE_PROPS.map((v, i) => (
            <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {i === 0 ? <SparklesIcon className="size-5" /> : i === 1 ? <TrendingUpIcon className="size-5" /> : <ClockIcon className="size-5" />}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 五维引擎 + 测量阶梯 */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">五维加权测量引擎</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              心血管、代谢、肌肉骨骼、睡眠恢复、生活方式五个维度加权合成，
              每个维度给出「等效年龄」，一眼看出短板。
            </p>
            <div className="mt-6 space-y-3">
              {DIMENSION_WEIGHTS.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm font-medium text-slate-700">{d.label}</span>
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${d.weight * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums text-slate-500">
                    {Math.round(d.weight * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">三种测量模式</h2>
            <div className="mt-6 space-y-3">
              {MODES.map((m) => (
                <div key={m.name} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="w-16 shrink-0 text-center">
                    <div className="text-sm font-semibold text-slate-900">{m.name}</div>
                    <div className="mt-0.5 text-xs text-emerald-600">{m.time}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA + 免责声明 */}
      <footer className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
        <h2 className="text-xl font-bold sm:text-2xl">今天的行为，决定明天的身体年龄</h2>
        <Link href="/onboarding/basic-info" className={`${buttonLinkStyles.primary} mt-6 px-8 py-3 text-base`}>
          开始我的第一次快测
        </Link>
        <p className="mx-auto mt-12 max-w-2xl text-xs leading-relaxed text-slate-400">
          逆龄时钟并非医疗器械，测量结果与建议仅供健康管理参考，不构成诊断或治疗建议。
          如有健康问题请咨询专业医生。
        </p>
        <p className="mt-3 text-xs text-slate-400">© 2026 BioClock</p>
      </footer>
    </main>
  );
}
