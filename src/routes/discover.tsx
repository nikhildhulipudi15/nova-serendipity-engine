import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/nova/ui";
import { CATEGORY_META, type Category } from "@/lib/experiences";
import type { Prefs } from "@/lib/engine";
import { getState, setState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Tune your discovery — NOVA" },
      { name: "description", content: "Seven quick taps: interests, mood, time, budget, energy, company and distance." },
      { property: "og:title", content: "Tune your discovery — NOVA" },
      { property: "og:description", content: "Tell NOVA your vibe and get a serendipitous pick." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Discover,
});

type Opt<T> = { v: T; label: string; sub?: string; icon: string };
const STEPS: { key: keyof Prefs; q: string; opts: Opt<unknown>[] }[] = [
  { key: "mood", q: "How are you feeling right now?", opts: [
    { v: "curious", label: "Curious", sub: "Show me something odd", icon: "Telescope" },
    { v: "calm", label: "Calm", sub: "Slow and gentle", icon: "Waves" },
    { v: "energetic", label: "Energetic", sub: "Let's move", icon: "Flame" },
    { v: "creative", label: "Creative", sub: "I want to make", icon: "Brush" },
    { v: "social", label: "Social", sub: "People, please", icon: "PartyPopper" },
    { v: "reflective", label: "Reflective", sub: "Quiet & deep", icon: "Moon" },
  ] },
  { key: "time", q: "How much time do you have?", opts: [
    { v: 30, label: "30 min", sub: "A quick spark", icon: "Timer" },
    { v: 60, label: "1 hour", sub: "A proper break", icon: "Clock3" },
    { v: 90, label: "90 min", sub: "Room to wander", icon: "Clock8" },
    { v: 240, label: "Half day", sub: "Go all in", icon: "Sun" },
  ] },
  { key: "budget", q: "What's your budget?", opts: [
    { v: 0, label: "Free", sub: "₹0", icon: "Gift" },
    { v: 300, label: "Light", sub: "₹1–₹300", icon: "Coins" },
    { v: 700, label: "Moderate", sub: "₹301–₹700", icon: "Wallet" },
    { v: 5000, label: "Treat myself", sub: "₹701+", icon: "Gem" },
  ] },
  { key: "energy", q: "Your energy level?", opts: [
    { v: 1, label: "Low", sub: "Sit-down friendly", icon: "BatteryLow" },
    { v: 2, label: "Medium", sub: "Some walking", icon: "BatteryMedium" },
    { v: 3, label: "High", sub: "Bring it on", icon: "BatteryFull" },
  ] },
  { key: "social", q: "Who's coming along?", opts: [
    { v: "solo", label: "Just me", icon: "User" },
    { v: "friend", label: "A friend", icon: "Users" },
    { v: "group", label: "A group", icon: "UsersRound" },
  ] },
  { key: "distance", q: "How far will you go?", opts: [
    { v: "nearby", label: "Walkable", sub: "Home or on foot", icon: "Footprints" },
    { v: "city", label: "Micro-commute", sub: "A short ride away", icon: "Building2" },
    { v: "far", label: "Day trip", sub: "Anywhere reachable", icon: "Bus" },
  ] },
];

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const C = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <C className={className} strokeWidth={1.5} />;
};

function Discover() {
  const navigate = useNavigate();
  const prev = getState().prefs;
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<Category[]>(prev?.interests ?? []);
  const [answers, setAnswers] = useState<Partial<Prefs>>(prev ?? {});
  const total = STEPS.length + 1;

  const finish = (a: Partial<Prefs>) => {
    setState((s) => ({ ...s, prefs: { ...(a as Prefs), interests }, demo: false }));
    navigate({ to: "/result" });
  };
  const pick = (key: keyof Prefs, v: unknown) => {
    const next = { ...answers, [key]: v };
    setAnswers(next);
    setTimeout(() => (step === total - 1 ? finish(next) : setStep(step + 1)), 220);
  };

  const cur = step > 0 ? STEPS[step - 1] : null;
  return (
    <Page className="max-w-3xl">
      <div className="mb-10 flex items-center gap-4">
        <button onClick={() => (step ? setStep(step - 1) : navigate({ to: "/" }))} className="btn-ghost !p-2.5" aria-label="Back"><ArrowLeft className="size-4" /></button>
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
        <span className="eyebrow">{step + 1}/{total}</span>
      </div>

      <div key={step} className="animate-rise">
        {!cur ? (
          <>
            <h1 className="text-3xl font-semibold sm:text-5xl">What are you into?</h1>
            <p className="mt-3 text-muted-foreground">Pick a few. NOVA will go one step beyond them.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
                const on = interests.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => setInterests(on ? interests.filter((x) => x !== c) : [...interests, c])}
                    aria-pressed={on}
                    className={cn("glass group relative flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5", on && "!border-primary/70 !bg-primary/10")}
                  >
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-secondary transition-colors", on && "bg-primary text-primary-foreground")}>
                      <Icon name={CATEGORY_META[c].icon} className="size-5" />
                    </span>
                    <span className="text-sm font-bold">{CATEGORY_META[c].label}</span>
                    {on && <Check className="absolute right-3 top-3 size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-10 flex justify-end">
              <button disabled={!interests.length} onClick={() => setStep(1)} className="btn-nova">
                Continue <ArrowRight className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold sm:text-5xl">{cur.q}</h1>
            <div className={cn("mt-8 grid gap-3", cur.opts.length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
              {cur.opts.map((o) => {
                const on = answers[cur.key] === o.v;
                return (
                  <button
                    key={String(o.v)}
                    onClick={() => pick(cur.key, o.v)}
                    className={cn("glass flex flex-col items-start gap-6 rounded-3xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 active:scale-[.98]", on && "!border-primary !bg-primary/10")}
                  >
                    <Icon name={o.icon} className={cn("size-7", on ? "text-primary" : "text-muted-foreground")} />
                    <div>
                      <p className="text-lg font-bold">{o.label}</p>
                      {o.sub && <p className="text-sm text-muted-foreground">{o.sub}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
