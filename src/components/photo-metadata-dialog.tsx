"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PhotoDto } from "@/lib/types";

interface PhotoMetadataDialogProps {
  photo: PhotoDto | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (photo: PhotoDto) => void;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function PhotoMetadataDialog({ photo, onOpenChange, onSaved }: PhotoMetadataDialogProps) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(photo?.title ?? "");
    setCaption(photo?.caption ?? "");
    setTakenAt(toDateInputValue(photo?.takenAt ?? null));
    setLocation(photo?.location ?? "");
  }, [photo]);

  async function handleSave() {
    if (!photo) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          caption: caption.trim() || null,
          location: location.trim() || null,
          takenAt: takenAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장하지 못했습니다");
      toast.success("사진 정보를 저장했습니다");
      onSaved({ ...photo, ...data.photo });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장하지 못했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={photo !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사진 정보 편집</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo-title">제목</Label>
            <Input
              id="photo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={photo?.filename}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo-caption">설명</Label>
            <Textarea
              id="photo-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo-taken-at">촬영일자</Label>
              <Input
                id="photo-taken-at"
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo-location">장소</Label>
              <Input
                id="photo-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
