import { describe, expect, it } from "vitest";
import { DEMO_PREFS, WEIGHTS, filterExperiences, finalScore, recommend } from "./engine";
import { EXPERIENCES } from "./experiences";

describe("serendipity engine", () => {
  it("uses the 35/25/20/10/10 weighting", () => {
    expect(finalScore({ match: 1, novelty: 0, feasibility: 0, mood: 0, exploration: 0 })).toBeCloseTo(0.35);
    expect(finalScore({ match: 0, novelty: 1, feasibility: 0, mood: 0, exploration: 0 })).toBeCloseTo(0.25);
    expect(finalScore({ match: 0, novelty: 0, feasibility: 1, mood: 0, exploration: 0 })).toBeCloseTo(0.2);
    expect(WEIGHTS.mood + WEIGHTS.exploration).toBeCloseTo(0.2);
  });

  it("filters out experiences over budget before scoring", () => {
    const { pool } = filterExperiences({ ...DEMO_PREFS, budget: 0 });
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((e) => e.budget === 0)).toBe(true);
  });

  it("is deterministic", () => {
    expect(recommend(DEMO_PREFS).ranked[0]?.exp.id).toBe(recommend(DEMO_PREFS).ranked[0]?.exp.id);
  });

  it("has at least 20 seeded experiences", () => {
    expect(EXPERIENCES.length).toBeGreaterThanOrEqual(20);
  });
});
