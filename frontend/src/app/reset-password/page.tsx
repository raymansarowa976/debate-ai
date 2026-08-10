"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { resetPassword } from "@/lib/api/auth";

const REDIRECT_DELAY_MS = 1200;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const { mutate: submitReset, isPending, isSuccess } = useMutation({
    mutationFn: (values: { password: string }) =>
      resetPassword({ token: token ?? "", password: values.password }),
    onMutate: () => setError(null),
    onSuccess: () => {
      setRedirecting(true);
      setTimeout(() => router.push("/login"), REDIRECT_DELAY_MS);
    },
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  if (!token) {
    return (
      <ResetState
        icon={<XCircle className="size-6 text-destructive" aria-hidden />}
        title="This link is missing a token"
        description="Double-check the link from your email, or request a new one."
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        }
      />
    );
  }

  if (isSuccess) {
    return (
      <ResetState
        icon={<CheckCircle2 className="size-6 text-primary" aria-hidden />}
        title="Password reset"
        description={
          redirecting ? "Taking you to login..." : "You can now log in with your new password."
        }
      />
    );
  }

  return <ResetPasswordForm onSubmit={submitReset} isSubmitting={isPending} error={error} />;
}

function ResetState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="w-full pt-2">{action}</div>}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      background="transcript"
      subtitle="Choose a new password below."
    >
      <Suspense
        fallback={
          <ResetState
            icon={<Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />}
            title="Loading"
            description="One moment..."
          />
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
