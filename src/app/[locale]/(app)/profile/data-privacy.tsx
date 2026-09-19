"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAllDataAction, exportDataAction } from "@/lib/actions";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";

export function DataPrivacy() {
  const router = useRouter();
  const { t, href } = useI18n();
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
    router.push(href("/"));
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onExport} disabled={busy !== null} className="flex-1">
          {busy === "export" ? t.profile.exportBusy : t.profile.export}
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirming(true)}
          disabled={busy !== null}
          className="flex-1 text-amber-700 hover:bg-amber-50"
        >
          {t.profile.delete}
        </Button>
      </div>
      {confirming && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-relaxed text-amber-800">{t.profile.deleteConfirm}</p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={onDelete}
              disabled={busy !== null}
              className="flex-1 bg-amber-600 py-2 text-xs hover:bg-amber-700"
            >
              {busy === "delete" ? t.profile.deleteBusy : t.profile.deleteConfirmButton}
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)} className="flex-1 py-2 text-xs">
              {t.common.cancel}
            </Button>
          </div>
        </div>
      )}
      <p className="text-xs leading-relaxed text-slate-400">{t.profile.privacyFootnote}</p>
    </div>
  );
}
