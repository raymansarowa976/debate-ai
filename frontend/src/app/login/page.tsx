"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { loginUser } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: loginUser,
    onMutate: () => setError(null),
    onSuccess: () => {
      router.push("/login/check-email");
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  return (
    <AuthLayout
      title="Welcome back"
      background="bubbles"
      subtitle={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </>
      }
    >
      <LoginForm onSubmit={submitLogin} isSubmitting={isPending} error={error} />
    </AuthLayout>
  );
}
