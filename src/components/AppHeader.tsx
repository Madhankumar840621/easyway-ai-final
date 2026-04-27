import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export function AppHeader({ user, right }: { user?: User | null; right?: React.ReactNode }) {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <header className="border-b border-border/50 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1
              className="bg-clip-text text-lg font-bold leading-tight text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              Easy Way
            </h1>
            <p className="text-xs text-muted-foreground">Your colorful AI companion</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {right}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
