"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthLayout } from "@/components/auth/AuthLayout";
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
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm onSubmit={submitRegistration} isSubmitting={isPending} error={error} />
    </AuthLayout>
  );
}
