"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);

  const {
    mutate: submitForgotPassword,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (values: { email: string }) => forgotPassword(values.email),
    onMutate: () => setError(null),
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        background="bubbles"
        subtitle="If an account exists for that email, we've sent your username and a link to reset your password."
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Mail className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in that email to choose a new password. You can close this tab.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your username or password?"
      background="bubbles"
      subtitle="Enter the email on your account and, if it matches, we'll email you your username along with a link to reset your password."
    >
      <ForgotPasswordForm
        onSubmit={submitForgotPassword}
        isSubmitting={isPending}
        error={error}
      />
    </AuthLayout>
  );
}
