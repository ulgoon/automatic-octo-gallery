"use client";

import { Check, EditPencil } from "iconoir-react";
import { cn } from "@/lib/utils";
import type { PhotoDto } from "@/lib/types";
import type { ViewMode } from "@/lib/stores/view-prefs";

interface PhotoCardProps {
  photo: PhotoDto;
  viewMode: ViewMode;
  selecting: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  showEditButton?: boolean;
  onEditMetadata?: () => void;
}

export function PhotoCard({
  photo,
  viewMode,
  selecting,
  selected,
  onToggleSelect,
  onOpen,
  showEditButton = false,
  onEditMetadata,
}: PhotoCardProps) {
  const thumbWidth = viewMode === "thumbnail" ? 240 : 480;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => (selecting ? onToggleSelect() : onOpen())}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selecting ? onToggleSelect() : onOpen();
        }
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-shadow hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted",
          viewMode === "thumbnail" ? "aspect-square" : "aspect-[4/3]"
        )}
      >
        <img
          src={`/api/thumbnail/${photo.id}?w=${thumbWidth}`}
          alt={photo.title ?? photo.filename}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {selecting && (
          <div
            className={cn(
              "absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/90 bg-black/30 text-white",
              selected && "border-primary bg-primary"
            )}
          >
            {selected && <Check width={14} height={14} />}
          </div>
        )}
        {showEditButton && !selecting && onEditMetadata && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditMetadata();
            }}
            className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            aria-label="사진 정보 편집"
          >
            <EditPencil width={14} height={14} />
          </button>
        )}
      </div>

      {viewMode === "card" && (
        <div className="flex flex-col gap-1 p-2">
          <p className="truncate text-sm font-medium">{photo.title || photo.filename}</p>
          {photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {photo.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                >
                  {t.name}
                </span>
              ))}
              {photo.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{photo.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
