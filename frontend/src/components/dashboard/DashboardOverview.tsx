import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { NavAuthActions } from "@/components/marketing/NavAuthActions";
import type { CurrentUser } from "@/lib/api/auth";

export interface DashboardOverviewProps {
  user: CurrentUser;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function DashboardOverview({
  user,
  onLogout,
  isLoggingOut = false,
}: DashboardOverviewProps) {
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

      <section className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-16 lg:py-24">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            [Debate Dashboard]
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight lg:text-6xl">
            Ready to debate, {user.username}?
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Pick a topic, take a stance, and go head-to-head with an AI
            opponent across a structured, multi-round match.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" className="rounded-full px-6" asChild>
              <Link href="/matches/new">Start a Debate</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
              <a href="#how-it-works">How it Works</a>
            </Button>
          </div>
        </div>

        <HeroVisual />
      </section>

      <HowItWorksSection />
    </div>
  );
}
