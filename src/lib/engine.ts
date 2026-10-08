import { CATEGORY_META, EXPERIENCES, type Category, type Experience, type LocationType, type Mood, type SocialMode } from "./experiences";

export interface Prefs {
  interests: Category[];
  mood: Mood;
  time: number; // minutes available
  budget: number; // INR max; 0 means strictly free
  energy: 1 | 2 | 3;
  social: SocialMode;
  distance: LocationType; // "nearby" = walkable, "city" = micro-commute, "far" = day trip
}

export interface Context {
  excluded?: string[];
  familiar?: Category[];
  completedCategories?: Category[];
  /** Adaptive preference per trait; positive = liked, negative = rejected. */
  likedTags?: Partial<Record<Category, number>>;
  /** Novelty preference raised by "Too familiar" / "Surprise me more". */
  noveltyPressure?: number;
  /** Novelty categories the user has already engaged with (saved/completed). */
  seenNovelty?: string[];
  surprise?: boolean;
}

export const WEIGHTS = { match: 0.35, novelty: 0.25, feasibility: 0.2, mood: 0.1, exploration: 0.1 } as const;

/** Distance reach: walkable covers home + nearby; commute adds city; day trip adds far. */
export const DIST: Record<LocationType, number> = { home: 0, nearby: 0, city: 1, far: 2 };
export const DISTANCE_LABEL: Record<LocationType, string> = { home: "walkable", nearby: "walkable", city: "micro-commute", far: "day-trip" };
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

export interface Scored {
  exp: Experience;
  match: number;
  novelty: number;
  feasibility: number;
  mood: number;
  exploration: number;
  final: number;
  rank: number;
  reasons: string[];
  whyNew: string;
}

export function finalScore(s: { match: number; novelty: number; feasibility: number; mood: number; exploration: number }) {
  return s.match * WEIGHTS.match + s.novelty * WEIGHTS.novelty + s.feasibility * WEIGHTS.feasibility + s.mood * WEIGHTS.mood + s.exploration * WEIGHTS.exploration;
}

/** Stage A: hard constraints. A candidate that violates any of these is never eligible. */
export function passesConstraints(e: Experience, p: Prefs) {
  return (
    e.cost_max <= p.budget &&
    e.duration <= p.time &&
    DIST[e.location_type] <= DIST[p.distance] &&
    e.social_mode.includes(p.social) &&
    e.energy <= p.energy
  );
}

/** Relevance: the candidate must share a meaningful bridge (category or tag) with selected interests. */
export function bridgeTo(e: Experience, interests: Category[]): Category | null {
  if (interests.includes(e.category)) return e.category;
  return e.tags.find((t) => interests.includes(t)) ?? null;
}

export function filterExperiences(p: Prefs, ctx: Context = {}) {
  const excluded = new Set(ctx.excluded ?? []);
  const eligible = EXPERIENCES.filter((e) => !excluded.has(e.id) && passesConstraints(e, p));
  const relevant = eligible.filter((e) => bridgeTo(e, p.interests));
  return { eligible, pool: relevant };
}

export function costLabel(e: Experience) {
  if (e.cost_max === 0) return "₹0";
  return e.cost_min === e.cost_max ? `~₹${e.cost_max}` : `~₹${e.cost_min}–${e.cost_max}`;
}

/** Stage B: score an eligible experience. */
export function scoreExperience(e: Experience, p: Prefs, ctx: Context = {}): Scored {
  const interests = new Set(p.interests);
  const catHit = interests.has(e.category);
  const tagHits = e.tags.filter((t) => t !== e.category && interests.has(t));
  const affinity = e.tags.reduce((a, t) => a + (ctx.likedTags?.[t] ?? 0), 0);

  const baseMatch = catHit ? 0.85 + 0.05 * Math.min(tagHits.length, 2) : 0.6 + 0.1 * Math.min(tagHits.length - 1, 2);
  const match = clamp(baseMatch + clamp(affinity * 0.03, -0.15, 0.1));

  const familiar = !!ctx.familiar?.includes(e.category);
  const done = !!ctx.completedCategories?.includes(e.category);
  const freshTypes = e.novelty_categories.filter((n) => !ctx.seenNovelty?.includes(n)).length;
  const novelty = clamp(
    (catHit ? 0.4 : 0.7) + (freshTypes > 0 ? 0.1 + 0.05 * Math.min(freshTypes - 1, 1) : 0) - (familiar ? 0.3 : 0) - (done ? 0.15 : 0),
  );

  const timeUse = e.duration / p.time; // 0..1 because of hard filter
  const timeFit = 0.6 + 0.4 * timeUse;
  const budgetFit = p.budget === 0 ? 1 : 1 - 0.3 * (e.cost_max / p.budget);
  const energyFit = 1 - (p.energy - e.energy) * 0.15;
  const feasibility = clamp(timeFit * 0.4 + budgetFit * 0.3 + energyFit * 0.3);

  const mood = e.moods.includes(p.mood) ? (e.moods[0] === p.mood ? 1 : 0.85) : 0.4;
  const exploration = clamp(e.exploration);

  const s = { match, novelty, feasibility, mood, exploration };
  const final = finalScore(s);
  const pressure = ctx.noveltyPressure ?? 0;
  const rank = (ctx.surprise ? novelty * 0.6 + final * 0.4 : final) + pressure * 0.04 * novelty;
  return { exp: e, ...s, final, rank, reasons: explain(e, p, ctx, catHit, tagHits), whyNew: whyNew(e, p) };
}

/** Deterministic reasons — each one is backed by input or recorded state. */
export function explain(e: Experience, p: Prefs, ctx: Context, catHit: boolean, tagHits: Category[]) {
  const r: string[] = [];
  const hit = catHit ? e.category : tagHits[0];
  if (hit) r.push(`Matches your ${CATEGORY_META[hit].label.toLowerCase()} interest`);
  r.push(`Fits your ${p.time >= 240 ? "half-day" : `${p.time}-minute`} window (${e.duration} min)`);
  r.push(e.cost_max === 0 ? "Costs ₹0 — no purchase needed" : `Estimated ${costLabel(e)}, within your ₹${p.budget} budget`);
  if (!catHit) r.push(`Introduces ${CATEGORY_META[e.category].label}, a category outside your current selections`);
  if (e.moods.includes(p.mood)) r.push(`Suits a ${p.mood} mood`);
  r.push(`Within your ${DISTANCE_LABEL[p.distance]} range`);
  if (ctx.completedCategories?.length && !ctx.completedCategories.includes(e.category)) r.push("A category you haven't completed in NOVA yet");
  return r.slice(0, 5);
}

export function whyNew(e: Experience, p: Prefs) {
  const bridge = bridgeTo(e, p.interests);
  const chose = bridge ? CATEGORY_META[bridge].label : "your interests";
  const adds = e.novelty_categories.join(" and ");
  return bridge === e.category
    ? `You chose ${chose}. NOVA keeps you there but adds ${adds} — a fresh angle on something you already enjoy.`
    : `You chose ${chose}. NOVA carries it into ${CATEGORY_META[e.category].label.toLowerCase()} and adds ${adds}, giving you a new way to use an interest you already enjoy.`;
}

export function recommend(p: Prefs, ctx: Context = {}) {
  const { eligible, pool } = filterExperiences(p, ctx);
  const scored = pool.map((e) => scoreExperience(e, p, ctx));
  scored.sort((a, b) => b.rank - a.rank || a.exp.id.localeCompare(b.exp.id));
  const pick = scored[0];
  // The "familiar" choice a conventional recommender would make: highest direct match.
  const familiar = pick
    ? [...scored].filter((s) => s !== pick).sort((a, b) => b.match - a.match || a.novelty - b.novelty)[0] ?? null
    : null;
  return { ranked: scored, familiar, scanned: EXPERIENCES.length, passed: eligible.length, rankedCount: scored.length };
}

/** Judge demo preset — runs through the real pipeline. */
export const DEMO_PREFS: Prefs = {
  interests: ["photography", "technology"],
  mood: "curious",
  time: 90,
  budget: 300,
  energy: 2,
  social: "solo",
  distance: "nearby",
};

export const pct = (n: number) => (Number.isFinite(n) ? Math.round(n * 100) : 0);
