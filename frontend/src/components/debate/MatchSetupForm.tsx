"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Stance } from "@/lib/api/matches";

export interface MatchSetupFormProps {
  onSubmit: (topic: string, stance: Stance) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const STANCES: { value: Stance; label: string }[] = [
  { value: "FOR", label: "For" },
  { value: "AGAINST", label: "Against" },
];

const TOPIC_MAX_LENGTH = 99;

export function MatchSetupForm({
  onSubmit,
  isSubmitting = false,
  error = null,
}: MatchSetupFormProps) {
  const [topic, setTopic] = useState("");
  const [stance, setStance] = useState<Stance>("FOR");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(topic.trim(), stance);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="topic" className="text-sm font-medium">
          Debate topic
        </label>
        <div className="relative">
          <MessageSquare
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="topic"
            type="text"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Social media does more harm than good"
            maxLength={TOPIC_MAX_LENGTH}
            disabled={isSubmitting}
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">
          {topic.length}/{TOPIC_MAX_LENGTH}
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Your stance</legend>
        <div className="inline-flex rounded-full border border-border p-1">
          {STANCES.map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50",
                stance === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <input
                type="radio"
                name="stance"
                value={value}
                checked={stance === value}
                onChange={() => setStance(value)}
                disabled={isSubmitting}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || topic.trim().length === 0}
      >
        {isSubmitting ? "Starting…" : "Start Debate"}
      </Button>
    </form>
  );
}
