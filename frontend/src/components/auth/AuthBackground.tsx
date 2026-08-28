import { cn } from "@/lib/utils";

function ArgumentBubble({
  className,
  lineWidths,
}: {
  className: string;
  lineWidths: string[];
}) {
  return (
    <div
      className={cn(
        "absolute rounded-3xl border border-foreground/10 bg-foreground/[0.04] p-5",
        className
      )}
    >
      <div className="space-y-2">
        {lineWidths.map((width, index) => (
          <div key={index} className={cn("h-2 rounded-full bg-foreground/10", width)} />
        ))}
      </div>
    </div>
  );
}

export function ArgumentBubblesBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <ArgumentBubble
        className="-left-12 top-16 w-72 -rotate-6"
        lineWidths={["w-full", "w-5/6", "w-4/6"]}
      />
      <ArgumentBubble
        className="-right-16 top-1/3 w-64 rotate-6"
        lineWidths={["w-full", "w-full", "w-3/6"]}
      />
      <ArgumentBubble
        className="-left-8 bottom-16 w-80 rotate-3"
        lineWidths={["w-5/6", "w-full", "w-2/6"]}
      />
    </div>
  );
}

export function DebateClashBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.05] blur-3xl" />
      <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-foreground/[0.08] blur-2xl motion-reduce:animate-none" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-foreground/10 to-transparent" />

      <ArgumentBubble
        className="-left-16 top-16 w-64 -rotate-6"
        lineWidths={["w-full", "w-4/6"]}
      />
      <ArgumentBubble
        className="-left-10 bottom-20 w-56 rotate-3"
        lineWidths={["w-5/6", "w-2/6"]}
      />
      <ArgumentBubble
        className="-right-16 top-24 w-64 rotate-6"
        lineWidths={["w-full", "w-3/6"]}
      />
      <ArgumentBubble
        className="-right-10 bottom-16 w-56 -rotate-3"
        lineWidths={["w-4/6", "w-5/6"]}
      />
    </div>
  );
}

const TRANSCRIPT_ROWS = [
  "w-5/6",
  "w-2/3",
  "w-full",
  "w-3/4",
  "w-1/2",
  "w-5/6",
  "w-2/3",
  "w-full",
  "w-3/5",
  "w-4/5",
  "w-1/2",
  "w-full",
  "w-2/3",
  "w-5/6",
  "w-3/4",
  "w-1/2",
  "w-full",
  "w-3/5",
  "w-4/5",
  "w-2/3",
];

export function TranscriptTextureBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 overflow-hidden px-10"
    >
      {TRANSCRIPT_ROWS.map((width, index) => (
        <div
          key={index}
          className={cn("h-2.5 rounded-full bg-foreground/[0.06]", width)}
        />
      ))}
    </div>
  );
}
