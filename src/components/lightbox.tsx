"use client";

import { useEffect } from "react";
import { NavArrowLeft, NavArrowRight, Xmark } from "iconoir-react";
import type { PhotoDto } from "@/lib/types";

interface LightboxProps {
  photos: PhotoDto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function Lightbox({ photos, index, onIndexChange, onClose }: LightboxProps) {
  const photo = photos[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndexChange(Math.min(photos.length - 1, index + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onIndexChange]);

  if (!photo) return null;

  const hasCaption = photo.title || photo.caption || photo.takenAt || photo.location;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between p-3 text-white">
        <span className="truncate text-sm text-white/70">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/10"
          aria-label="닫기"
        >
          <Xmark width={20} height={20} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
        {index > 0 && (
          <button
            type="button"
            onClick={() => onIndexChange(index - 1)}
            className="absolute left-2 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="이전 사진"
          >
            <NavArrowLeft width={22} height={22} />
          </button>
        )}
        <img
          key={photo.id}
          src={`/api/photo/${photo.id}/original`}
          alt={photo.title ?? photo.filename}
          className="max-h-full max-w-full object-contain"
        />
        {index < photos.length - 1 && (
          <button
            type="button"
            onClick={() => onIndexChange(index + 1)}
            className="absolute right-2 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="다음 사진"
          >
            <NavArrowRight width={22} height={22} />
          </button>
        )}
      </div>

      {hasCaption && (
        <div className="p-4 text-center text-white">
          {photo.title && <p className="text-lg font-medium">{photo.title}</p>}
          {photo.caption && <p className="mt-1 text-sm text-white/80">{photo.caption}</p>}
          <p className="mt-1 text-xs text-white/60">
            {[
              photo.takenAt ? new Date(photo.takenAt).toLocaleDateString("ko-KR") : null,
              photo.location,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
