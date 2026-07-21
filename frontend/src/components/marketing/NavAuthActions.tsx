import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/api/auth";

export interface NavAuthActionsProps {
  user: CurrentUser | null | undefined;
}

export function NavAuthActions({ user }: NavAuthActionsProps) {
  if (user === undefined) {
    return null;
  }

  if (user === null) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="default" className="rounded-full px-5" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="default" className="rounded-full px-5" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button size="default" className="rounded-full px-5">
      Start a Debate
    </Button>
  );
}
