"use client";

import { useCallback, useEffect, useState } from "react";
import type { TagDto } from "@/lib/types";

export function useTags() {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "태그를 불러오지 못했습니다");
      setTags(data.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "태그를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tags, loading, error, refetch };
}
