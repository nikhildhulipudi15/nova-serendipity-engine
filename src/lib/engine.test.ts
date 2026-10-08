import { describe, expect, it } from "vitest";
import { DEMO_PREFS, filterExperiences, finalScore, recommend, type Prefs } from "./engine";
import { EXPERIENCES } from "./experiences";

const base: Prefs = { interests: ["food"], mood: "curious", time: 240, budget: 5000, energy: 3, social: "solo", distance: "far" };

describe("serendipity engine", () => {
  it("uses the 35/25/20/10/10 weighting", () => {
    expect(finalScore({ match: 1, novelty: 0, feasibility: 0, mood: 0, exploration: 0 })).toBeCloseTo(0.35);
    expect(finalScore({ match: 0, novelty: 1, feasibility: 0, mood: 0, exploration: 0 })).toBeCloseTo(0.25);
    expect(finalScore({ match: 0, novelty: 0, feasibility: 1, mood: 0, exploration: 0 })).toBeCloseTo(0.2);
    expect(finalScore({ match: 0, novelty: 0, feasibility: 0, mood: 1, exploration: 0 })).toBeCloseTo(0.1);
    expect(finalScore({ match: 0, novelty: 0, feasibility: 0, mood: 0, exploration: 1 })).toBeCloseTo(0.1);
  });
  it("₹0 budget only allows experiences costing exactly ₹0", () => {
    const { eligible } = filterExperiences({ ...base, budget: 0 });
    expect(eligible.length).toBeGreaterThan(0);
    expect(eligible.every((e) => e.cost_max === 0)).toBe(true);
  });
  it("Food + ₹0 picks a food-related free experience", () => {
    const top = recommend({ ...base, budget: 0 }).ranked[0];
    expect(top?.exp.cost_max).toBe(0);
    expect(top?.exp.tags).toContain("food");
  });
  it("Food + ₹300 stays within ₹300 and food-related", () => {
    const top = recommend({ ...base, budget: 300 }).ranked[0];
    expect(top!.exp.cost_max).toBeLessThanOrEqual(300);
    expect(top!.exp.tags).toContain("food");
  });
  it("walkable excludes city and day-trip experiences", () => {
    const { eligible } = filterExperiences({ ...base, distance: "nearby" });
    expect(eligible.some((e) => e.location_type === "city" || e.location_type === "far")).toBe(false);
  });
  it("30-minute limit excludes longer experiences", () => {
    expect(filterExperiences({ ...base, time: 30 }).eligible.every((e) => e.duration <= 30)).toBe(true);
  });
  it("low energy excludes high-energy experiences", () => {
    expect(filterExperiences({ ...base, energy: 1 }).eligible.every((e) => e.energy === 1)).toBe(true);
  });
  it("never recommends something with no bridge to selected interests", () => {
    for (const r of recommend(base).ranked) expect([r.exp.category, ...r.exp.tags]).toContain("food");
  });
  it("demo is deterministic and respects its constraints", () => {
    const a = recommend(DEMO_PREFS).ranked[0];
    expect(a?.exp.id).toBe(recommend(DEMO_PREFS).ranked[0]?.exp.id);
    expect(a!.exp.cost_max).toBeLessThanOrEqual(300);
  });
  it("surprise mode never returns an ineligible candidate", () => {
    const top = recommend({ ...DEMO_PREFS }, { surprise: true, noveltyPressure: 3 }).ranked[0];
    expect(top!.exp.duration).toBeLessThanOrEqual(90);
  });
  it("'not for me' affinity lowers the match score", () => {
    const id = recommend(DEMO_PREFS).ranked[0]!.exp;
    const before = recommend(DEMO_PREFS).ranked.find((r) => r.exp.id === id.id)!.match;
    const neg = Object.fromEntries(id.tags.map((t) => [t, -2]));
    const after = recommend(DEMO_PREFS, { likedTags: neg }).ranked.find((r) => r.exp.id === id.id)!.match;
    expect(after).toBeLessThan(before);
  });
  it("has at least 20 seeded experiences", () => expect(EXPERIENCES.length).toBeGreaterThanOrEqual(20));
});
