"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/api/auth";
import { HeroCta } from "./HeroCta";

export function HeroActions() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <HeroCta user={user} />
      <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
        <a href="#how-it-works">How it Works</a>
      </Button>
    </div>
  );
}
