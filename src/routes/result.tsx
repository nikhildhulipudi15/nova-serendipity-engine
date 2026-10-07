import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark, BookmarkCheck, Check, Compass, Heart, Plus, RefreshCcw, Repeat, SearchX, Shuffle, ThumbsDown, Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ExperienceArt, Page, ScoreBar, ScoreRing } from "@/components/nova/ui";
import { CATEGORY_META } from "@/lib/experiences";
import { DEMO_PREFS, pct, recommend, type Prefs } from "@/lib/engine";
import { setState, today, useHydrated, useNova, type Feedback } from "@/lib/store";
import { cn } from "@/lib/utils";

type Search = { mode?: "demo" | "surprise" };

export const Route = createFileRoute("/result")({
  validateSearch: (s: Record<string, unknown>): Search =>
    s.mode === "demo" || s.mode === "surprise" ? { mode: s.mode } : {},
  head: () => ({
    meta: [
      { title: "Your discovery — NOVA" },
      { name: "description", content: "Your serendipitous pick, with transparent scores and the reasons NOVA chose it." },
      { property: "og:title", content: "Your discovery — NOVA" },
      { property: "og:description", content: "A pick you didn't know you'd love — explained." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Result,
});

const PHASES = ["Filtering by time, budget & distance", "Scoring match, novelty & feasibility", "Finding your serendipity peak"];
const PLAN = ["Start", "Explore", "Challenge", "Discover", "Complete"];

function Result() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const s = useNova();
  const [phase, setPhase] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const [surprise, setSurprise] = useState(mode === "surprise");
  const [planStep, setPlanStep] = useState(0);
  const [runKey, setRunKey] = useState(0);

  // Demo/surprise without saved prefs: use the demo profile.
  useEffect(() => {
    if (!hydrated) return;
    if (mode === "demo" || (mode === "surprise" && !s.prefs)) setState((st) => ({ ...st, prefs: DEMO_PREFS }));
    setSurprise(mode === "surprise");
    setSeen([]);
    setRunKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, mode]);

  useEffect(() => {
    setPhase(0);
    const t = [setTimeout(() => setPhase(1), 450), setTimeout(() => setPhase(2), 900), setTimeout(() => setPhase(3), 1400)];
    return () => t.forEach(clearTimeout);
  }, [runKey]);

  const prefs: Prefs | null = s.prefs;
  const result = useMemo(() => {
    if (!prefs) return null;
    return recommend(prefs, {
      excluded: [...s.excluded, ...seen],
      familiar: s.familiar,
      completedCategories: s.completed.map((c) => c.category),
      likedTags: s.likedTags,
      surprise,
    });
  }, [prefs, s.excluded, s.familiar, s.completed, s.likedTags, seen, surprise]);

  useEffect(() => setPlanStep(0), [result?.ranked[0]?.exp.id]);

  if (!hydrated || phase < 3) return <Loading phase={phase} />;

  if (!prefs) {
    return (
      <Page>
        <EmptyState icon={<Compass className="size-7" />} title="Let's tune your compass" body="NOVA needs a few taps to know where 'one step beyond' is for you."
          action={<div className="flex flex-wrap justify-center gap-3"><Link to="/discover" className="btn-nova">Start discovering</Link><Link to="/result" search={{ mode: "demo" }} className="btn-ghost">Try demo</Link></div>} />
      </Page>
    );
  }

  const top = result?.ranked[0];
  if (!top) {
    return (
      <Page>
        <EmptyState icon={<SearchX className="size-7" />} title="You've explored everything here"
          body={seen.length ? "You've cycled through every match for these settings." : "Nothing fits these limits. Try more time or a bigger budget."}
          action={<div className="flex flex-wrap justify-center gap-3">
            {seen.length > 0 && <button className="btn-nova" onClick={() => { setSeen([]); setRunKey((k) => k + 1); }}><RefreshCcw className="size-4" /> Start over</button>}
            <Link to="/discover" className="btn-ghost">Adjust preferences</Link>
          </div>} />
      </Page>
    );
  }

  const e = top.exp;
  const saved = s.saved.includes(e.id);
  const done = s.completed.some((c) => c.id === e.id);
  const next = () => { setSeen((x) => [...x, e.id]); setRunKey((k) => k + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const feedback = (kind: Feedback) => {
    setState((st) => {
      const likedTags = { ...st.likedTags };
      if (kind === "loved" || kind === "more_like_this") e.tags.forEach((t) => (likedTags[t] = (likedTags[t] ?? 0) + (kind === "loved" ? 2 : 1)));
      return {
        ...st, likedTags,
        excluded: kind === "not_for_me" ? [...st.excluded, e.id] : st.excluded,
        familiar: (kind === "too_familiar" || kind === "surprise_more") && !st.familiar.includes(e.category) ? [...st.familiar, e.category] : st.familiar,
        saved: kind === "loved" && !st.saved.includes(e.id) ? [...st.saved, e.id] : st.saved,
        feedback: [...st.feedback, { id: e.id, kind, at: new Date().toISOString() }],
      };
    });
    if (kind === "surprise_more") setSurprise(true);
    toast({
      loved: "Saved — NOVA will lean into this.", not_for_me: "Got it. We won't show this again.",
      too_familiar: `Pushing further from ${CATEGORY_META[e.category].label}.`, more_like_this: "Tuning toward similar picks.",
      surprise_more: "Novelty dialled up. Hold on.",
    }[kind]);
    next();
  };

  const toggleSave = () => {
    setState((st) => ({ ...st, saved: saved ? st.saved.filter((x) => x !== e.id) : [...st.saved, e.id] }));
    toast(saved ? "Removed from saved" : "Saved to your discoveries");
  };
  const complete = () => {
    if (done) return;
    setState((st) => ({ ...st, completed: [...st.completed, { id: e.id, category: e.category, at: new Date().toISOString() }] }));
    toast.success("Discovery complete! Your DNA just evolved.", { action: { label: "View DNA", onClick: () => navigate({ to: "/dna" }) } });
  };

  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-rise">
        <div className="flex flex-wrap items-center gap-2">
          {mode === "demo" && <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">DEMO PROFILE · photography + tech, 90 min</span>}
          {surprise && <span className="rounded-full bg-ember/15 px-3 py-1 text-xs font-bold text-ember">SURPRISE MODE · novelty weighted up</span>}
          <span className="text-xs text-muted-foreground">{result!.passed} of {result!.considered} experiences passed your filters{result!.relaxed && ` (relaxed ${result!.relaxed})`}</span>
        </div>
        <Link to="/discover" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Edit preferences</Link>
      </div>

      {/* Hero result */}
      <section key={e.id} className="glass overflow-hidden rounded-[2rem] animate-rise lg:grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative">
          <ExperienceArt exp={e} className="h-64 sm:h-80 lg:h-full lg:min-h-[480px]" iconSize={96} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-6 pt-20 sm:p-8">
            <span className="eyebrow !text-foreground/80">{CATEGORY_META[e.category].label} · {e.duration} min · {e.budget ? `₹${e.budget}` : "Free"}</span>
            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{e.title}</h1>
          </div>
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing value={pct(top.final)} label="Serendipity" />
            <div className="grid w-full flex-1 grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-3">
              {[["Match", top.match], ["New", top.novelty], ["Feasible", top.feasibility]].map(([l, v]) => (
                <div key={l as string} className="rounded-2xl bg-secondary/70 px-3 py-2.5 text-center sm:flex sm:items-baseline sm:justify-between sm:text-left">
                  <span className="block font-display text-2xl font-semibold">{pct(v as number)}%</span>
                  <span className="eyebrow">{l as string}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 text-muted-foreground">{e.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {e.novelty_categories.map((n) => <span key={n} className="rounded-full border border-border px-3 py-1 text-xs font-semibold">+ {n}</span>)}
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <button onClick={toggleSave} className="btn-ghost">{saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}{saved ? "Saved" : "Save"}</button>
            <button onClick={next} className="btn-ghost"><RefreshCcw className="size-4" /> Next pick</button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Why */}
        <section className="glass rounded-3xl p-6 sm:p-8">
          <p className="eyebrow">Why NOVA picked this</p>
          <ul className="mt-5 space-y-3">
            {top.reasons.map((r, i) => (
              <li key={r} className="flex items-start gap-3 animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/20 text-success"><Check className="size-3" strokeWidth={3} /></span>
                <span className="text-sm">{r}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 space-y-4 border-t border-border pt-6">
            <ScoreBar label="Preference match · 35%" value={pct(top.match)} />
            <ScoreBar label="Novelty · 25%" value={pct(top.novelty)} tone="ember" />
            <ScoreBar label="Feasibility · 20%" value={pct(top.feasibility)} tone="tide" />
            <ScoreBar label="Mood fit · 10%" value={pct(top.mood)} tone="success" />
            <ScoreBar label="Exploration value · 10%" value={pct(top.exploration)} />
          </div>
        </section>

        {/* Plan */}
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Your experience plan</p>
            <span className="text-xs text-muted-foreground">Tap to progress</span>
          </div>
          <ol className="mt-5 space-y-2">
            {PLAN.map((label, i) => {
              const state = done || i < planStep ? "done" : i === planStep ? "active" : "todo";
              return (
                <li key={label}>
                  <button
                    disabled={done || i !== planStep}
                    onClick={() => (i === 4 ? (setPlanStep(5), complete()) : setPlanStep(i + 1))}
                    className={cn("flex w-full items-start gap-4 rounded-2xl p-3 text-left transition-all",
                      state === "active" && "bg-primary/10 ring-1 ring-primary/50 hover:bg-primary/15",
                      state === "todo" && "opacity-45")}
                  >
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold",
                      state === "done" ? "border-success bg-success text-primary-foreground" : state === "active" ? "border-primary text-primary" : "border-border")}>
                      {state === "done" ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span>
                      <span className="eyebrow !text-foreground">{label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{e.steps[i]}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {done && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-success/10 p-4 text-sm animate-rise">
              <Trophy className="size-5 text-success" /> Completed! <Link to="/dna" className="ml-auto font-bold text-success">See your DNA →</Link>
            </div>
          )}
        </section>
      </div>

      {/* Feedback */}
      <section className="glass mt-6 rounded-3xl p-6 sm:p-8">
        <p className="eyebrow">How does this feel?</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {([
            ["loved", "Loved it", Heart], ["not_for_me", "Not for me", ThumbsDown], ["too_familiar", "Too familiar", Repeat],
            ["more_like_this", "More like this", Plus], ["surprise_more", "Surprise me more", Shuffle],
          ] as const).map(([k, l, I]) => (
            <button key={k} onClick={() => feedback(k)} className={cn(k === "surprise_more" ? "btn-surprise col-span-2 sm:col-span-1" : "btn-ghost", "!px-3 !normal-case !tracking-normal")}>
              <I className="size-4" /> {l}
            </button>
          ))}
        </div>
      </section>

      {result!.ranked.length > 1 && (
        <section className="mt-10">
          <p className="eyebrow mb-4">Also on your horizon</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result!.ranked.slice(1, 4).map((r) => (
              <div key={r.exp.id} className="glass flex items-center gap-4 rounded-2xl p-3">
                <ExperienceArt exp={r.exp} className="size-16 shrink-0 rounded-xl" iconSize={24} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{r.exp.title}</p>
                  <p className="text-xs text-muted-foreground">{CATEGORY_META[r.exp.category].label}</p>
                </div>
                <span className="font-display text-xl font-semibold text-gradient-nova">{pct(r.final)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}

function Loading({ phase }: { phase: number }) {
  return (
    <Page>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="relative size-36">
          <div className="absolute inset-0 rounded-full bg-gradient-nova opacity-30 blur-2xl animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-primary/30" style={{ animation: "spin-slow 4s linear infinite" }}>
            <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-primary" />
          </div>
          <div className="absolute inset-6 rounded-full border border-tide/30" style={{ animation: "spin-slow 2.5s linear infinite reverse" }}>
            <span className="absolute -bottom-1 left-1/2 size-2 rounded-full bg-tide" />
          </div>
          <div className="absolute inset-12 rounded-full bg-gradient-nova" />
        </div>
        <ul className="mt-10 space-y-2">
          {PHASES.map((p, i) => (
            <li key={p} className={cn("flex items-center justify-center gap-2 text-sm transition-all duration-300", i <= phase ? "text-foreground" : "text-muted-foreground/40")}>
              {i < phase ? <Check className="size-4 text-success" /> : <span className={cn("size-1.5 rounded-full", i === phase ? "bg-primary animate-pulse" : "bg-muted-foreground/40")} />}
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
