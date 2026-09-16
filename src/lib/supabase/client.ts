'use client'

import { createBrowserClient } from '@supabase/ssr'

// 客户端组件使用的 Supabase 浏览器客户端
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
