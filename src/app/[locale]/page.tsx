import Link from "next/link";
import { redirect } from "next/navigation";
import { ClockIcon, SparklesIcon, TrendingUpIcon, ZapIcon } from "@/components/icons";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Badge, buttonLinkStyles } from "@/components/ui";
import { getCurrentUser, isDemoMode } from "@/lib/data/queries";
import { DIMENSION_WEIGHTS } from "@/lib/bioage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (user) redirect(`/${locale}/today`);
  const demo = isDemoMode();

  return (
    <main className="min-h-dvh">
      {/* 顶部导航 */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ClockIcon className="size-5" />
          </span>
          <span className="text-lg font-semibold">{t.landing.brand}</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          {demo && <Badge tone="brand">{t.common.demoMode}</Badge>}
          <LocaleSwitcher />
          <Link
            href={`/${locale}/login`}
            className="rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
          >
            {t.landing.navLogin}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pt-16">
        <Badge className="mb-5">{t.landing.badge}</Badge>
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-snug text-slate-900 sm:text-5xl sm:leading-tight">
          {t.landing.heroTitleA}
          <br className="hidden sm:block" />
          {t.landing.heroTitleB1}
          <span className="text-emerald-600">{t.landing.heroTitleHighlight}</span>
          {t.landing.heroTitleB2}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          {t.landing.heroSub}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/onboarding/basic-info`}
            className={`${buttonLinkStyles.primary} w-full px-8 py-3 text-base sm:w-auto`}
          >
            <ZapIcon className="size-4" />
            {t.landing.ctaQuickTest}
          </Link>
          <Link
            href={`/${locale}/login`}
            className={`${buttonLinkStyles.outline} w-full px-8 py-3 text-base sm:w-auto`}
          >
            {t.landing.ctaLogin}
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {demo ? t.landing.demoHint : t.landing.guestHint}
        </p>
      </section>

      {/* 三大价值主张 */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {t.landing.valueProps.map((v, i) => (
            <div
              key={v.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {i === 0 ? (
                  <SparklesIcon className="size-5" />
                ) : i === 1 ? (
                  <TrendingUpIcon className="size-5" />
                ) : (
                  <ClockIcon className="size-5" />
                )}
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
            <h2 className="text-xl font-bold sm:text-2xl">{t.landing.engineTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t.landing.engineDesc}
            </p>
            <div className="mt-6 space-y-3">
              {DIMENSION_WEIGHTS.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm font-medium text-slate-700">
                    {t.domain.dimensions[d.key]}
                  </span>
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${d.weight * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums text-slate-500">
                    {Math.round(d.weight * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{t.landing.modesTitle}</h2>
            <div className="mt-6 space-y-3">
              {t.landing.modes.map((m) => (
                <div
                  key={m.name}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
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
        <h2 className="text-xl font-bold sm:text-2xl">{t.landing.footerTitle}</h2>
        <Link
          href={`/${locale}/onboarding/basic-info`}
          className={`${buttonLinkStyles.primary} mt-6 px-8 py-3 text-base`}
        >
          {t.landing.footerCta}
        </Link>
        <p className="mx-auto mt-12 max-w-2xl text-xs leading-relaxed text-slate-400">
          {t.landing.disclaimer}
        </p>
        <p className="mt-3 text-xs text-slate-400">{t.landing.copyright}</p>
      </footer>
    </main>
  );
}