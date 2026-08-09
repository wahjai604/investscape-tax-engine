import { developerProfit } from "../../src/tax/developerProfit";
import {
  caOntario8UnitProject,
  usArizonaSingleFamily,
  usCaliforniaMultiFamily,
  caBreakEvenProject,
  usLossProject,
  usMinimalProject,
  usIgnoresGstHstAndDevCharges,
  caLossProjectWithRate,
  usZeroRevenueLoss,
  caFullSoftCostDetails,
} from "./fixtures/developerProfit.fixtures";

describe("E51: Developer Profit & Tax Engine", () => {
  describe("Canada — with GST/HST + dev charges", () => {
    it("should include GST/HST and dev charges in total costs and apply the marginal rate (Test 1)", () => {
      const result = developerProfit(caOntario8UnitProject);

      expect(result.totalCosts).toBe(1577000);
      expect(result.preMinusTaxProfit).toBe(223000);
      expect(result.afterTaxProfit).toBe(122650);
      // 100350 / 1800000 = 0.05575 exactly, which sits precisely on a
      // rounding boundary. Standard round-half-up (the same rule that
      // correctly yields Test 2's 0.0963 from 0.09625) rounds this to
      // 0.0558, not the spec prompt's stated 0.0557 — a hand-rounding slip
      // in the prompt, not a bug here.
      expect(result.effectiveTaxRate).toBe(0.0558);
      expect(result.gstHstOwing).toBe(65000);
      expect(result.developmentChargesOwing).toBe(72000);
    });
  });

  describe("US — no GST/HST or dev charges", () => {
    it("should sum hard + soft costs only for a single-family project (Test 2)", () => {
      const result = developerProfit(usArizonaSingleFamily);

      expect(result.totalCosts).toBe(580000);
      expect(result.preMinusTaxProfit).toBe(220000);
      expect(result.afterTaxProfit).toBe(143000);
      expect(result.effectiveTaxRate).toBe(0.0963);
    });

    it("should handle a large multi-family project without any CA-only fields present (Test 3)", () => {
      const result = developerProfit(usCaliforniaMultiFamily);

      expect(result.totalCosts).toBe(2450000);
      expect(result.preMinusTaxProfit).toBe(1050000);
      expect(result.afterTaxProfit).toBe(546000);
      expect(result.effectiveTaxRate).toBe(0.144);
      expect(result.gstHstOwing).toBe(0);
      expect(result.developmentChargesOwing).toBe(0);
    });

    it("should ignore gstHstOwing/developmentChargesOwing in totalCosts even if a US project supplies them", () => {
      const result = developerProfit(usIgnoresGstHstAndDevCharges);

      // 600000 + 100000 only — the 40000/60000 GST/dev-charge figures are echoed but not added.
      expect(result.totalCosts).toBe(700000);
      expect(result.gstHstOwing).toBe(40000);
      expect(result.developmentChargesOwing).toBe(60000);
      expect(result.preMinusTaxProfit).toBe(300000);
    });
  });

  describe("Edge cases", () => {
    it("should treat a break-even project as zero profit and zero after-tax profit, even without a marginal rate (Test 4)", () => {
      const result = developerProfit(caBreakEvenProject);

      expect(result.preMinusTaxProfit).toBe(0);
      expect(result.afterTaxProfit).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
    });

    it("should leave afterTaxProfit/effectiveTaxRate null on a loss with no marginal rate supplied (Test 5)", () => {
      const result = developerProfit(usLossProject);

      expect(result.totalCosts).toBe(1050000);
      expect(result.preMinusTaxProfit).toBe(-50000);
      expect(result.afterTaxProfit).toBeNull();
      expect(result.effectiveTaxRate).toBeNull();
    });

    it("should not tax a loss even when a marginal rate is supplied, passing the loss through unchanged", () => {
      const result = developerProfit(caLossProjectWithRate);

      expect(result.preMinusTaxProfit).toBe(-80000);
      expect(result.afterTaxProfit).toBe(-80000);
      expect(result.effectiveTaxRate).toBe(0);
    });

    it("should report a zero effective tax rate rather than dividing by zero when revenue is zero", () => {
      const result = developerProfit(usZeroRevenueLoss);

      expect(result.preMinusTaxProfit).toBe(-1000);
      expect(result.afterTaxProfit).toBe(-1000);
      expect(result.effectiveTaxRate).toBe(0);
    });

    it("should handle a project with zero soft costs (Test 6)", () => {
      const result = developerProfit(usMinimalProject);

      expect(result.totalCosts).toBe(300000);
      expect(result.preMinusTaxProfit).toBe(200000);
      expect(result.afterTaxProfit).toBe(140000);
      expect(result.effectiveTaxRate).toBe(0.12);
    });

    it("should echo softCostDetails and other inputs verbatim without using them in the calculation", () => {
      const result = developerProfit(caFullSoftCostDetails);

      expect(result.inputs.softCostDetails).toEqual(caFullSoftCostDetails.softCostDetails);
      // softCosts (150000) drives the math, not the sum of softCostDetails (150000 here too, but
      // that's incidental — the engine never reads softCostDetails for the calculation).
      expect(result.softCosts).toBe(150000);
      expect(result.totalCosts).toBe(1020000);
    });

    it("should echo inputs, jurisdiction, and produce an ISO 8601 timestamp with the current year", () => {
      const result = developerProfit(caOntario8UnitProject);

      expect(result.inputs).toEqual(caOntario8UnitProject);
      expect(result.jurisdiction).toBe("CA");
      expect(result.year).toBe(new Date().getFullYear());
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
