import Link from "next/link";
import { redirect } from "next/navigation";
import { ClockIcon } from "@/components/icons";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getCurrentUser, isDemoMode } from "@/lib/data/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale } from "@/lib/i18n/server";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  return { title: getDictionary(locale).login.signinTitle };
}

export default async function LoginPage({
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
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>
      <Link href={`/${locale}`} className="mb-8 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ClockIcon className="size-5" />
        </span>
        <span className="text-lg font-semibold">{t.meta.title}</span>
      </Link>
      <LoginForm demo={demo} />
      <p className="mt-8 max-w-sm text-center text-xs leading-relaxed text-slate-400">
        {t.login.privacyNote}
      </p>
    </main>
  );
}