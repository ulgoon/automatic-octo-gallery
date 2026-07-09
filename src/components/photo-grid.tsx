"use client";

import { useState } from "react";
import { Album, ViewGrid } from "iconoir-react";
import { useViewPrefsStore, type ViewMode } from "@/lib/stores/view-prefs";
import { useSelectionStore } from "@/lib/stores/selection";
import { useAppModeStore } from "@/lib/stores/app-mode";
import { PhotoCard } from "@/components/photo-card";
import { Lightbox } from "@/components/lightbox";
import { PhotoMetadataDialog } from "@/components/photo-metadata-dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PhotoDto } from "@/lib/types";

interface PhotoGridProps {
  photos: PhotoDto[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  allowSelection?: boolean;
  onRefetch?: () => void;
}

function gridClass(viewMode: ViewMode) {
  return viewMode === "thumbnail"
    ? "grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
    : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
}

export function PhotoGrid({
  photos,
  loading,
  error,
  emptyMessage = "표시할 사진이 없습니다",
  allowSelection = true,
  onRefetch,
}: PhotoGridProps) {
  const viewMode = useViewPrefsStore((s) => s.viewMode);
  const setViewMode = useViewPrefsStore((s) => s.setViewMode);
  const mode = useAppModeStore((s) => s.mode);
  const selectMode = useSelectionStore((s) => s.selectMode);
  const selected = useSelectionStore((s) => s.selected);
  const toggle = useSelectionStore((s) => s.toggle);
  const selectAll = useSelectionStore((s) => s.selectAll);
  const clear = useSelectionStore((s) => s.clear);
  const setSelectMode = useSelectionStore((s) => s.setSelectMode);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PhotoDto | null>(null);

  const canSelect = allowSelection && mode === "curator";
  const allSelected = photos.length > 0 && photos.every((p) => selected.has(p.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          value={[viewMode]}
          onValueChange={(vals) => {
            const v = vals[0];
            if (v === "card" || v === "thumbnail") setViewMode(v);
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="card" aria-label="카드로 보기">
            <Album width={16} height={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="thumbnail" aria-label="썸네일로 보기">
            <ViewGrid width={16} height={16} />
          </ToggleGroupItem>
        </ToggleGroup>

        {canSelect && photos.length > 0 && (
          <div className="flex items-center gap-2">
            {selectMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (allSelected ? clear() : selectAll(photos.map((p) => p.id)))}
              >
                {allSelected ? "전체 해제" : "전체 선택"}
              </Button>
            )}
            <Button
              variant={selectMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectMode(!selectMode)}
            >
              {selectMode ? "선택 완료" : "선택"}
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className={gridClass(viewMode)}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className={viewMode === "thumbnail" ? "aspect-square rounded-lg" : "aspect-[4/3] rounded-lg"}
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className={gridClass(viewMode)}>
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              viewMode={viewMode}
              selecting={canSelect && selectMode}
              selected={selected.has(photo.id)}
              onToggleSelect={() => toggle(photo.id)}
              onOpen={() => setLightboxIndex(index)}
              showEditButton={canSelect}
              onEditMetadata={() => setEditingPhoto(photo)}
            />
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <PhotoMetadataDialog
        photo={editingPhoto}
        onOpenChange={(open) => !open && setEditingPhoto(null)}
        onSaved={() => onRefetch?.()}
      />
    </div>
  );
}
