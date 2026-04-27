import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChatMessage, type ChatMessageData } from "@/components/ChatMessage";
import { AppHeader } from "@/components/AppHeader";
import { streamChat } from "@/lib/chat";
import { getTopic } from "@/lib/topics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat/$topic")({
  component: ChatPage,
});

function ChatPage() {
  const { topic: topicId } = Route.useParams();
  const topic = getTopic(topicId);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const ensureConversation = async (firstUserMsg: string): Promise<string | null> => {
    if (conversationId) return conversationId;
    if (!user) return null;
    const title = firstUserMsg.slice(0, 60);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, topic: topic.id, title })
      .select("id")
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    setConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role,
      content,
    });
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !user) return;

    const userMsg: ChatMessageData = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    const convId = await ensureConversation(trimmed);
    if (convId) await saveMessage(convId, "user", trimmed);

    let assistantSoFar = "";
    await streamChat({
      messages: next,
      systemPrompt: topic.systemPrompt,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantSoFar };
          return copy;
        });
      },
      onDone: async () => {
        setIsLoading(false);
        if (convId && assistantSoFar) await saveMessage(convId, "assistant", assistantSoFar);
      },
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

  const newChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-xl" style={{ background: "var(--gradient-hero)" }} />
      </div>
    );
  }

  const isEmpty = messages.length === 0;
  const suggestions = TOPIC_SUGGESTIONS[topic.id] ?? TOPIC_SUGGESTIONS.custom;

  return (
    <div className="flex h-screen flex-col">
      <AppHeader
        user={user}
        right={
          messages.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={newChat}>
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">New chat</span>
            </Button>
          ) : null
        }
      />

      {/* Topic banner */}
      <div className="border-b border-border/50">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Back to topics"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl"
            style={{ background: topic.gradient }}
          >
            {topic.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{topic.name}</p>
            <p className="text-xs text-muted-foreground">{topic.tagline}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isEmpty ? (
            <div className="pt-6 text-center sm:pt-12">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-[var(--shadow-glow)]"
                style={{ background: topic.gradient }}
              >
                {topic.emoji}
              </div>
              <h2
                className="bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                {topic.name}
              </h2>
              <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                Try one of these or type your own question below.
              </p>
              <div className="mt-8 grid w-full max-w-2xl mx-auto grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="group rounded-xl border border-border bg-card/60 p-4 text-left text-sm transition-all hover:border-primary/60 hover:bg-card hover:shadow-[var(--shadow-glow)]"
                  >
                    <span className="text-foreground group-hover:text-primary">{s}</span>
                  </button>
                ))}
              </div>
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
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${topic.name.toLowerCase()}...`}
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
            Easy Way may make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  education: [
    "Explain quantum computing simply",
    "Quiz me on world capitals",
    "Help me understand calculus derivatives",
    "Summarize the French Revolution",
  ],
  health: [
    "Plan a beginner 4-week workout",
    "Healthy 1500-calorie meal ideas",
    "Tips to sleep better tonight",
    "5-minute morning mindfulness routine",
  ],
  business: [
    "Improve my resume for a senior role",
    "Marketing plan for a coffee shop",
    "Common product manager interview questions",
    "Explain ROI vs ROAS",
  ],
  travel: [
    "Plan a 3-day trip to Tokyo",
    "Best food in Italy by region",
    "Budget weekend in Paris",
    "Beach destinations for December",
  ],
  custom: [
    "Write a poem about the ocean",
    "Help me debug a React useEffect",
    "Brainstorm startup name ideas",
    "Explain a difficult concept simply",
  ],
};
