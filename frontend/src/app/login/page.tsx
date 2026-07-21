"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginForm } from "@/components/auth/LoginForm";
import { loginUser } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: loginUser,
    onMutate: () => setError(null),
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
      router.push("/");
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>

      <div className="mt-8">
        <LoginForm onSubmit={submitLogin} isSubmitting={isPending} error={error} />
      </div>
    </main>
  );
}
