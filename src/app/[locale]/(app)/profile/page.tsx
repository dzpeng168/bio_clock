import Link from "next/link";
import { ChevronRightIcon, ShieldCheckIcon } from "@/components/icons";
import { Badge, Card, SectionTitle, buttonLinkStyles } from "@/components/ui";
import { calendarAge } from "@/lib/domain";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { DataPrivacy } from "./data-privacy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).profile.title };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const [user, profile] = await Promise.all([getCurrentUser(), getProfile()]);
  const demo = isDemoMode();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">{t.profile.title}</h1>
      </header>

      {/* 账户 */}
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
          {demo ? t.common.demoMode.slice(0, 1) : (user?.email?.[0] ?? "U").toUpperCase()}
        </span>
        <div className="min-w-0">
          {demo ? (
            <>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                {t.common.demoMode}
                <Badge tone="brand">{t.profile.demoBadge}</Badge>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{t.profile.demoDesc}</p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-semibold text-slate-900">{user?.email}</p>
              <p className="mt-0.5 text-xs text-slate-400">{t.profile.emailDesc}</p>
            </>
          )}
        </div>
      </Card>

      {/* 基本信息 */}
      <Card className="p-5">
        <SectionTitle title={t.profile.basicTitle} sub={t.profile.basicSub} />
        {profile ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-400">{t.profile.calendarAge}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {calendarAge(profile.birthDate)} {t.common.years}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t.profile.gender}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {profile.gender === "male" ? t.profile.male : t.profile.female}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t.profile.goal}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {t.domain.goals[profile.goal]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t.profile.height}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{profile.heightCm} cm</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">{t.profile.weight}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{profile.weightKg} kg</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-400">{t.profile.notFilled}</p>
        )}
      </Card>

      {/* 数据与隐私 */}
      <Card className="p-5">
        <SectionTitle
          title={t.profile.privacyTitle}
          sub={t.profile.privacySub}
          right={
            <span className="text-emerald-600">
              <ShieldCheckIcon className="size-5" />
            </span>
          }
        />
        <DataPrivacy />
      </Card>

      {/* 算法白皮书 */}
      <Link
        href={`/${locale}/profile/algorithm`}
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-300"
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t.profile.algorithmCardTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{t.profile.algorithmCardDesc}</p>
        </div>
        <ChevronRightIcon className="size-5 text-slate-400" />
      </Link>

      {/* 免责声明 */}
      <Card className="bg-slate-50/60 p-5">
        <p className="text-xs leading-relaxed text-slate-500">{t.profile.disclaimer}</p>
      </Card>

      <div className="pb-4 text-center">
        <Link href={`/${locale}/today`} className={`${buttonLinkStyles.outline} text-sm`}>
          {t.profile.backToToday}
        </Link>
      </div>
    </div>
  );
}