"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAllDataAction, exportDataAction } from "@/lib/actions";
import { Button } from "@/components/ui";

export function DataPrivacy() {
  const router = useRouter();
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function onExport() {
    setBusy("export");
    try {
      const json = await exportDataAction();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bioclock-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    setBusy("delete");
    await deleteAllDataAction();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onExport} disabled={busy !== null} className="flex-1">
          {busy === "export" ? "导出中…" : "一键导出数据（JSON）"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirming(true)}
          disabled={busy !== null}
          className="flex-1 text-amber-700 hover:bg-amber-50"
        >
          彻底删除数据
        </Button>
      </div>
      {confirming && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-800">
            将删除你的全部测量记录、行为打卡与计划，且不可恢复。确定继续吗？
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={onDelete}
              disabled={busy !== null}
              className="flex-1 bg-amber-600 py-2 text-xs hover:bg-amber-700"
            >
              {busy === "delete" ? "删除中…" : "确认删除"}
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)} className="flex-1 py-2 text-xs">
              取消
            </Button>
          </div>
        </div>
      )}
      <p className="text-xs leading-relaxed text-slate-400">
        体检报告 OCR（V2.0）将在本地完成识别；数据同步失败可重试且不丢失日结算。
      </p>
    </div>
  );
}
