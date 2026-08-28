import { NavBar } from "@/components/marketing/NavBar";
import { HeroActions } from "@/components/marketing/HeroActions";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <NavBar />

      <section className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-16 lg:py-24">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            [Debate Anything, Prove Everything]
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight lg:text-7xl">
            Challenge the AI.
            <br />
            Convince the Judge.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            DebateAI pairs you against an AI opponent in structured,
            multi-round debate — then an independent AI judge scores logic,
            evidence, rhetoric, and adherence to declare a winner.
          </p>
          <HeroActions />
        </div>

        <HeroVisual />
      </section>

      <HowItWorksSection />
    </div>
  );
}
