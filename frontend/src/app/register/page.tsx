"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { registerUser } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { mutate: submitRegistration, isPending } = useMutation({
    mutationFn: registerUser,
    onMutate: () => setError(null),
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
      router.push("/");
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>

      <div className="mt-8">
        <RegisterForm onSubmit={submitRegistration} isSubmitting={isPending} error={error} />
      </div>
    </main>
  );
}
