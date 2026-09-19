import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { buttonLinkStyles } from "@/components/ui";
import { getLatestMeasurement } from "@/lib/data/queries";
import { ResultView } from "@/components/result-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "测量结果" };

export default async function MeasureResultPage() {
  const m = await getLatestMeasurement();
  if (!m) redirect("/measure");

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/measure"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeftIcon className="size-4" /> 返回测量
      </Link>
      <h1 className="mb-5 text-2xl font-bold text-slate-900">测量结果</h1>
      <ResultView m={m} />
      <div className="mt-6 text-center">
        <Link href="/trends" className={buttonLinkStyles.primary}>
          查看趋势曲线
        </Link>
      </div>
    </div>
  );
}
