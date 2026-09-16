import Link from "next/link";
import { redirect } from "next/navigation";
import { ClockIcon } from "@/components/icons";
import { getCurrentUser, isDemoMode } from "@/lib/data/queries";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "登录" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/today");
  const demo = isDemoMode();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <ClockIcon className="size-5" />
        </span>
        <span className="text-lg font-semibold">逆龄时钟</span>
      </Link>
      <LoginForm demo={demo} />
      <p className="mt-8 max-w-sm text-center text-xs leading-relaxed text-slate-400">
        登录即表示同意我们以加密方式存储你的健康数据。健康数据绝不出售给第三方，可随时导出或彻底删除。
      </p>
    </main>
  );
}
