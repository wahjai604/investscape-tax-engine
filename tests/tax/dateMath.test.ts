import { addDaysISO, addYearsISO, earlierISODate } from "../../src/utils/dateMath";

describe("utils/dateMath", () => {
  it("should add calendar days across a month boundary", () => {
    expect(addDaysISO("2026-01-07", 45)).toBe("2026-02-21");
  });

  it("should add calendar years, rolling Feb 29 forward on a non-leap target year", () => {
    expect(addYearsISO("2024-02-29", 1)).toBe("2025-03-01");
  });

  it("should return the earlier of two ISO dates", () => {
    expect(earlierISODate("2026-04-15", "2026-07-06")).toBe("2026-04-15");
    expect(earlierISODate("2026-07-06", "2026-04-15")).toBe("2026-04-15");
  });

  it("should throw on a malformed ISO date", () => {
    expect(() => addDaysISO("not-a-date", 1)).toThrow(/invalid iso date/i);
  });
});
