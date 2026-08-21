"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MatchOverview } from "@/components/debate/MatchOverview";
import { fetchCurrentUser, logoutUser } from "@/lib/api/auth";
import { fetchMatch, postArgument } from "@/lib/api/matches";
import { useGradingEvents } from "@/lib/ws/useGradingEvents";

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  const { data: match, isLoading, isError } = useQuery({
    queryKey: ["match", id],
    queryFn: () => fetchMatch(id),
  });

  const { mutate: logOut, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      router.push("/");
    },
  });

  const { mutate: submitArgument, isPending } = useMutation({
    mutationFn: (content: string) => postArgument(id, content),
    onMutate: () => {
      setError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      // Our cached status may be stale (e.g. the match flipped to AI_TURN
      // in another tab) - refetch so the UI locks against the real state.
      queryClient.invalidateQueries({ queryKey: ["match", id] });
    },
  });

  const isEvaluating = match?.status === "EVALUATING";
  const gradingEvents = useGradingEvents(id, isEvaluating);

  useEffect(() => {
    if (gradingEvents.includes("FINAL_COMPILATION")) {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
    }
  }, [gradingEvents, queryClient, id]);

  if (isLoading) {
    return <main className="flex flex-1 items-center justify-center">Loading…</main>;
  }

  if (isError || !match) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted-foreground">
        Could not load this match.
      </main>
    );
  }

  return (
    <MatchOverview
      user={user}
      topic={match.topic}
      status={match.status}
      rounds={match.rounds}
      gradingEvents={gradingEvents}
      onSubmitArgument={submitArgument}
      isSubmitting={isPending}
      error={error}
      onLogout={() => logOut()}
      isLoggingOut={isLoggingOut}
    />
  );
}
