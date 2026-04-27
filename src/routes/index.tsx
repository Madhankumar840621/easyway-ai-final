import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { TOPICS } from "@/lib/topics";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Easy Way — Your colorful AI assistant" },
      {
        name: "description",
        content:
          "Easy Way is a vibrant, colorful AI chatbot for Education, Health, Business, Travel and more — powered by GPT.",
      },
      { property: "og:title", content: "Easy Way — Your colorful AI assistant" },
      {
        property: "og:description",
        content: "A bold, colorful AI chatbot. Pick a topic and ask anything.",
      },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-xl" style={{ background: "var(--gradient-hero)" }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <section className="mb-10 text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2
            className="bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            What can I help with today?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Pick a topic and start chatting with your AI assistant.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate({ to: "/chat/$topic", params: { topic: t.id } })}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 text-left transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-glow)]"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-80"
                style={{ background: t.gradient }}
              />
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ background: t.gradient }}
              >
                {t.emoji}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Start chatting <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
