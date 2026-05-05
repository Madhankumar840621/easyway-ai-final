import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, HeartPulse, Briefcase, Plane, Sparkles, Layers, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/topics")({
  component: TopicsPage,
  head: () => ({
    meta: [{ title: "Choose a topic — Easy Way" }],
  }),
});

const TOPICS = [
  { id: "education", label: "Education & Learning", icon: GraduationCap, color: "from-blue-500 to-cyan-400" },
  { id: "health", label: "Health & Wellness", icon: HeartPulse, color: "from-pink-500 to-rose-400" },
  { id: "business", label: "Business & Career", icon: Briefcase, color: "from-amber-500 to-orange-400" },
  { id: "travel", label: "Travel & Lifestyle", icon: Plane, color: "from-emerald-500 to-teal-400" },
  { id: "multi", label: "Multiple Categories", icon: Layers, color: "from-violet-500 to-fuchsia-400" },
  { id: "custom", label: "Custom Topic", icon: Sparkles, color: "from-indigo-500 to-purple-400" },
];

function TopicsPage() {
  const navigate = useNavigate();
  const [custom, setCustom] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setChecking(false);
    });
  }, [navigate]);

  const pick = (id: string, label: string) => {
    if (id === "custom") {
      const t = custom.trim();
      if (!t) return;
      sessionStorage.setItem("ew_topic", t);
    } else {
      sessionStorage.setItem("ew_topic", label);
    }
    navigate({ to: "/chat" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (checking) return null;

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "var(--gradient-bg)" }}>
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1
              className="bg-clip-text text-xl font-bold text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              Easy Way
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Pick your topic</h2>
          <p className="mt-2 text-muted-foreground">
            What do you want Easy Way to help you with today?
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            const isCustom = t.id === "custom";
            return (
              <button
                key={t.id}
                onClick={() => pick(t.id, t.label)}
                disabled={isCustom && !custom.trim()}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-border bg-card/70 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-glow)] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{t.label}</div>
                {isCustom && (
                  <Input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Type your topic…"
                    className="mt-1"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
