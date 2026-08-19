const STEPS = [
  {
    number: "01",
    title: "State your case",
    description:
      "Pick a topic and open with your strongest argument, within a structured word count.",
  },
  {
    number: "02",
    title: "AI responds",
    description: "Your opponent holds its stance and pushes back, round after round.",
  },
  {
    number: "03",
    title: "Independent judge scores it",
    description:
      "A separate AI judge grades logic, evidence, rhetoric, and adherence — then declares a winner.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-3 lg:px-16 lg:py-24">
        {STEPS.map((step) => (
          <div key={step.number}>
            <span className="text-sm font-medium text-muted-foreground">
              {step.number}
            </span>
            <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
