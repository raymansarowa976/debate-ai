"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser, logoutUser } from "@/lib/api/auth";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  useEffect(() => {
    if (!isLoading && (isError || user === null)) {
      router.replace("/login");
    }
  }, [isLoading, isError, user, router]);

  const { mutate: logOut, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      router.push("/");
    },
  });

  if (isLoading || !user) {
    return <main className="flex flex-1 items-center justify-center">Loading…</main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16 lg:px-16">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-3xl font-semibold tracking-tight">{user.username}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" className="rounded-full px-6">
          Start a Debate
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-full px-6"
          onClick={() => logOut()}
          disabled={isLoggingOut}
        >
          <LogOut />
          Log Out
        </Button>
      </div>
    </main>
  );
}
