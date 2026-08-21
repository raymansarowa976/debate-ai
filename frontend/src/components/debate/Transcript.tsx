"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MessageDTO, RoundDTO } from "@/lib/api/matches";

export interface TranscriptProps {
  rounds: RoundDTO[];
  aiTurnPending?: boolean;
}

function Avatar({ sender }: { sender: MessageDTO["sender"] }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-6 shrink-0 rounded-full",
        sender === "AI" ? "bg-foreground" : "bg-muted"
      )}
    />
  );
}

function ThinkingIndicator() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="ai-thinking-indicator"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <span aria-hidden="true" className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/60 motion-reduce:animate-none" />
      </span>
      AI is thinking…
    </div>
  );
}

function MessageRow({ message }: { message: MessageDTO }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar sender={message.sender} />
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground">
          {message.sender === "AI" ? "AI" : "You"}
        </p>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}

function RoundItem({
  round,
  expanded,
  pending,
  onToggle,
}: {
  round: RoundDTO;
  expanded: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <div data-testid={`round-${round.round_number}`} className="border-b border-border pb-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between py-2 text-sm font-medium"
      >
        Round {round.round_number}
        <span aria-hidden="true">{expanded ? "⌄" : "▸"}</span>
      </button>
      {expanded && (
        <div className="space-y-3 pt-1">
          {round.messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
          {pending && <ThinkingIndicator />}
        </div>
      )}
    </div>
  );
}

export function Transcript({ rounds, aiTurnPending = false }: TranscriptProps) {
  const latestRoundId = rounds.length > 0 ? rounds[rounds.length - 1].id : null;
  const [collapsedOverrides, setCollapsedOverrides] = useState<Set<number>>(new Set());

  if (rounds.length === 0) {
    return null;
  }

  function toggle(roundId: number) {
    setCollapsedOverrides((previous) => {
      const next = new Set(previous);
      if (next.has(roundId)) {
        next.delete(roundId);
      } else {
        next.add(roundId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-1">
      {rounds.map((round) => {
        const isLatest = round.id === latestRoundId;
        const isOverridden = collapsedOverrides.has(round.id);
        const expanded = isOverridden ? !isLatest : isLatest;

        return (
          <RoundItem
            key={round.id}
            round={round}
            expanded={expanded}
            pending={isLatest && aiTurnPending}
            onToggle={() => toggle(round.id)}
          />
        );
      })}
    </div>
  );
}
