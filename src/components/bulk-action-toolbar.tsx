"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label as TagIcon, Folder as MoveIcon, Trash as DeleteIcon, Xmark, CollageFrame, UndoAction } from "iconoir-react";
import { useSelectionStore } from "@/lib/stores/selection";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TagPickerDialog } from "@/components/tag-picker-dialog";
import { FileExplorerDialog } from "@/components/file-explorer-dialog";
import { CollageViewDialog } from "@/components/collage-view-dialog";
import type { PhotoDto, BulkOpResultDto } from "@/lib/types";

interface BulkActionToolbarProps {
  variant: "gallery" | "trash";
  photos: PhotoDto[];
  onActionComplete: () => void;
}

export function BulkActionToolbar({ variant, photos, onActionComplete }: BulkActionToolbarProps) {
  const selected = useSelectionStore((s) => s.selected);
  const clear = useSelectionStore((s) => s.clear);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [collageOpen, setCollageOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedIds = [...selected];

  if (selectedIds.length === 0) return null;

  const selectedPhotos = photos.filter((p) => selected.has(p.id));

  async function reportResult(action: string, res: Response) {
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? `${action}에 실패했습니다`);
      return;
    }
    const result = data as BulkOpResultDto;
    if (result.failed.length > 0) {
      toast.warning(`${action}: ${result.succeeded.length}장 성공, ${result.failed.length}장 실패`, {
        description: result.failed.map((f) => f.reason).slice(0, 3).join(", "),
      });
    } else {
      toast.success(`${action}: ${result.succeeded.length}장 완료`);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch("/api/photos/bulk/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: selectedIds }),
      });
      await reportResult("삭제", res);
      clear();
      onActionComplete();
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    setBusy(true);
    try {
      const res = await fetch("/api/photos/bulk/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: selectedIds }),
      });
      await reportResult("복구", res);
      clear();
      onActionComplete();
    } finally {
      setBusy(false);
    }
  }

  async function handleMove(destRelDir: string) {
    setMoveDialogOpen(false);
    setBusy(true);
    try {
      const res = await fetch("/api/photos/bulk/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: selectedIds, destRelDir }),
      });
      await reportResult("이동", res);
      clear();
      onActionComplete();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-3">
        <div className="flex items-center gap-1 rounded-full border bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
          <span className="px-2 text-sm font-medium">{selectedIds.length}장 선택됨</span>

          {variant === "gallery" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                title="태그 지정"
                onClick={() => setTagDialogOpen(true)}
                disabled={busy}
              >
                <TagIcon width={18} height={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="이동"
                onClick={() => setMoveDialogOpen(true)}
                disabled={busy}
              >
                <MoveIcon width={18} height={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="콜라주로 보기"
                onClick={() => setCollageOpen(true)}
                disabled={busy || selectedIds.length < 2}
              >
                <CollageFrame width={18} height={18} />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="ghost" size="icon" title="삭제" disabled={busy}>
                      <DeleteIcon width={18} height={18} />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{selectedIds.length}장을 휴지통으로 이동할까요?</AlertDialogTitle>
                    <AlertDialogDescription>
                      휴지통 페이지에서 언제든 다시 복구할 수 있습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>휴지통으로 이동</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {variant === "trash" && (
            <Button variant="ghost" size="icon" title="복구" onClick={handleRestore} disabled={busy}>
              <UndoAction width={18} height={18} />
            </Button>
          )}

          <Button variant="ghost" size="icon" title="선택 해제" onClick={clear}>
            <Xmark width={18} height={18} />
          </Button>
        </div>
      </div>

      {variant === "gallery" && (
        <>
          <TagPickerDialog
            open={tagDialogOpen}
            onOpenChange={setTagDialogOpen}
            photoIds={selectedIds}
            onApplied={onActionComplete}
          />
          <FileExplorerDialog
            open={moveDialogOpen}
            onOpenChange={setMoveDialogOpen}
            scope="photos"
            title="이동할 폴더 선택"
            confirmLabel="여기로 이동"
            onSelect={handleMove}
          />
          <CollageViewDialog open={collageOpen} onOpenChange={setCollageOpen} photos={selectedPhotos} />
        </>
      )}
    </>
  );
}
