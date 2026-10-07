import { useSyncExternalStore } from "react";
import type { Category } from "./experiences";
import type { Prefs } from "./engine";

export type Feedback = "loved" | "not_for_me" | "too_familiar" | "more_like_this" | "surprise_more";

export interface NovaState {
  prefs: Prefs | null;
  saved: string[];
  excluded: string[];
  familiar: Category[];
  likedTags: Partial<Record<Category, number>>;
  completed: { id: string; category: Category; at: string }[];
  feedback: { id: string; kind: Feedback; at: string }[];
}

const KEY = "nova-state-v1";
const EMPTY: NovaState = { prefs: null, saved: [], excluded: [], familiar: [], likedTags: {}, completed: [], feedback: [] };

let state: NovaState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch { /* corrupt storage: start fresh */ }
}

export function setState(fn: (s: NovaState) => NovaState) {
  load();
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  listeners.forEach((l) => l());
}
export function getState() { load(); return state; }

export function useNova() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => EMPTY,
  );
}

export function useHydrated() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export const today = () => new Date().toISOString().slice(0, 10);

export function streak(completed: NovaState["completed"]) {
  const days = new Set(completed.map((c) => c.at.slice(0, 10)));
  let n = 0;
  const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
