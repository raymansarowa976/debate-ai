"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getPasswordRequirements, getUsernameRequirements } from "@/lib/validation/auth";
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

const inputClassName =
  "w-full rounded-lg border border-border bg-background p-2.5 text-sm disabled:opacity-50";

export function RegisterForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
        <input
          id="register-username"
          type="text"
          className={inputClassName}
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
        <input
          id="register-email"
          type="email"
          className={inputClassName}
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
        <input
          id="register-password"
          type="password"
          className={inputClassName}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        <RequirementChecklist
          ariaLabel="Password requirements"
          requirements={getPasswordRequirements(password)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Create Account
      </Button>
    </form>
  );
}
