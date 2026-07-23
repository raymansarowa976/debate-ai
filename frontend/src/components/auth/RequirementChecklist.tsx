import { Check, Circle } from "lucide-react";
import type { Requirement } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

export interface RequirementChecklistProps {
  requirements: Requirement[];
  ariaLabel: string;
}

export function RequirementChecklist({
  requirements,
  ariaLabel,
}: RequirementChecklistProps) {
  const metCount = requirements.filter((requirement) => requirement.met).length;
  const percent = requirements.length === 0 ? 0 : (metCount / requirements.length) * 100;

  return (
    <div className="space-y-1.5">
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={metCount}
        aria-valuemin={0}
        aria-valuemax={requirements.length}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="space-y-1">
        {requirements.map((requirement) => (
          <li
            key={requirement.label}
            data-met={requirement.met}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              requirement.met ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {requirement.met ? (
              <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
            ) : (
              <Circle className="size-3.5 shrink-0" aria-hidden />
            )}
            {requirement.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
