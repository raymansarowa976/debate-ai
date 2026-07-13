"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DebatePanel } from "@/components/debate/DebatePanel";
import { fetchMatch, postArgument } from "@/lib/api/matches";

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: match, isLoading, isError } = useQuery({
    queryKey: ["match", id],
    queryFn: () => fetchMatch(id),
  });

  const { mutate: submitArgument, isPending } = useMutation({
    mutationFn: (content: string) => postArgument(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] });
    },
  });

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <DebatePanel
        status={match.status}
        topic={match.topic}
        onSubmitArgument={submitArgument}
        isSubmitting={isPending}
      />
    </main>
  );
}
