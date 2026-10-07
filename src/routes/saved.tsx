import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, ExperienceArt, Page } from "@/components/nova/ui";
import { CATEGORY_META, getExperience } from "@/lib/experiences";
import { setState, useHydrated, useNova } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved discoveries — NOVA" },
      { name: "description", content: "Experiences you've saved to try next." },
      { property: "og:title", content: "Saved discoveries — NOVA" },
      { property: "og:description", content: "Your shortlist of serendipity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Saved,
});

function Saved() {
  const hydrated = useHydrated();
  const s = useNova();
  if (!hydrated) return <Page><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-72 rounded-3xl animate-shimmer" />)}</div></Page>;
  const items = s.saved.map(getExperience).filter((e) => !!e);
  if (!items.length) {
    return <Page><EmptyState icon={<Bookmark className="size-7" />} title="Nothing saved yet" body="Tap Save or Loved it on any pick and it lands here." action={<Link to="/result" className="btn-nova">Get a pick</Link>} /></Page>;
  }
  const remove = (id: string) => { setState((st) => ({ ...st, saved: st.saved.filter((x) => x !== id) })); toast("Removed from saved"); };
  return (
    <Page>
      <p className="eyebrow">Saved discoveries</p>
      <h1 className="mt-3 text-4xl font-semibold">{items.length} waiting for you</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e, i) => {
          const done = s.completed.some((c) => c.id === e.id);
          return (
            <article key={e.id} className="glass group overflow-hidden rounded-3xl animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
              <ExperienceArt exp={e} className="h-40 transition-transform duration-500 group-hover:scale-105" iconSize={48} />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{CATEGORY_META[e.category].label}</span>
                  {done && <span className="flex items-center gap-1 text-xs font-bold text-success"><Check className="size-3" /> Done</span>}
                </div>
                <h2 className="mt-2 text-xl font-semibold">{e.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{e.duration} min · {e.budget ? `₹${e.budget}` : "Free"}</span>
                  <button onClick={() => remove(e.id)} className="btn-ghost !p-2" aria-label={`Remove ${e.title}`}><Trash2 className="size-4" /></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Page>
  );
}
