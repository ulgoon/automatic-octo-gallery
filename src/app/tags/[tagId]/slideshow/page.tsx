"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SlideshowPlayer } from "@/components/slideshow-player";

interface SlideshowPhoto {
  id: string;
  filename: string;
  title: string | null;
  caption: string | null;
  takenAt: string | null;
  location: string | null;
}

interface SlideshowData {
  tag: { id: string; name: string };
  photos: SlideshowPhoto[];
}

export default function SlideshowPage() {
  const params = useParams<{ tagId: string }>();
  const [data, setData] = useState<SlideshowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/tags/${params.tagId}/slideshow`)
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.tagId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-black text-white/70">
        불러오는 중...
      </div>
    );
  }

  if (!data?.tag) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-black text-white/70">
        사진전을 찾을 수 없습니다
      </div>
    );
  }

  return <SlideshowPlayer photos={data.photos} tagName={data.tag.name} />;
}
