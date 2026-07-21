"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/api/auth";
import { NavAuthActions } from "./NavAuthActions";

export function NavBar() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

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

      <NavAuthActions user={user} />
    </header>
  );
}
