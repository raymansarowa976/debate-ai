"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "./IconInput";
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
        <IconInput
          id="login-identifier"
          type="text"
          icon={User}
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
          value={password}
          onChange={setPassword}
          disabled={isSubmitting}
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        Log In
      </Button>
    </form>
  );
}
