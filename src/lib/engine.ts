import { CATEGORY_META, EXPERIENCES, type Category, type Experience, type LocationType, type Mood, type SocialMode } from "./experiences";

export interface Prefs {
  interests: Category[];
  mood: Mood;
  time: number; // minutes available
  budget: number; // INR max
  energy: 1 | 2 | 3;
  social: SocialMode;
  distance: LocationType;
}

export interface Context {
  excluded?: string[];
  familiar?: Category[];
  completedCategories?: Category[];
  likedTags?: Partial<Record<Category, number>>;
  surprise?: boolean;
}

export const WEIGHTS = { match: 0.35, novelty: 0.25, feasibility: 0.2, mood: 0.1, exploration: 0.1 } as const;

const DIST: Record<LocationType, number> = { home: 0, nearby: 1, city: 2, far: 3 };
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

export interface Scored {
  exp: Experience;
  match: number;
  novelty: number;
  feasibility: number;
  mood: number;
  exploration: number;
  final: number;
  reasons: string[];
}

export function finalScore(s: { match: number; novelty: number; feasibility: number; mood: number; exploration: number }) {
  return s.match * WEIGHTS.match + s.novelty * WEIGHTS.novelty + s.feasibility * WEIGHTS.feasibility + s.mood * WEIGHTS.mood + s.exploration * WEIGHTS.exploration;
}

/** Step 1: hard filters. Relaxes distance, then social mode, if nothing survives. */
export function filterExperiences(p: Prefs, ctx: Context = {}) {
  const excluded = new Set(ctx.excluded ?? []);
  const base = EXPERIENCES.filter((e) => !excluded.has(e.id) && e.budget <= p.budget && e.duration <= p.time * 1.25);
  const strict = base.filter((e) => DIST[e.location_type] <= DIST[p.distance] && e.social_mode.includes(p.social));
  if (strict.length) return { pool: strict, relaxed: null as string | null };
  const noDist = base.filter((e) => e.social_mode.includes(p.social));
  if (noDist.length) return { pool: noDist, relaxed: "distance" };
  return { pool: base, relaxed: base.length ? "group size & distance" : null };
}

/** Step 2: score every surviving experience. */
export function scoreExperience(e: Experience, p: Prefs, ctx: Context = {}): Scored {
  const interests = new Set(p.interests);
  const catHit = interests.has(e.category);
  const tagHits = e.tags.filter((t) => t !== e.category && interests.has(t));
  const liked = e.tags.reduce((a, t) => a + (ctx.likedTags?.[t] ?? 0), 0);

  let match = catHit ? 0.88 + 0.03 * tagHits.length : tagHits.length ? 0.68 + 0.1 * (tagHits.length - 1) : 0.3;
  match = clamp(match + Math.min(0.12, liked * 0.03), 0, 0.99);

  const familiar = ctx.familiar?.includes(e.category);
  const done = ctx.completedCategories?.includes(e.category);
  let novelty = (catHit ? 0.48 : 0.9) - (familiar ? 0.35 : 0) - (done ? 0.15 : 0) + 0.03 * e.novelty_categories.length;
  novelty = clamp(novelty, 0.1, 0.99);

  const timeFit = 1 - Math.max(0, e.duration - p.time) / p.time - (Math.max(0, p.time - e.duration) / p.time) * 0.15;
  const budgetFit = e.budget === 0 ? 1 : 1 - 0.25 * (e.budget / Math.max(p.budget, 1));
  const energyFit = 1 - Math.abs(e.energy - p.energy) * 0.25;
  const distFit = DIST[e.location_type] <= DIST[p.distance] ? 1 : 0.6;
  const feasibility = clamp(timeFit * 0.35 + budgetFit * 0.25 + energyFit * 0.25 + distFit * 0.15, 0.1, 0.99);

  const mood = e.moods.includes(p.mood) ? (e.moods[0] === p.mood ? 1 : 0.9) : 0.45;
  const exploration = clamp(e.exploration * 0.8 + Math.min(e.novelty_categories.length, 3) * 0.07);

  const s = { match, novelty, feasibility, mood, exploration };
  return { exp: e, ...s, final: finalScore(s), reasons: explain(e, p, { catHit, tagHits, familiar: !!familiar }) };
}

/** Deterministic explanations — always available, no AI required. */
export function explain(e: Experience, p: Prefs, f: { catHit: boolean; tagHits: Category[]; familiar: boolean }) {
  const r: string[] = [];
  const hit = f.catHit ? e.category : f.tagHits[0];
  if (hit) r.push(`Connects to your ${CATEGORY_META[hit].label.toLowerCase()} interest`);
  r.push(`Fits your ${p.time >= 240 ? "half-day" : `${p.time}-minute`} window (${e.duration} min)`);
  r.push(e.budget === 0 ? "Completely free" : `Within your budget at about ₹${e.budget}`);
  if (!f.catHit && !f.familiar) r.push(`A category you haven't explored: ${CATEGORY_META[e.category].label}`);
  if (e.moods.includes(p.mood)) r.push(`Matches your ${p.mood} mood`);
  r.push(`Introduces ${e.novelty_categories.join(" & ")}`);
  return r.slice(0, 5);
}

export function recommend(p: Prefs, ctx: Context = {}) {
  const { pool, relaxed } = filterExperiences(p, ctx);
  const scored = pool.map((e) => scoreExperience(e, p, ctx));
  const rank = (s: Scored) => (ctx.surprise ? s.novelty * 0.6 + s.final * 0.4 : s.final);
  scored.sort((a, b) => rank(b) - rank(a) || a.exp.id.localeCompare(b.exp.id));
  return { ranked: scored, relaxed, considered: EXPERIENCES.length, passed: pool.length };
}

export const DEMO_PREFS: Prefs = {
  interests: ["photography", "technology"],
  mood: "curious",
  time: 90,
  budget: 500,
  energy: 2,
  social: "solo",
  distance: "city",
};

export const pct = (n: number) => Math.round(n * 100);
