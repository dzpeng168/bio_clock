import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 服务端组件 / Route Handler / Server Action 使用的 Supabase 服务端客户端
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在服务端组件中调用 setAll 会抛错，可忽略：
            // 会话刷新由 middleware 统一处理
          }
        },
      },
    }
  )
}
