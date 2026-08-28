"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { verifyLogin } from "@/lib/api/auth";

const REDIRECT_DELAY_MS = 1200;

function VerifyLoginContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const hasStarted = useRef(false);
  const [redirecting, setRedirecting] = useState(false);

  const { mutate: submitVerification, status, error } = useMutation({
    mutationFn: verifyLogin,
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
      setRedirecting(true);
      setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY_MS);
    },
  });

  useEffect(() => {
    if (hasStarted.current || !token) return;
    hasStarted.current = true;
    submitVerification(token);
  }, [token, submitVerification]);

  if (!token) {
    return (
      <VerifyState
        icon={<XCircle className="size-6 text-destructive" aria-hidden />}
        title="This link is missing a token"
        description="Double-check the link from your email, or request a new one by logging in again."
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        }
      />
    );
  }

  if (status === "pending" || status === "idle") {
    return (
      <VerifyState
        icon={<Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />}
        title="Confirming it's you"
        description="Hang tight while we verify your login."
      />
    );
  }

  if (status === "error") {
    return (
      <VerifyState
        icon={<XCircle className="size-6 text-destructive" aria-hidden />}
        title="This link is invalid or expired"
        description={
          error instanceof Error
            ? error.message
            : "Log in again to get a fresh confirmation link."
        }
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        }
      />
    );
  }

  return (
    <VerifyState
      icon={<CheckCircle2 className="size-6 text-primary" aria-hidden />}
      title="You're in"
      description={redirecting ? "Taking you to your dashboard..." : "Login confirmed."}
    />
  );
}

function VerifyState({
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

export default function VerifyLoginPage() {
  return (
    <AuthLayout title="Verify login" background="transcript" subtitle="One more step to sign in.">
      <Suspense
        fallback={
          <VerifyState
            icon={<Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />}
            title="Confirming it's you"
            description="Hang tight while we verify your login."
          />
        }
      >
        <VerifyLoginContent />
      </Suspense>
    </AuthLayout>
  );
}
