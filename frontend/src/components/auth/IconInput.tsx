import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { authInputClassName } from "./input-styles";

export interface IconInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  icon: LucideIcon;
  className?: string;
}

export function IconInput({ icon: Icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input className={cn(authInputClassName, className)} {...props} />
    </div>
  );
}
