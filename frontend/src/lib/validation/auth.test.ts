import { describe, expect, it } from "vitest";
import {
  allRequirementsMet,
  getPasswordRequirements,
  getUsernameRequirements,
} from "./auth";

describe("getUsernameRequirements", () => {
  it("marks the minimum length requirement unmet for a username shorter than 3 characters", () => {
    const requirements = getUsernameRequirements("ab");
    expect(requirements.every((r) => r.met)).toBe(false);
  });

  it("marks the minimum length requirement met for a username of exactly 3 characters", () => {
    const requirements = getUsernameRequirements("abc");
    expect(requirements.every((r) => r.met)).toBe(true);
  });

  it("does not count leading/trailing whitespace toward the length", () => {
    const requirements = getUsernameRequirements("  a  ");
    expect(requirements.every((r) => r.met)).toBe(false);
  });

  it("marks all requirements met for a longer username", () => {
    const requirements = getUsernameRequirements("debater99");
    expect(requirements.every((r) => r.met)).toBe(true);
  });
});

describe("getPasswordRequirements", () => {
  it("returns every requirement unmet for an empty password", () => {
    const requirements = getPasswordRequirements("");
    expect(requirements.every((r) => !r.met)).toBe(true);
  });

  it("marks the length requirement unmet under 8 characters", () => {
    const requirements = getPasswordRequirements("Sh0rt!a");
    const lengthReq = requirements.find((r) => r.label.includes("8"));
    expect(lengthReq?.met).toBe(false);
  });

  it("marks the lowercase requirement unmet when there is no lowercase letter", () => {
    const requirements = getPasswordRequirements("ALLUPPER1!");
    const req = requirements.find((r) => r.label.toLowerCase().includes("lowercase"));
    expect(req?.met).toBe(false);
  });

  it("marks the uppercase requirement unmet when there is no uppercase letter", () => {
    const requirements = getPasswordRequirements("alllower1!");
    const req = requirements.find((r) => r.label.toLowerCase().includes("uppercase"));
    expect(req?.met).toBe(false);
  });

  it("marks the number requirement unmet when there is no digit", () => {
    const requirements = getPasswordRequirements("NoDigits!!");
    const req = requirements.find((r) => r.label.toLowerCase().includes("number"));
    expect(req?.met).toBe(false);
  });

  it("marks the special character requirement unmet when there is no special character", () => {
    const requirements = getPasswordRequirements("NoSpecial1Aa");
    const req = requirements.find((r) => r.label.toLowerCase().includes("special"));
    expect(req?.met).toBe(false);
  });

  it("marks every requirement met for a fully valid password", () => {
    const requirements = getPasswordRequirements("Val1d!Pass");
    expect(requirements.every((r) => r.met)).toBe(true);
  });

  it("returns exactly 5 requirements", () => {
    expect(getPasswordRequirements("Val1d!Pass")).toHaveLength(5);
  });
});

describe("allRequirementsMet", () => {
  it("returns true when every requirement is met", () => {
    expect(
      allRequirementsMet([
        { label: "a", met: true },
        { label: "b", met: true },
      ])
    ).toBe(true);
  });

  it("returns false when any requirement is unmet", () => {
    expect(
      allRequirementsMet([
        { label: "a", met: true },
        { label: "b", met: false },
      ])
    ).toBe(false);
  });
});
