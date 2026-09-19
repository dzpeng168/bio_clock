"use client";

// 全站语言切换：替换路径首段 + 写入 cookie 记住偏好
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_SHORT, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/components/ui";

export function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const current = segments[1] as Locale;
  const rest = segments.slice(2).join("/");

  const targetFor = (locale: Locale) => `/${locale}${rest ? `/${rest}` : ""}`;

  const remember = (locale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5",
        className
      )}
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={targetFor(locale)}
          onClick={() => remember(locale)}
          aria-current={locale === current ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            locale === current
              ? "bg-emerald-600 text-white"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          {LOCALE_SHORT[locale]}
        </Link>
      ))}
    </div>
  );
}