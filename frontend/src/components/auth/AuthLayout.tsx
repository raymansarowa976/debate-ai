import Link from "next/link";
import { Check } from "lucide-react";
import { ArgumentBubblesBackground, TranscriptTextureBackground } from "./AuthBackground";

const FEATURES = [
  "Debate an AI across structured, multi-round matches",
  "Get scored on logic, evidence, rhetoric, and adherence",
  "See exactly why you won or lost from an independent judge",
];

export interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  background: "bubbles" | "transcript";
}

const BACKGROUNDS = {
  bubbles: ArgumentBubblesBackground,
  transcript: TranscriptTextureBackground,
};

export function AuthLayout({ title, subtitle, children, background }: AuthLayoutProps) {
  const Background = BACKGROUNDS[background];

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground px-12 py-12 text-background lg:flex lg:w-1/2 xl:px-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-sm bg-background text-xs font-bold text-foreground">
            D
          </span>
          <span className="text-base font-semibold tracking-tight">DebateAI</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-[1.15] tracking-tight">
            Sharpen your arguments against an opponent that never tires.
          </h2>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-background/80">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background/15">
                  <Check className="size-3" aria-hidden />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-background/50">
          &copy; {new Date().getFullYear()} DebateAI. All rights reserved.
        </p>
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden bg-neutral-200 px-6 py-16 dark:bg-neutral-900 lg:w-1/2">
        <Background />

        <div className="relative z-10 w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-6 items-center justify-center rounded-sm bg-foreground text-xs font-bold text-background">
              D
            </span>
            <span className="text-base font-semibold tracking-tight">DebateAI</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
