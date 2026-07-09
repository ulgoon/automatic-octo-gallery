"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TagDto } from "@/lib/types";

interface MergeTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagA: TagDto | null;
  tags: TagDto[];
  onMerged: () => void;
}

export function MergeTagsDialog({
  open,
  onOpenChange,
  tagA,
  tags,
  onMerged,
}: MergeTagsDialogProps) {
  const router = useRouter();
  const [tagBId, setTagBId] = useState("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tagB = tags.find((t) => t.id === tagBId) ?? null;
  const otherTags = tags.filter((t) => t.id !== tagA?.id);

  useEffect(() => {
    if (open) {
      setTagBId("");
      setNewName("");
    }
  }, [open]);

  useEffect(() => {
    if (tagA && tagB) setNewName(`${tagA.name} + ${tagB.name}`);
  }, [tagA, tagB]);

  async function handleMerge() {
    if (!tagA || !tagB || !newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tags/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagAId: tagA.id, tagBId: tagB.id, newName: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "병합에 실패했습니다");
      toast.success(`'${data.tag.name}' 태그로 병합했습니다`);
      onOpenChange(false);
      onMerged();
      router.push(`/tags/${data.tag.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "병합에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  if (!tagA) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>&apos;{tagA.name}&apos; 태그 병합</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">병합할 다른 사진전(태그)</span>
            <Select value={tagBId} onValueChange={(v) => setTagBId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="태그 선택">
                  {(value: string | null) => tags.find((t) => t.id === value)?.name ?? "태그 선택"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {otherTags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">새 태그 이름</span>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>

          <p className="text-xs text-muted-foreground">
            기존 두 태그는 그대로 유지되고, 두 태그에 속한 사진을 모두 포함하는 새 태그가
            만들어집니다.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleMerge} disabled={!tagB || !newName.trim() || submitting}>
            병합하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
