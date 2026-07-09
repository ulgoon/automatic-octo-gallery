"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshDouble, Folder } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { FileExplorerDialog } from "@/components/file-explorer-dialog";
import type { SettingsDto } from "@/lib/types";

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [rescanning, setRescanning] = useState(false);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data.settings);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSelectRoot(relPath: string) {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relPath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "경로를 설정하지 못했습니다");
      setSettings(data.settings);
      setExplorerOpen(false);
      toast.success("사진 경로를 설정했습니다. 스캔을 실행해 사진을 불러오세요.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "경로를 설정하지 못했습니다");
    }
  }

  async function handleRescan() {
    setRescanning(true);
    try {
      const res = await fetch("/api/photos/rescan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "스캔에 실패했습니다");
      const s = data.summary;
      toast.success(
        `스캔 완료 · 새 사진 ${s.added} · 갱신 ${s.updated} · 재연결 ${s.relinked}` +
          (s.missing ? ` · 누락 ${s.missing}` : "")
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "스캔에 실패했습니다");
    } finally {
      setRescanning(false);
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">사진 경로</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        ) : settings ? (
          <p className="rounded-md border bg-muted px-3 py-2 text-sm break-all">
            {settings.rootPath}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">아직 설정되지 않았습니다</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExplorerOpen(true)}>
            <Folder width={16} height={16} className="mr-1.5" />
            {settings ? "경로 변경" : "경로 선택"}
          </Button>
          {settings && (
            <Button onClick={handleRescan} disabled={rescanning}>
              <RefreshDouble width={16} height={16} className="mr-1.5" />
              {rescanning ? "스캔 중..." : "다시 스캔"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          경로는 서버 디렉토리 안에서만 탐색할 수 있으며, 선택한 폴더의 하위 폴더만 사진 대상이
          됩니다.
        </p>
      </div>

      <FileExplorerDialog
        open={explorerOpen}
        onOpenChange={setExplorerOpen}
        scope="explorer"
        title="사진 경로 선택"
        confirmLabel="이 폴더로 설정"
        onSelect={handleSelectRoot}
      />
    </div>
  );
}
