import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChatMessage, type ChatMessageData } from "@/components/ChatMessage";
import { streamChat } from "@/lib/chat";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Easy to Way — Your AI assistant" },
      {
        name: "description",
        content:
          "Easy to Way is a vibrant AI chatbot that answers questions, writes content and helps you get things done — fast.",
      },
      { property: "og:title", content: "Easy to Way — Your AI assistant" },
      {
        property: "og:description",
        content: "A bold, colorful AI chatbot. Ask anything, get clear answers.",
      },
    ],
  }),
});

const SUGGESTIONS = [
  "Explain quantum computing simply",
  "Write a poem about the ocean",
  "Plan a 3-day trip to Tokyo",
  "Help me debug a React useEffect",
];

function Index() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessageData = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    await streamChat({
      messages: next,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantSoFar };
          return copy;
        });
      },
      onDone: () => setIsLoading(false),
      onError: ({ status, message }) => {
        setIsLoading(false);
        setMessages((prev) => prev.slice(0, -1));
        if (status === 429) toast.error("Too many requests. Please wait a moment.");
        else if (status === 402)
          toast.error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
        else toast.error(message || "Something went wrong");
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Easy to Way</h1>
              <p className="text-xs text-muted-foreground">Your AI companion</p>
            </div>
          </div>
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">New chat</span>
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isEmpty ? (
            <EmptyState onPick={(s) => send(s)} />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border/50 bg-background/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary/40">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Easy to Way anything..."
              rows={1}
              className="max-h-40 min-h-[40px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-hero)" }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Easy to Way may make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center pt-12 text-center sm:pt-20">
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2
        className="bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        Easy to Way
      </h2>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        Your bold, colorful AI assistant. Ask anything — answers, ideas, code, plans.
      </p>

      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="group rounded-xl border border-border bg-card/60 p-4 text-left text-sm transition-all hover:border-primary/60 hover:bg-card hover:shadow-[var(--shadow-glow)]"
          >
            <span className="text-foreground group-hover:text-primary">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
