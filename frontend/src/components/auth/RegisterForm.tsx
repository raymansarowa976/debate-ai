"use client";

import { useState } from "react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPasswordRequirements, getUsernameRequirements } from "@/lib/validation/auth";
import { IconInput } from "./IconInput";
import { PasswordInput } from "./PasswordInput";
import { RequirementChecklist } from "./RequirementChecklist";

export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
}

export interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function RegisterForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = confirmPassword.length > 0 ? password === confirmPassword : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) return;
    onSubmit({ username, email, password });
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
        <label htmlFor="register-username" className="text-sm font-medium">
          Username
        </label>
        <IconInput
          id="register-username"
          type="text"
          icon={User}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSubmitting}
          autoComplete="username"
        />
        <RequirementChecklist
          ariaLabel="Username requirements"
          requirements={getUsernameRequirements(username)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium">
          Email
        </label>
        <IconInput
          id="register-email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium">
          Password
        </label>
        <PasswordInput
          id="register-password"
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
        <label htmlFor="register-confirm-password" className="text-sm font-medium">
          Confirm Password
        </label>
        <PasswordInput
          id="register-confirm-password"
          toggleLabel="confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {passwordsMatch !== null && (
          <p
            className={
              passwordsMatch ? "text-xs text-primary" : "text-xs text-destructive"
            }
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        Create Account
      </Button>
    </form>
  );
}
