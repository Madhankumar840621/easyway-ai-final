import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChatMessage, type ChatMessageData } from "@/components/ChatMessage";
import { streamChat } from "@/lib/chat";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "Chat — Easy Way" }] }),
});

function ChatPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      const t = sessionStorage.getItem("ew_topic");
      if (!t) {
        navigate({ to: "/topics" });
        return;
      }
      setTopic(t);
      setReady(true);
    });
  }, [navigate]);

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

    let acc = "";
    await streamChat({
      messages: next,
      topic,
      onDelta: (c) => {
        acc += c;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      },
      onDone: () => setIsLoading(false),
      onError: ({ status, message }) => {
        setIsLoading(false);
        setMessages((prev) => prev.slice(0, -1));
        if (status === 429) toast.error("Too many requests. Please wait a moment.");
        else if (status === 402) toast.error("AI credits exhausted.");
        else toast.error(message || "Something went wrong");
      },
    });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("ew_topic");
    navigate({ to: "/login" });
  };

  if (!ready) return null;

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--gradient-bg)" }}>
      <header className="border-b border-border/50 bg-background/40 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/topics" })}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1
                className="bg-clip-text text-base font-bold text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                Easy Way
              </h1>
              <p className="text-xs text-muted-foreground">Topic: {topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="pt-12 text-center">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-hero)" }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Ask anything about {topic}</h2>
              <p className="mt-2 text-muted-foreground">Powered by GPT-5 — your colorful AI assistant.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/50 bg-background/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary/40">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={`Ask about ${topic}...`}
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
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
