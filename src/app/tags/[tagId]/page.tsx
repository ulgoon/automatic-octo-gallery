"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Play } from "iconoir-react";
import { usePhotos } from "@/lib/hooks/use-photos";
import { useTags } from "@/lib/hooks/use-tags";
import { PhotoGrid } from "@/components/photo-grid";
import { BulkActionToolbar } from "@/components/bulk-action-toolbar";
import { Button } from "@/components/ui/button";

export default function TagPhotosPage() {
  const params = useParams<{ tagId: string }>();
  const tagId = params.tagId;
  const { photos, loading, error, refetch } = usePhotos({ tagId });
  const { tags } = useTags();
  const tag = tags.find((t) => t.id === tagId);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="truncate text-lg font-semibold">{tag?.name ?? "사진전"}</h1>
        <Link href={`/tags/${tagId}/slideshow`}>
          <Button size="sm">
            <Play width={16} height={16} className="mr-1.5" />
            슬라이드쇼
          </Button>
        </Link>
      </div>
      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        onRefetch={refetch}
        emptyMessage="이 사진전에는 아직 사진이 없습니다"
      />
      <BulkActionToolbar variant="gallery" photos={photos} onActionComplete={refetch} />
    </div>
  );
}
