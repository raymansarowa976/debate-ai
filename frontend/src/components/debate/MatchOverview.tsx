import Link from "next/link";
import { DebateClashBackground } from "@/components/auth/AuthBackground";
import { DebatePanel } from "@/components/debate/DebatePanel";
import { GradingProgress } from "@/components/debate/GradingProgress";
import { Transcript } from "@/components/debate/Transcript";
import { NavAuthActions } from "@/components/marketing/NavAuthActions";
import type { CurrentUser } from "@/lib/api/auth";
import type { MatchStatus, RoundDTO } from "@/lib/api/matches";
import type { GradingEventName } from "@/lib/ws/gradingEvents";

export interface MatchOverviewProps {
  user: CurrentUser | null | undefined;
  topic: string;
  status: MatchStatus;
  rounds?: RoundDTO[];
  gradingEvents: GradingEventName[];
  onSubmitArgument: (text: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

const STATUS_SUBTITLES: Record<MatchStatus, string> = {
  INITIALIZED: "It's your turn. Make your strongest opening argument.",
  USER_TURN: "It's your turn. Make your strongest argument.",
  AI_TURN: "Waiting for the AI to respond…",
  EVALUATING: "The judge is scoring this debate…",
  COMPLETED: "This debate has concluded.",
};

export function MatchOverview({
  user,
  topic,
  status,
  rounds = [],
  gradingEvents,
  onSubmitArgument,
  isSubmitting = false,
  error = null,
  onLogout,
  isLoggingOut = false,
}: MatchOverviewProps) {
  const isEvaluating = status === "EVALUATING";

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

      <main className="relative flex-1 overflow-hidden bg-neutral-200 px-6 py-12 dark:bg-neutral-900">
        <DebateClashBackground />

        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            [Live Match]
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{topic}</h1>
          <p className="mt-2 text-muted-foreground">{STATUS_SUBTITLES[status]}</p>

          <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <Transcript rounds={rounds} aiTurnPending={status === "AI_TURN"} />
            {isEvaluating && <GradingProgress events={gradingEvents} />}
            <DebatePanel
              status={status}
              onSubmitArgument={onSubmitArgument}
              isSubmitting={isSubmitting}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
