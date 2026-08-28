"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
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
    <DashboardOverview user={user} onLogout={() => logOut()} isLoggingOut={isLoggingOut} />
  );
}
