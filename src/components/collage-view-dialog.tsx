"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PhotoDto } from "@/lib/types";

interface CollageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: PhotoDto[];
}

export function CollageViewDialog({ open, onOpenChange, photos }: CollageViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>콜라주 ({photos.length}장)</DialogTitle>
        </DialogHeader>
        <div className="grid auto-rows-[110px] grid-cols-3 gap-1.5 sm:auto-rows-[160px] sm:grid-cols-4">
          {photos.map((photo) => {
            const ratio = photo.width && photo.height ? photo.width / photo.height : 1;
            const wide = ratio > 1.4;
            const tall = ratio < 0.7;
            return (
              <div
                key={photo.id}
                className={cn(
                  "overflow-hidden rounded-md bg-muted",
                  wide && "col-span-2",
                  tall && "row-span-2"
                )}
              >
                <img
                  src={`/api/thumbnail/${photo.id}?w=960`}
                  alt={photo.title ?? photo.filename}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
