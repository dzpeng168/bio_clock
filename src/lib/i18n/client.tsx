"use client";

// 客户端 i18n 上下文：由 [locale]/layout.tsx 注入，客户端组件用 useI18n() 取字典
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  BehaviorKey,
  DimensionKey,
  Goal,
  ReasonLike,
  SettlementKey,
} from "@/lib/domain";
import { localizedHref, type Locale } from "./config";
import { interpolate, type Dictionary } from "./dictionaries";

interface I18nValue {
  locale: Locale;
  /** 当前语言字典 */
  t: Dictionary;
  /** 把站内路径补上当前语言前缀 */
  href: (path: string) => string;
  /** 字典模板插值：f("{n} days", { n: 3 }) */
  f: (template: string, params?: Record<string, string | number>) => string;
  /** 归因：字典 code → 文案（兼容历史明文） */
  reason: (r: ReasonLike) => string;
  /** 维度名 */
  dimension: (key: DimensionKey) => string;
  /** 行为定义（含 label / criteria / mechanism，负向行为额外有 remedy） */
  behavior: (key: BehaviorKey) => BehaviorText;
  /** 目标名 */
  goal: (key: Goal) => string;
  /** 日结算文案 */
  settlementLabel: (key: SettlementKey, field: "title" | "daysText") => string;
}

const I18nContext = createContext<I18nValue | null>(null);

interface BehaviorText {
  label: string;
  criteria: string;
  mechanism: string;
  remedy?: string;
}

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(() => {
    const reason = (r: ReasonLike) => {
      if (typeof r === "string") return r; // 历史数据为明文
      const template =
        (dictionary.domain.reasons as Record<string, string>)[r.code] ?? r.code;
      return interpolate(template, r.params);
    };
    return {
      locale,
      t: dictionary,
      href: (path: string) => localizedHref(locale, path),
      f: interpolate,
      reason,
      dimension: (key) => dictionary.domain.dimensions[key],
      behavior: (key) => dictionary.domain.behaviors[key] as BehaviorText,
      goal: (key) => dictionary.domain.goals[key],
      settlementLabel: (key, field) => dictionary.domain.settlement[key][field],
    };
  }, [locale, dictionary]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n 必须在 I18nProvider 内使用");
  return ctx;
}