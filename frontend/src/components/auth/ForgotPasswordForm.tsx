"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "./IconInput";

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ForgotPasswordFormProps {
  onSubmit: (values: ForgotPasswordFormValues) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function ForgotPasswordForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ email });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="forgot-password-email" className="text-sm font-medium">
          Email
        </label>
        <IconInput
          id="forgot-password-email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          autoComplete="email"
        />
        <div className="text-right">
          <Link
            href="/login"
            className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to login
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
