"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StartDebateOverview } from "@/components/debate/StartDebateOverview";
import { fetchCurrentUser, logoutUser } from "@/lib/api/auth";
import { createMatch, type Stance } from "@/lib/api/matches";

export default function NewMatchPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
  });

  const { mutate: logOut, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      router.push("/");
    },
  });

  const { mutate: submitSetup, isPending } = useMutation({
    mutationFn: ({ topic, stance }: { topic: string; stance: Stance }) =>
      createMatch(topic, stance),
    onMutate: () => setError(null),
    onSuccess: (match) => {
      router.push(`/matches/${match.id}`);
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  return (
    <StartDebateOverview
      user={user}
      onSubmit={(topic, stance) => submitSetup({ topic, stance })}
      isSubmitting={isPending}
      error={error}
      onLogout={() => logOut()}
      isLoggingOut={isLoggingOut}
    />
  );
}
