import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, GraduationCap, HeartPulse, Briefcase, Plane, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Easy Way — Your colorful AI assistant" },
      {
        name: "description",
        content:
          "Easy Way is a vibrant AI assistant powered by GPT-5. Get help with education, health, business, travel and more.",
      },
      { property: "og:title", content: "Easy Way — Your colorful AI assistant" },
      {
        property: "og:description",
        content: "A bold, colorful AI chatbot powered by GPT-5. Ask anything across topics that matter.",
      },
    ],
  }),
});

const FEATURES = [
  { icon: GraduationCap, label: "Education & Learning", color: "from-blue-500 to-cyan-400" },
  { icon: HeartPulse, label: "Health & Wellness", color: "from-pink-500 to-rose-400" },
  { icon: Briefcase, label: "Business & Career", color: "from-amber-500 to-orange-400" },
  { icon: Plane, label: "Travel & Lifestyle", color: "from-emerald-500 to-teal-400" },
  { icon: Layers, label: "Multiple Categories", color: "from-violet-500 to-fuchsia-400" },
  { icon: Sparkles, label: "Custom Topics", color: "from-indigo-500 to-purple-400" },
];

function Landing() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const cta = authed ? "/topics" : "/login";

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-bg)" }}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span
            className="bg-clip-text text-lg font-bold text-transparent"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            Easy Way
          </span>
        </div>
        <Link to={cta}>
          <Button variant="ghost" size="sm">
            {authed ? "Open app" : "Sign in"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 text-center sm:pt-16">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur">
          <Zap className="h-3.5 w-3.5 text-primary" /> Powered by GPT-5
        </div>
        <h1
          className="mx-auto max-w-3xl bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          Easy Way
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          A bold, colorful AI assistant. Pick a topic and start chatting — answers, ideas, plans, code.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Button
            onClick={() => navigate({ to: cta })}
            size="lg"
            className="rounded-xl text-white shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            Get started <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card/60 p-5 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{f.label}</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
