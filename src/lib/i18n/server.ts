import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

/** 服务端页面统一入口：读取并校验 [locale] 路由参数 */
export async function resolveLocale(
  params: Promise<{ locale: string }>
): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}