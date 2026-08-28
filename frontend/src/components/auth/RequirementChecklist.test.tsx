import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RequirementChecklist } from "./RequirementChecklist";

const requirements = [
  { label: "At least 3 characters", met: true },
  { label: "No spaces", met: false },
];

describe("RequirementChecklist", () => {
  it("renders a label for every requirement", () => {
    render(
      <RequirementChecklist ariaLabel="Username requirements" requirements={requirements} />
    );

    expect(screen.getByText("At least 3 characters")).toBeInTheDocument();
    expect(screen.getByText("No spaces")).toBeInTheDocument();
  });

  it("renders a progress bar reflecting how many requirements are met", () => {
    render(
      <RequirementChecklist ariaLabel="Username requirements" requirements={requirements} />
    );

    const progress = screen.getByRole("progressbar", { name: "Username requirements" });
    expect(progress).toHaveAttribute("aria-valuenow", "1");
    expect(progress).toHaveAttribute("aria-valuemax", "2");
  });

  it("shows a full progress bar when every requirement is met", () => {
    render(
      <RequirementChecklist
        ariaLabel="Password requirements"
        requirements={[
          { label: "a", met: true },
          { label: "b", met: true },
        ]}
      />
    );

    const progress = screen.getByRole("progressbar", { name: "Password requirements" });
    expect(progress).toHaveAttribute("aria-valuenow", "2");
  });

  it("shows an empty progress bar when no requirements are met", () => {
    render(
      <RequirementChecklist
        ariaLabel="Password requirements"
        requirements={[
          { label: "a", met: false },
          { label: "b", met: false },
        ]}
      />
    );

    const progress = screen.getByRole("progressbar", { name: "Password requirements" });
    expect(progress).toHaveAttribute("aria-valuenow", "0");
  });

  it("marks met requirements distinctly from unmet ones", () => {
    render(
      <RequirementChecklist ariaLabel="Username requirements" requirements={requirements} />
    );

    expect(screen.getByText("At least 3 characters").closest("li")).toHaveAttribute(
      "data-met",
      "true"
    );
    expect(screen.getByText("No spaces").closest("li")).toHaveAttribute(
      "data-met",
      "false"
    );
  });
});
