"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MatchStatus } from "@/lib/api/matches";

export interface DebatePanelProps {
  status: MatchStatus;
  onSubmitArgument: (text: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function DebatePanel({
  status,
  onSubmitArgument,
  isSubmitting = false,
  error = null,
}: DebatePanelProps) {
  const [value, setValue] = useState("");
  const locked = status === "AI_TURN";
  const disabled = locked || isSubmitting;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmitArgument(value);
    setValue("");
  }

  return (
    <div className="space-y-4">
      {locked && (
        <div
          data-testid="ai-turn-skeleton"
          role="status"
          aria-live="polite"
          className="space-y-2"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <span className="sr-only">Waiting for AI response…</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="min-h-32 w-full rounded-lg border border-border bg-background p-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          placeholder="Make your argument (50-500 words)..."
        />
        <Button type="submit" size="lg" className="w-full" disabled={disabled}>
          Submit Argument
        </Button>
      </form>
    </div>
  );
}
