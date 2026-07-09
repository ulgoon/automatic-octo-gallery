"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FolderPlus } from "iconoir-react";
import { useTags } from "@/lib/hooks/use-tags";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface TagPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoIds: string[];
  onApplied: () => void;
}

export function TagPickerDialog({
  open,
  onOpenChange,
  photoIds,
  onApplied,
}: TagPickerDialogProps) {
  const { tags, refetch } = useTags();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleApply() {
    setSubmitting(true);
    try {
      let addTagIds = [...checked];
      const trimmed = newTagName.trim();

      if (trimmed) {
        const res = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "태그를 만들지 못했습니다");
        addTagIds = [...addTagIds, data.tag.id];
      }

      if (addTagIds.length === 0) {
        toast.info("적용할 태그를 선택하거나 새 태그 이름을 입력하세요");
        return;
      }

      const res = await fetch("/api/photos/bulk/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds, addTagIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "태그 적용에 실패했습니다");

      toast.success(`${photoIds.length}장에 태그를 적용했습니다`);
      setChecked(new Set());
      setNewTagName("");
      onOpenChange(false);
      onApplied();
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "태그 적용에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>태그 지정 ({photoIds.length}장)</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground">아직 태그가 없습니다</p>
          )}
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={checked.has(tag.id)} onCheckedChange={() => toggle(tag.id)} />
              {tag.name}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t pt-3">
          <FolderPlus width={16} height={16} className="text-muted-foreground shrink-0" />
          <Input
            placeholder="새 태그 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleApply} disabled={submitting}>
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
