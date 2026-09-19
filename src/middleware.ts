import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { LOCALE_COOKIE, defaultLocale, isLocale, localizedHref } from '@/lib/i18n/config'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 无语言前缀 → 跳转到用户偏好语言（默认英语）
  if (!isLocale(pathname.split('/')[1])) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value
    const locale = isLocale(preferred) ? preferred : defaultLocale
    const url = request.nextUrl.clone()
    url.pathname = localizedHref(locale, pathname)
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  // 排除 _next 静态资源、api 路由与带扩展名的文件
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}