// 双语配置：默认英语，路径前缀 /en /zh
export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** 记住用户显式选择的语言（无前缀路径重定向时使用） */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** 语言切换器展示名：两种语言都必须能看到彼此的原生写法 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

/** 顶栏切换按钮的短标签 */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** 给站内绝对路径补上语言前缀："/today" → "/zh/today" */
export function localizedHref(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path; // 外链、锚点等原样返回
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}