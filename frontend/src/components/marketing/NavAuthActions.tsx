import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/api/auth";

export interface NavAuthActionsProps {
  user: CurrentUser | null | undefined;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function NavAuthActions({
  user,
  onLogout,
  isLoggingOut = false,
}: NavAuthActionsProps) {
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
    <div className="flex items-center gap-2">
      <Button size="default" className="rounded-full px-5" asChild>
        <Link href="/matches/new">Start a Debate</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="rounded-full px-5"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        <LogOut />
        Log Out
      </Button>
    </div>
  );
}
