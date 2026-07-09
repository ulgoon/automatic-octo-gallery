"use client";

import { useCallback, useEffect, useState } from "react";
import type { PhotoDto } from "@/lib/types";

interface UsePhotosOptions {
  tagId?: string;
  deleted?: "only" | "exclude" | "all";
  q?: string;
}

export function usePhotos(options: UsePhotosOptions = {}) {
  const { tagId, deleted, q } = options;
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tagId) params.set("tagId", tagId);
      if (deleted) params.set("deleted", deleted);
      if (q) params.set("q", q);

      const res = await fetch(`/api/photos?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "사진을 불러오지 못했습니다");
      setPhotos(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [tagId, deleted, q]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { photos, loading, error, refetch };
}
