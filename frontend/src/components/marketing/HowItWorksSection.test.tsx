import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowItWorksSection } from "./HowItWorksSection";

describe("HowItWorksSection", () => {
  it("renders the three debate steps in order", () => {
    render(<HowItWorksSection />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "State your case",
      "AI responds",
      "Independent judge scores it",
    ]);
  });

  it("exposes an anchorable id for in-page navigation", () => {
    const { container } = render(<HowItWorksSection />);

    expect(container.querySelector("#how-it-works")).not.toBeNull();
  });
});
