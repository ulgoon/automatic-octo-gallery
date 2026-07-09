export type TransitionEffect =
  | "fade"
  | "slide"
  | "zoom"
  | "wipe"
  | "dissolve"
  | "flip";

export interface TransitionDef {
  label: string;
  className: string;
  durationMs: number;
  timingFunction: string;
}

export const TRANSITIONS: Record<TransitionEffect, TransitionDef> = {
  fade: { label: "페이드", className: "slide-effect-fade", durationMs: 600, timingFunction: "ease" },
  slide: { label: "슬라이드", className: "slide-effect-slide", durationMs: 500, timingFunction: "ease-in-out" },
  zoom: { label: "줌", className: "slide-effect-zoom", durationMs: 500, timingFunction: "ease" },
  wipe: { label: "와이프", className: "slide-effect-wipe", durationMs: 600, timingFunction: "ease" },
  dissolve: { label: "디졸브", className: "slide-effect-dissolve", durationMs: 900, timingFunction: "linear" },
  flip: { label: "플립", className: "slide-effect-flip", durationMs: 600, timingFunction: "ease" },
};

export const TRANSITION_EFFECTS = Object.keys(TRANSITIONS) as TransitionEffect[];
