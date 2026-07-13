import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <header className="flex items-center justify-between px-6 py-5 lg:px-16">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-sm bg-foreground text-background text-xs font-bold">
          D
        </span>
        <span className="text-base font-semibold tracking-tight">DebateAI</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#how-it-works" className="hover:text-foreground">
          How It Works
        </a>
        <a href="#judging" className="hover:text-foreground">
          The Judge
        </a>
      </nav>

      <Button size="default" className="rounded-full px-5">
        Start a Debate
      </Button>
    </header>
  );
}
