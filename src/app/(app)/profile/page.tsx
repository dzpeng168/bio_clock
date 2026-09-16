import Link from "next/link";
import { ChevronRightIcon, ShieldCheckIcon } from "@/components/icons";
import { Badge, Card, SectionTitle, buttonLinkStyles } from "@/components/ui";
import { GOAL_LABELS, calendarAge } from "@/lib/domain";
import { getCurrentUser, getProfile, isDemoMode } from "@/lib/data/queries";
import { DataPrivacy } from "./data-privacy";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的" };

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getProfile()]);
  const demo = isDemoMode();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">我的</h1>
      </header>

      {/* 账户 */}
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
          {demo ? "演" : (user?.email?.[0] ?? "U").toUpperCase()}
        </span>
        <div className="min-w-0">
          {demo ? (
            <>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                演示模式
                <Badge tone="brand">本地数据</Badge>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                配置 Supabase 环境变量后即可启用账户与云端数据
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-semibold text-slate-900">{user?.email}</p>
              <p className="mt-0.5 text-xs text-slate-400">健康数据端到端归属本人</p>
            </>
          )}
        </div>
      </Card>

      {/* 基本信息 */}
      <Card className="p-5">
        <SectionTitle title="基本信息" sub="用于生理年龄计算" />
        {profile ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-400">日历年龄</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{calendarAge(profile.birthDate)} 岁</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">性别</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{profile.gender === "male" ? "男" : "女"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">目标</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{GOAL_LABELS[profile.goal]}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">身高</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{profile.heightCm} cm</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">体重</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{profile.weightKg} kg</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-400">未填写</p>
        )}
      </Card>

      {/* 数据与隐私 */}
      <Card className="p-5">
        <SectionTitle
          title="数据与隐私"
          sub="透明度即信任：绝不出售数据"
          right={
            <span className="text-emerald-600">
              <ShieldCheckIcon className="size-5" />
            </span>
          }
        />
        <DataPrivacy />
      </Card>

      {/* 算法白皮书 */}
      <Link
        href="/profile/algorithm"
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-300"
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">算法白皮书</p>
          <p className="mt-0.5 text-xs text-slate-500">五维权重与换算规则全公开，结果可复现</p>
        </div>
        <ChevronRightIcon className="size-5 text-slate-400" />
      </Link>

      {/* 免责声明 */}
      <Card className="bg-slate-50/60 p-5">
        <p className="text-xs leading-relaxed text-slate-500">
          逆龄时钟并非医疗器械，测量结果与建议仅供健康管理参考，不构成诊断或治疗建议；
          不做疾病诊断类宣传。如有健康问题请咨询专业医生。
        </p>
      </Card>

      <div className="pb-4 text-center">
        <Link href="/today" className={`${buttonLinkStyles.outline} text-sm`}>
          返回今日
        </Link>
      </div>
    </div>
  );
}
