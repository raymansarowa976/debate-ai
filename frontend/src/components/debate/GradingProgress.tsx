import { cn } from "@/lib/utils";
import type { GradingEventName } from "@/lib/ws/gradingEvents";

export interface GradingProgressProps {
  events: GradingEventName[];
}

type StepStatus = "pending" | "active" | "done";

const STEPS: { key: GradingEventName; label: string }[] = [
  { key: "JUDGE_START", label: "The judge is reviewing the debate…" },
  {
    key: "LOGIC_EVALUATED",
    label: "Scoring logic, evidence, rhetoric, and adherence…",
  },
  { key: "FINAL_COMPILATION", label: "Compiling the final scorecard…" },
];

export function GradingProgress({ events }: GradingProgressProps) {
  const reachedIndex = STEPS.reduce(
    (highest, step, index) => (events.includes(step.key) ? index : highest),
    -1
  );
  const isFullyComplete = reachedIndex === STEPS.length - 1;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="grading-progress"
      className="space-y-2"
    >
      {STEPS.map((step, index) => {
        const status: StepStatus = isFullyComplete
          ? "done"
          : index < reachedIndex
            ? "done"
            : index === reachedIndex
              ? "active"
              : "pending";

        return (
          <div
            key={step.key}
            data-testid={`grading-step-${step.key}`}
            data-status={status}
            aria-current={status === "active" ? "step" : undefined}
            className={cn(
              "text-sm transition-colors",
              status === "pending" && "text-muted-foreground/50",
              status === "active" && "font-medium text-foreground",
              status === "done" && "text-muted-foreground"
            )}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
