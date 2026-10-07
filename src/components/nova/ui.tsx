import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { Experience } from "@/lib/experiences";
import { cn } from "@/lib/utils";

export function Nav() {
  const link = "rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground";
  const active = { className: "!text-foreground bg-secondary" };
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-gradient-nova shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">nova</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/discover" className={link} activeProps={active}>Discover</Link>
          <Link to="/dna" className={link} activeProps={active}>DNA</Link>
          <Link to="/saved" className={link} activeProps={active}>Saved</Link>
        </nav>
      </div>
    </header>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className={cn("mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6", className)}>{children}</main>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Deterministic generative cover art for each experience. */
export function ExperienceArt({ exp, className, iconSize = 56 }: { exp: Experience; className?: string; iconSize?: number }) {
  const h = hash(exp.id);
  const hue = exp.image.hue;
  const Icon = ((Icons as unknown as Record<string, Icons.LucideIcon>)[exp.image.icon]) ?? Icons.Sparkles;
  const cx = 30 + (h % 40);
  const cy = 25 + ((h >> 4) % 40);
  return (
    <div className={cn("relative overflow-hidden", className)} role="img" aria-label={exp.title}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id={`g-${exp.id}`} cx={`${cx}%`} cy={`${cy}%`} r="80%">
            <stop offset="0%" stopColor={`oklch(0.82 0.15 ${hue})`} />
            <stop offset="45%" stopColor={`oklch(0.45 0.13 ${(hue + 30) % 360})`} />
            <stop offset="100%" stopColor={`oklch(0.16 0.03 ${(hue + 60) % 360})`} />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g-${exp.id})`} />
        {[18, 30, 44, 60].map((r, i) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="oklch(1 0 0 / 0.14)" strokeWidth={0.3} strokeDasharray={i % 2 ? "1 2" : undefined} />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={(h >> i) % 100} cy={(h * (i + 3)) % 100} r={((h >> (i + 2)) % 3) * 0.25 + 0.2} fill="oklch(1 0 0 / 0.7)" />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <Icon style={{ width: iconSize, height: iconSize }} strokeWidth={1.2} className="text-foreground/90 drop-shadow-lg" />
      </div>
    </div>
  );
}

export function ScoreRing({ value, size = 180, label }: { value: number; size?: number; label: string }) {
  const r = 44;
  const len = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--nova)" />
            <stop offset="60%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--tide)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="5" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={len * (1 - value / 100)}
          style={{ ["--ring-len" as string]: len, animation: "ring-fill 1.4s cubic-bezier(.2,.8,.2,1) both" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-semibold text-gradient-nova" style={{ fontSize: size * 0.28 }}>{value}</span>
        <span className="eyebrow mt-1">{label}</span>
      </div>
    </div>
  );
}

export function ScoreBar({ label, value, tone = "nova" }: { label: string; value: number; tone?: "nova" | "tide" | "ember" | "success" }) {
  const bg = { nova: "bg-nova", tide: "bg-tide", ember: "bg-ember", success: "bg-success" }[tone];
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="font-display text-lg font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all duration-1000", bg)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="glass mx-auto flex max-w-md flex-col items-center rounded-3xl px-6 py-14 text-center animate-rise">
      <div className="mb-5 grid size-16 place-items-center rounded-full bg-secondary text-primary">{icon}</div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
