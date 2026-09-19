import { defaultLocale, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { zh } from "./dictionaries/zh";

/** 以英文结构为基准，zh.ts 必须严格对齐 */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, zh };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/** 把 "{n} 天" 这类模板里的 {placeholder} 替换为实际值 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}