"use client";

import { usePhotos } from "@/lib/hooks/use-photos";
import { PhotoGrid } from "@/components/photo-grid";
import { BulkActionToolbar } from "@/components/bulk-action-toolbar";

export default function HomePage() {
  const { photos, loading, error, refetch } = usePhotos();

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="mb-4 text-lg font-semibold">전체 사진</h1>
      <PhotoGrid photos={photos} loading={loading} error={error} onRefetch={refetch} />
      <BulkActionToolbar variant="gallery" photos={photos} onActionComplete={refetch} />
    </div>
  );
}
