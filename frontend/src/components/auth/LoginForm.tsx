"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./PasswordInput";

export interface LoginFormValues {
  identifier: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const inputClassName =
  "w-full rounded-lg border border-border bg-background p-2.5 text-sm disabled:opacity-50";

export function LoginForm({ onSubmit, isSubmitting = false, error = null }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ identifier, password });
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
        <label htmlFor="login-identifier" className="text-sm font-medium">
          Username or email
        </label>
        <input
          id="login-identifier"
          type="text"
          className={inputClassName}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          disabled={isSubmitting}
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium">
          Password
        </label>
        <PasswordInput
          id="login-password"
          toggleLabel="password"
          className={inputClassName}
          value={password}
          onChange={setPassword}
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Log In
      </Button>
    </form>
  );
}
