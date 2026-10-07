import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Shuffle, Zap } from "lucide-react";
import { Page, ExperienceArt } from "@/components/nova/ui";
import { EXPERIENCES } from "@/lib/experiences";
import { WEIGHTS } from "@/lib/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA — The Serendipity Engine" },
      { name: "description", content: "NOVA learns what you love, then takes you one step beyond it. Discover experiences you didn't know you'd love." },
      { property: "og:title", content: "NOVA — The Serendipity Engine" },
      { property: "og:description", content: "Discover something you didn't know you needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const floating = ["night-sky-long-exposure", "cyanotype", "bus-to-the-end"].map((id) => EXPERIENCES.find((e) => e.id === id)!);

function Landing() {
  const navigate = useNavigate();
  return (
    <Page className="pt-10 sm:pt-16">
      <section className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="animate-rise">
          <p className="eyebrow mb-6 flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> The Serendipity Engine</p>
          <h1 className="text-[2.6rem] font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
            Discover something<br />
            <span className="italic text-gradient-nova">you didn't know</span><br />
            you needed.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">NOVA learns what you love — then takes you one step beyond it.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/discover" className="btn-nova">Start discovering <ArrowRight className="size-4" /></Link>
            <button onClick={() => navigate({ to: "/result", search: { mode: "surprise" } })} className="btn-surprise">
              <Shuffle className="size-4" /> Surprise me
            </button>
          </div>
          <button onClick={() => navigate({ to: "/result", search: { mode: "demo" } })} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
            <Zap className="size-4" /> Judge demo — see a pick in one click
          </button>
        </div>

        <div className="relative mx-auto h-[380px] w-full max-w-sm sm:h-[440px]">
          {floating.map((e, i) => (
            <div
              key={e.id}
              className="glass absolute w-52 overflow-hidden rounded-3xl shadow-2xl animate-float sm:w-60"
              style={{
                left: ["0%", "38%", "8%"][i], top: ["4%", "22%", "56%"][i],
                animationDelay: `${i * -2.3}s`, rotate: ["-6deg", "5deg", "-2deg"][i], zIndex: [1, 2, 3][i],
              }}
            >
              <ExperienceArt exp={e} className="h-28 sm:h-32" iconSize={36} />
              <div className="p-4">
                <p className="text-sm font-bold leading-tight">{e.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.novelty_categories[0]} · {e.duration} min</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-4 sm:grid-cols-3">
        {[
          ["01", "Tell us your vibe", "Interests, mood, time and budget — seven taps."],
          ["02", "We filter, then score", "Only what's feasible survives. Then we rank for serendipity."],
          ["03", "Go one step beyond", "Close enough to love. New enough to remember."],
        ].map(([n, t, b]) => (
          <div key={n} className="glass rounded-3xl p-6">
            <span className="font-display text-sm text-primary">{n}</span>
            <h3 className="mt-3 text-xl font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b}</p>
          </div>
        ))}
      </section>

      <section className="glass mt-6 rounded-3xl p-6 sm:p-8">
        <p className="eyebrow">The serendipity formula</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {Object.entries({ "Preference match": WEIGHTS.match, Novelty: WEIGHTS.novelty, Feasibility: WEIGHTS.feasibility, "Mood fit": WEIGHTS.mood, "Exploration value": WEIGHTS.exploration }).map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2 rounded-full bg-secondary px-4 py-2">
              <span className="font-display text-lg font-semibold text-gradient-nova">{Math.round(v * 100)}%</span>
              <span className="text-sm text-muted-foreground">{k}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Transparent and deterministic — every pick is explained. Same inputs, same result.</p>
      </section>
    </Page>
  );
}
