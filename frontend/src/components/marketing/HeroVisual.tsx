import { Check } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-80 w-full max-w-md items-center justify-center lg:h-[26rem]">
      <div className="absolute left-0 top-4 w-56 -rotate-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
            U
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Your Argument
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-5/6 rounded-full bg-muted" />
          <div className="h-2 w-4/6 rounded-full bg-muted" />
        </div>
      </div>

      <div className="absolute bottom-4 right-0 w-56 rotate-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            AI
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            AI Rebuttal
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-3/6 rounded-full bg-muted" />
        </div>
      </div>

      <div className="absolute z-10 flex size-16 items-center justify-center rounded-full border border-border bg-background text-lg font-bold shadow-md">
        VS
      </div>

      <div className="absolute -bottom-2 left-6 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
        <div className="flex items-end gap-0.5">
          <span className="h-3 w-1 rounded-full bg-foreground/30" />
          <span className="h-5 w-1 rounded-full bg-foreground/60" />
          <span className="h-4 w-1 rounded-full bg-foreground/40" />
          <span className="h-6 w-1 rounded-full bg-foreground" />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium">
          <Check className="size-3.5" />
          Judged
        </div>
      </div>
    </div>
  );
}
