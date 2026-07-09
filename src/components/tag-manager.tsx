"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EditPencil, Trash, GitMerge, FolderPlus, Play } from "iconoir-react";
import { useTags } from "@/lib/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { MergeTagsDialog } from "@/components/merge-tags-dialog";
import { useAppModeStore } from "@/lib/stores/app-mode";
import type { TagDto } from "@/lib/types";

export function TagManager() {
  const { tags, loading, refetch } = useTags();
  const mode = useAppModeStore((s) => s.mode);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [mergeTag, setMergeTag] = useState<TagDto | null>(null);

  async function handleCreate() {
    const name = newTagName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "태그를 만들지 못했습니다");
      setNewTagName("");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "태그를 만들지 못했습니다");
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string) {
    const name = renameValue.trim();
    if (!name) return;
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "이름을 변경하지 못했습니다");
      setRenamingId(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "이름을 변경하지 못했습니다");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "태그를 삭제하지 못했습니다");
      toast.success("태그를 삭제했습니다");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "태그를 삭제하지 못했습니다");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {mode === "curator" && (
        <div className="flex gap-2">
          <Input
            placeholder="새 사진전(태그) 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating}>
            <FolderPlus width={16} height={16} className="mr-1.5" />
            만들기
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : tags.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          아직 사진전(태그)이 없습니다
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-2 px-3 py-2.5">
              {renamingId === tag.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(tag.id)}
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => handleRename(tag.id)}>
                    저장
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRenamingId(null)}>
                    취소
                  </Button>
                </div>
              ) : (
                <>
                  <Link href={`/tags/${tag.id}`} className="flex-1 truncate font-medium hover:underline">
                    {tag.name}
                  </Link>
                  <Badge variant="secondary">{tag.photoCount ?? 0}장</Badge>

                  <Link href={`/tags/${tag.id}/slideshow`}>
                    <Button variant="ghost" size="icon" title="슬라이드쇼">
                      <Play width={16} height={16} />
                    </Button>
                  </Link>

                  {mode === "curator" && (
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="이름 변경"
                        onClick={() => {
                          setRenamingId(tag.id);
                          setRenameValue(tag.name);
                        }}
                      >
                        <EditPencil width={16} height={16} />
                      </Button>
                      <Button variant="ghost" size="icon" title="병합" onClick={() => setMergeTag(tag)}>
                        <GitMerge width={16} height={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="ghost" size="icon" title="삭제">
                              <Trash width={16} height={16} />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>&apos;{tag.name}&apos; 태그를 삭제할까요?</AlertDialogTitle>
                            <AlertDialogDescription>
                              사진 파일은 그대로 유지되고, 이 태그와의 연결만 사라집니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tag.id)}>삭제</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <MergeTagsDialog
        tagA={mergeTag}
        tags={tags}
        open={mergeTag !== null}
        onOpenChange={(open) => !open && setMergeTag(null)}
        onMerged={refetch}
      />
    </div>
  );
}
