import { createFileRoute, Link } from "@tanstack/react-router";
import { Dna, Flame, Layers, Sparkles } from "lucide-react";
import { EmptyState, Page, ScoreBar } from "@/components/nova/ui";
import { getExperience, type Category } from "@/lib/experiences";
import { streak, useHydrated, useNova } from "@/lib/store";

export const Route = createFileRoute("/dna")({
  head: () => ({
    meta: [
      { title: "Your Discovery DNA — NOVA" },
      { name: "description", content: "See your curiosity, creativity, adventure, learning and social profile evolve." },
      { property: "og:title", content: "Your Discovery DNA — NOVA" },
      { property: "og:description", content: "A living profile of how you explore." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DnaPage,
});

const TRAITS: Record<string, Category[]> = {
  Curiosity: ["learning", "culture", "local", "technology", "nature"],
  Creativity: ["art", "creative", "music", "photography"],
  Adventure: ["adventure", "fitness", "nature", "local"],
  Learning: ["learning", "technology", "culture", "food"],
  Social: ["social", "music", "food"],
};
const TONES = ["nova", "ember", "tide", "success", "nova"] as const;

function DnaPage() {
  const hydrated = useHydrated();
  const s = useNova();
  if (!hydrated) return <Page><div className="h-96 rounded-3xl animate-shimmer" /></Page>;
  if (!s.prefs) {
    return <Page><EmptyState icon={<Dna className="size-7" />} title="Your DNA is unwritten" body="Make your first discovery and NOVA will start mapping how you explore." action={<Link to="/discover" className="btn-nova">Start discovering</Link>} /></Page>;
  }

  const doneTags = s.completed.flatMap((c) => getExperience(c.id)?.tags ?? []);
  const scores = Object.entries(TRAITS).map(([trait, cats]) => {
    const pref = s.prefs!.interests.filter((i) => cats.includes(i)).length * 12;
    const done = doneTags.filter((t) => cats.includes(t)).length * 8;
    const liked = cats.reduce((a, c) => a + (s.likedTags[c] ?? 0), 0) * 3;
    return { trait, value: Math.min(99, 20 + pref + done + liked) };
  });
  const newCats = new Set(s.completed.map((c) => c.category).filter((c) => !s.prefs!.interests.includes(c)));
  const top = [...scores].sort((a, b) => b.value - a.value)[0] ?? { trait: "Curiosity", value: 0 };

  const stats = [
    { label: "Experiences discovered", value: s.completed.length, icon: Sparkles },
    { label: "New categories explored", value: newCats.size, icon: Layers },
    { label: "Day discovery streak", value: streak(s.completed), icon: Flame },
  ];

  return (
    <Page>
      <div className="animate-rise">
        <p className="eyebrow">Discovery DNA</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">You're a <span className="italic text-gradient-nova">{top.trait.toLowerCase()}-led</span> explorer.</h1>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: I }) => (
          <div key={label} className="glass rounded-3xl p-6">
            <I className="size-5 text-primary" />
            <p className="mt-4 font-display text-5xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="space-y-5">
            {scores.map((sc, i) => <ScoreBar key={sc.trait} label={sc.trait} value={sc.value} tone={TONES[i] ?? "nova"} />)}
          </div>
        </section>
        <section className="glass flex items-center justify-center rounded-3xl p-6">
          <Radar scores={scores} />
        </section>
      </div>
      {s.completed.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">Complete an experience plan to grow these scores. <Link to="/result" className="font-bold text-primary">Get a pick →</Link></p>
      )}
    </Page>
  );
}

function Radar({ scores }: { scores: { trait: string; value: number }[] }) {
  const n = scores.length;
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r];
  };
  const poly = scores.map((s, i) => pt(i, (s.value / 100) * 80).join(",")).join(" ");
  return (
    <svg viewBox="-20 -10 240 220" className="w-full max-w-sm">
      {[20, 40, 60, 80].map((r) => (
        <polygon key={r} points={scores.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="oklch(1 0 0 / 0.08)" />
      ))}
      <polygon points={poly} fill="oklch(0.83 0.14 72 / 0.25)" stroke="var(--nova)" strokeWidth="1.5" />
      {scores.map((s, i) => {
        const [x, y] = pt(i, 96);
        return <text key={s.trait} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--muted-foreground)" fontWeight="700">{s.trait}</text>;
      })}
    </svg>
  );
}
