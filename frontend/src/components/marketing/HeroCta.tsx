import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/api/auth";

export interface HeroCtaProps {
  user: CurrentUser | null | undefined;
}

export function HeroCta({ user }: HeroCtaProps) {
  if (user === undefined) {
    return null;
  }

  if (user === null) {
    return (
      <Button size="lg" className="rounded-full px-6" asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
    );
  }

  return (
    <Button size="lg" className="rounded-full px-6">
      Start a Debate
    </Button>
  );
}
