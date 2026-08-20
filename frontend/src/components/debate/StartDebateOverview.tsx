import Link from "next/link";
import { ArgumentBubblesBackground } from "@/components/auth/AuthBackground";
import { MatchSetupForm } from "@/components/debate/MatchSetupForm";
import { NavAuthActions } from "@/components/marketing/NavAuthActions";
import type { CurrentUser } from "@/lib/api/auth";
import type { Stance } from "@/lib/api/matches";

export interface StartDebateOverviewProps {
  user: CurrentUser | null | undefined;
  onSubmit: (topic: string, stance: Stance) => void;
  isSubmitting?: boolean;
  error?: string | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function StartDebateOverview({
  user,
  onSubmit,
  isSubmitting = false,
  error = null,
  onLogout,
  isLoggingOut = false,
}: StartDebateOverviewProps) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 lg:px-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-sm bg-foreground text-background text-xs font-bold">
            D
          </span>
          <span className="text-base font-semibold tracking-tight">DebateAI</span>
        </Link>

        <NavAuthActions user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-neutral-200 px-6 py-12 dark:bg-neutral-900">
        <ArgumentBubblesBackground />

        <div className="relative z-10 mx-auto w-full max-w-lg">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            [New Match]
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Start a Debate</h1>
          <p className="mt-2 text-muted-foreground">
            Pick a topic and the side you want to argue. The AI will take the
            opposite stance.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <MatchSetupForm onSubmit={onSubmit} isSubmitting={isSubmitting} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
}
