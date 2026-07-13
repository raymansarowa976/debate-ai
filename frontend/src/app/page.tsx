import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">DebateAI</h1>
      <p className="max-w-md text-muted-foreground">
        Challenge an AI opponent in formal debate. An independent judge
        scores every match on logic, evidence, rhetoric, and adherence.
      </p>
      <Button size="lg">Start a Debate</Button>
    </main>
  );
}
