import { NavBar } from "@/components/marketing/NavBar";
import { HeroActions } from "@/components/marketing/HeroActions";
import { HeroVisual } from "@/components/marketing/HeroVisual";

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

      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-3 lg:px-16 lg:py-24">
          <div>
            <span className="text-sm font-medium text-muted-foreground">01</span>
            <h3 className="mt-2 text-xl font-semibold">State your case</h3>
            <p className="mt-2 text-muted-foreground">
              Pick a topic and open with your strongest argument, within a
              structured word count.
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">02</span>
            <h3 className="mt-2 text-xl font-semibold">AI responds</h3>
            <p className="mt-2 text-muted-foreground">
              Your opponent holds its stance and pushes back, round after
              round.
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">03</span>
            <h3 className="mt-2 text-xl font-semibold">Independent judge scores it</h3>
            <p className="mt-2 text-muted-foreground">
              A separate AI judge grades logic, evidence, rhetoric, and
              adherence — then declares a winner.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
