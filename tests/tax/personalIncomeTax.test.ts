import { personalIncomeTax } from "../../src/tax/personalIncomeTax";
import {
  canadaBcPositiveIncome,
  usAzMarriedFilingJointly,
  usTexasNoStateTax,
  canadaOntarioLowIncome,
  canadaZeroIncome,
  usCaliforniaTopBracket,
} from "./fixtures/personalIncomeTax.fixtures";

describe("E47: Personal Income Tax Engine", () => {
  describe("Canada — BC, positive income", () => {
    it("should apply federal and provincial brackets correctly", () => {
      const result = personalIncomeTax(canadaBcPositiveIncome);

      expect(result.federalTaxOwing).toBe(14147.32);
      expect(result.federalTaxBracket).toBe("20.5%");
      expect(result.provincialStateTaxOwing).toBe(5202.46);
      expect(result.provincialStateTaxBracket).toBe("7.7%");
      expect(result.totalTaxOwing).toBe(19349.78);
      // Spec's worked example states marginalTaxRate: 0.275 with the comment
      // "20.5% + 7.7%", but 0.205 + 0.077 = 0.282, not 0.275. That worked
      // example has an arithmetic slip; the correct sum of marginal rates
      // is asserted here instead of the spec's stated figure.
      expect(result.marginalTaxRate).toBe(0.282);
      expect(result.effectiveTaxRate).toBe(0.2304);
      expect(result.brackets.federalBrackets).toEqual([
        { income: 55867, rate: 0.15, tax: 8380.05 },
        { income: 28133, rate: 0.205, tax: 5767.27 },
      ]);
      expect(result.brackets.provincialStateBrackets).toEqual([
        { income: 47937, rate: 0.0506, tax: 2425.61 },
        { income: 36063, rate: 0.077, tax: 2776.85 },
      ]);
    });
  });

  describe("US — Arizona, married filing jointly", () => {
    it("should apply federal and state brackets by filing status", () => {
      const result = personalIncomeTax(usAzMarriedFilingJointly);

      expect(result.federalTaxOwing).toBe(24866);
      expect(result.federalTaxBracket).toBe("22%");
      expect(result.provincialStateTaxOwing).toBe(4788);
      expect(result.provincialStateTaxBracket).toBe("3.55%");
      expect(result.totalTaxOwing).toBe(29654);
      expect(result.marginalTaxRate).toBe(0.2555);
      expect(result.effectiveTaxRate).toBe(0.1877);
    });
  });

  describe("US — Texas, no state income tax", () => {
    it("should return zero state tax for no-income-tax states", () => {
      const result = personalIncomeTax(usTexasNoStateTax);

      expect(result.federalTaxOwing).toBe(20402.5);
      expect(result.federalTaxBracket).toBe("24%");
      expect(result.provincialStateTaxOwing).toBe(0);
      expect(result.provincialStateTaxBracket).toBe("0%");
      expect(result.totalTaxOwing).toBe(20402.5);
      expect(result.marginalTaxRate).toBe(0.24);
      // Spec states effectiveTaxRate: 0.1789; 20402.5 / 114000 rounds to
      // 0.1790 (trailing zero dropped => 0.179), not 0.1789 — the spec
      // truncated instead of rounding. Asserting the correctly rounded value.
      expect(result.effectiveTaxRate).toBe(0.179);
      expect(result.brackets.federalBrackets).toEqual([
        { income: 11600, rate: 0.1, tax: 1160 },
        { income: 35550, rate: 0.12, tax: 4266 },
        { income: 53375, rate: 0.22, tax: 11742.5 },
        { income: 13475, rate: 0.24, tax: 3234 },
      ]);
      expect(result.brackets.provincialStateBrackets).toEqual([]);
    });
  });

  describe("Canada — Ontario, low income", () => {
    it("should handle low-income scenarios correctly", () => {
      const result = personalIncomeTax(canadaOntarioLowIncome);

      expect(result.federalTaxOwing).toBe(4500);
      expect(result.federalTaxBracket).toBe("15%");
      expect(result.provincialStateTaxOwing).toBe(1515);
      expect(result.provincialStateTaxBracket).toBe("5.05%");
      expect(result.totalTaxOwing).toBe(6015);
      expect(result.marginalTaxRate).toBe(0.2005);
      expect(result.effectiveTaxRate).toBe(0.2005);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero income without producing NaN", () => {
      const result = personalIncomeTax(canadaZeroIncome);

      expect(result.federalTaxOwing).toBe(0);
      expect(result.provincialStateTaxOwing).toBe(0);
      expect(result.totalTaxOwing).toBe(0);
      expect(result.marginalTaxRate).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
      expect(Number.isNaN(result.effectiveTaxRate)).toBe(false);
      expect(result.brackets.federalBrackets).toEqual([]);
      expect(result.brackets.provincialStateBrackets).toEqual([]);
    });

    it("should apply top-bracket progressive tax correctly for very high income", () => {
      const result = personalIncomeTax(usCaliforniaTopBracket);

      // Verified against the engine's own bracket-by-bracket math rather
      // than the spec's worked example, which explicitly flags its federal
      // figure as "(approximate; uses 35% + 37% brackets)" and undershoots
      // the true progressive calculation across all seven brackets.
      expect(result.federalTaxOwing).toBe(217187.75);
      expect(result.federalTaxBracket).toBe("37%");
      expect(result.provincialStateTaxOwing).toBe(68559.71);
      expect(result.provincialStateTaxBracket).toBe("12.3%");
      expect(result.totalTaxOwing).toBe(285747.46);
      expect(result.marginalTaxRate).toBe(0.493);
      expect(result.effectiveTaxRate).toBe(0.4082);
    });

    it("should calculate effective rate as totalTaxOwing / totalIncome", () => {
      const result = personalIncomeTax(canadaBcPositiveIncome);
      expect(result.effectiveTaxRate).toBe(
        Math.round((result.totalTaxOwing / result.totalIncome) * 10000) / 10000
      );
    });

    it("should echo inputs and produce an ISO 8601 timestamp", () => {
      const result = personalIncomeTax(canadaBcPositiveIncome);

      expect(result.inputs).toEqual(canadaBcPositiveIncome);
      expect(result.totalIncome).toBe(canadaBcPositiveIncome.totalIncome);
      expect(result.taxableIncome).toBe(canadaBcPositiveIncome.totalIncome);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });

    it("should throw for a Canadian province without loaded bracket data", () => {
      expect(() =>
        personalIncomeTax({
          totalIncome: 50000,
          jurisdiction: "CA",
          province: "QC",
          filingStatus: "single",
          year: 2026,
        })
      ).toThrow(/Provincial tax bracket data not yet loaded for province 'QC'/);
    });

    it("should throw for a US state without loaded bracket data", () => {
      expect(() =>
        personalIncomeTax({
          totalIncome: 100000,
          jurisdiction: "US",
          state: "NY",
          filingStatus: "single",
          year: 2026,
        })
      ).toThrow(/State tax bracket data not yet loaded for state 'NY'/);
    });

    it("should throw for a year without loaded bracket data", () => {
      expect(() =>
        personalIncomeTax({
          totalIncome: 50000,
          jurisdiction: "CA",
          province: "BC",
          filingStatus: "single",
          year: 2030,
        })
      ).toThrow(/Canadian tax bracket data not loaded for year 2030/);
    });

    it("should treat no-income-tax states as verified zero tax, not missing data", () => {
      const result = personalIncomeTax(usTexasNoStateTax);
      expect(() => result).not.toThrow();
      expect(result.provincialStateTaxOwing).toBe(0);
    });

    it("should throw when a CA input is missing province", () => {
      expect(() =>
        personalIncomeTax({
          totalIncome: 50000,
          jurisdiction: "CA",
          filingStatus: "single",
          year: 2026,
        })
      ).toThrow(/province is required for CA jurisdiction/);
    });

    it("should throw for a US year without loaded bracket data", () => {
      expect(() =>
        personalIncomeTax({
          totalIncome: 50000,
          jurisdiction: "US",
          state: "TX",
          filingStatus: "single",
          year: 2030,
        })
      ).toThrow(/US tax bracket data not loaded for year 2030/);
    });

    it("should throw for a US filing status without loaded federal bracket data", () => {
      // Defensive guard: unreachable through valid TS input today (all three
      // FilingStatus values have bracket data), but protects against a
      // future filing status being added to the type without matching data.
      expect(() =>
        personalIncomeTax({
          totalIncome: 50000,
          jurisdiction: "US",
          state: "TX",
          filingStatus: "widowed" as unknown as "single",
          year: 2026,
        })
      ).toThrow(/US federal tax bracket data not loaded for filing status 'widowed'/);
    });

    it("should throw for a US input missing state", () => {
      expect(() =>
        personalIncomeTax({
          totalIncome: 50000,
          jurisdiction: "US",
          filingStatus: "single",
          year: 2026,
        })
      ).toThrow(/state is required for US jurisdiction/);
    });
  });
});
