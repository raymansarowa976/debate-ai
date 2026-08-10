"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPasswordRequirements } from "@/lib/validation/auth";
import { PasswordInput } from "./PasswordInput";
import { RequirementChecklist } from "./RequirementChecklist";

export interface ResetPasswordFormValues {
  password: string;
}

export interface ResetPasswordFormProps {
  onSubmit: (values: ResetPasswordFormValues) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function ResetPasswordForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = confirmPassword.length > 0 ? password === confirmPassword : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) return;
    onSubmit({ password });
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
        <label htmlFor="reset-password-password" className="text-sm font-medium">
          New password
        </label>
        <PasswordInput
          id="reset-password-password"
          toggleLabel="password"
          value={password}
          onChange={setPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        <RequirementChecklist
          ariaLabel="Password requirements"
          requirements={getPasswordRequirements(password)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reset-password-confirm-password" className="text-sm font-medium">
          Confirm new password
        </label>
        <PasswordInput
          id="reset-password-confirm-password"
          toggleLabel="confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {passwordsMatch !== null && (
          <p
            className={passwordsMatch ? "text-xs text-primary" : "text-xs text-destructive"}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        Reset password
      </Button>
    </form>
  );
}
