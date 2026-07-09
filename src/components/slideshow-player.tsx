"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavArrowLeft, NavArrowRight, Play, Pause, Xmark } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TRANSITIONS, TRANSITION_EFFECTS, type TransitionEffect } from "@/lib/transitions";

interface SlidePhoto {
  id: string;
  filename: string;
  title: string | null;
  caption: string | null;
  takenAt: string | null;
  location: string | null;
}

interface SlideshowPlayerProps {
  photos: SlidePhoto[];
  tagName: string;
}

const AUTO_ADVANCE_MS = 4500;

export function SlideshowPlayer({ photos, tagName }: SlideshowPlayerProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [effect, setEffect] = useState<TransitionEffect>("fade");
  const [playing, setPlaying] = useState(true);
  const [transition, setTransition] = useState<{
    from: number;
    to: number;
    phase: "start" | "active";
  } | null>(null);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (photos.length === 0) return;
      const clamped = (nextIndex + photos.length) % photos.length;
      setTransition((prev) => {
        if (prev) return prev; // ignore nav requests while a transition is in flight
        return { from: index, to: clamped, phase: "start" };
      });
    },
    [index, photos.length]
  );

  // Flip to "active" a frame after mount so the browser registers the
  // "start" (hidden) style before the transition to "resting" kicks in.
  useEffect(() => {
    if (!transition || transition.phase !== "start") return;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransition((t) => (t ? { ...t, phase: "active" } : t));
      });
    });
    return () => cancelAnimationFrame(raf1);
  }, [transition]);

  useEffect(() => {
    if (!transition || transition.phase !== "active") return;
    const duration = TRANSITIONS[effect].durationMs;
    const timeout = setTimeout(() => {
      setIndex(transition.to);
      setTransition(null);
    }, duration);
    return () => clearTimeout(timeout);
  }, [transition, effect]);

  useEffect(() => {
    if (!playing || transition || photos.length < 2) return;
    const timeout = setTimeout(() => goTo(index + 1), AUTO_ADVANCE_MS);
    return () => clearTimeout(timeout);
  }, [playing, transition, index, goTo, photos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index, router]);

  if (photos.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>이 사진전에는 사진이 없습니다</p>
        <Button variant="outline" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>
    );
  }

  const def = TRANSITIONS[effect];
  const current = photos[index];
  const layerStyle = {
    transitionDuration: `${def.durationMs}ms`,
    transitionTimingFunction: def.timingFunction,
  };

  const fromPhoto = transition ? photos[transition.from] : null;
  const toPhoto = transition ? photos[transition.to] : null;
  const hasCaption = current.title || current.caption || current.takenAt || current.location;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="truncate text-sm text-white/70">
          {tagName} · {index + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <Select value={effect} onValueChange={(v) => v && setEffect(v as TransitionEffect)}>
            <SelectTrigger size="sm" className="w-28 border-white/20 bg-white/10 text-white">
              <SelectValue>
                {(value: TransitionEffect | null) => (value ? TRANSITIONS[value].label : "")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TRANSITION_EFFECTS.map((key) => (
                <SelectItem key={key} value={key}>
                  {TRANSITIONS[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => router.back()}
            aria-label="닫기"
          >
            <Xmark width={20} height={20} />
          </Button>
        </div>
      </div>

      <div className="slide-viewport relative flex-1 overflow-hidden">
        {!transition ? (
          <img
            key={current.id}
            src={`/api/photo/${current.id}/original`}
            alt={current.title ?? current.filename}
            className="slide-layer slide-resting slide-effect-fade absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <>
            <img
              key={`from-${fromPhoto!.id}`}
              src={`/api/photo/${fromPhoto!.id}/original`}
              alt=""
              className={cn(
                "slide-layer absolute inset-0 h-full w-full object-contain",
                def.className,
                transition.phase === "start" ? "slide-resting" : "slide-hidden"
              )}
              style={layerStyle}
            />
            <img
              key={`to-${toPhoto!.id}`}
              src={`/api/photo/${toPhoto!.id}/original`}
              alt=""
              className={cn(
                "slide-layer absolute inset-0 h-full w-full object-contain",
                def.className,
                transition.phase === "start" ? "slide-hidden" : "slide-resting"
              )}
              style={layerStyle}
            />
          </>
        )}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 hover:bg-black/60"
              aria-label="이전 사진"
            >
              <NavArrowLeft width={22} height={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 hover:bg-black/60"
              aria-label="다음 사진"
            >
              <NavArrowRight width={22} height={22} />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 p-4 text-center">
        {hasCaption && (
          <div>
            {current.title && <p className="text-lg font-medium">{current.title}</p>}
            {current.caption && <p className="mt-1 text-sm text-white/80">{current.caption}</p>}
            <p className="mt-1 text-xs text-white/60">
              {[
                current.takenAt ? new Date(current.takenAt).toLocaleDateString("ko-KR") : null,
                current.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        )}
        {photos.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "일시정지" : "재생"}
          >
            {playing ? <Pause width={20} height={20} /> : <Play width={20} height={20} />}
          </Button>
        )}
      </div>
    </div>
  );
}
