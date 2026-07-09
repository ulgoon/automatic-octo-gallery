"use client";

import { usePhotos } from "@/lib/hooks/use-photos";
import { PhotoGrid } from "@/components/photo-grid";
import { BulkActionToolbar } from "@/components/bulk-action-toolbar";
import { CuratorGate } from "@/components/curator-gate";

export default function TrashPage() {
  const { photos, loading, error, refetch } = usePhotos({ deleted: "only" });

  return (
    <CuratorGate>
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <h1 className="mb-4 text-lg font-semibold">휴지통</h1>
        <PhotoGrid
          photos={photos}
          loading={loading}
          error={error}
          onRefetch={refetch}
          emptyMessage="휴지통이 비어 있습니다"
        />
        <BulkActionToolbar variant="trash" photos={photos} onActionComplete={refetch} />
      </div>
    </CuratorGate>
  );
}
