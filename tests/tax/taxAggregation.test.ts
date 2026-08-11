import { taxAggregation } from "../../src/E46-tax-aggregation";
import {
  canadaPositiveIncome,
  canadaCcaLossRestriction,
  usPassiveActivityLoss,
  usMultiPropertyNoLoss,
} from "./fixtures/taxAggregation.fixtures";

describe("E46: Tax Aggregation Engine", () => {
  describe("Canada — Positive income", () => {
    it("should aggregate multiple properties and allow full depreciation", () => {
      const result = taxAggregation(canadaPositiveIncome);

      expect(result.aggregateRentalIncome).toBe(36000);
      expect(result.aggregateRentalExpenses).toBe(9000);
      expect(result.aggregateMortgageInterest).toBe(14000);
      expect(result.aggregateDepreciation).toBe(9000);
      expect(result.rentalIncomePool).toBe(36000);
      expect(result.deductibleExpenses).toBe(23000);
      expect(result.depreciationAllowed).toBe(9000);
      expect(result.taxableIncome).toBe(4000);
      expect(result.capitalGains).toBe(0);
      expect(result.totalIncome).toBe(84000);
      expect(result.flags).toEqual({
        hasNegativeCashFlow: false,
        depreciationExceedsIncome: false,
        realEstateProfessional: false,
        passiveActivityLossLikely: false,
      });
    });
  });

  describe("Canada — CCA rental-loss restriction", () => {
    it("should zero out depreciation when rental income is negative", () => {
      const result = taxAggregation(canadaCcaLossRestriction);

      expect(result.rentalIncomePool).toBe(18000);
      expect(result.deductibleExpenses).toBe(20000);
      expect(result.depreciationAllowed).toBe(0);
      expect(result.taxableIncome).toBe(-2000);
      expect(result.totalIncome).toBe(58000);
      expect(result.flags).toEqual({
        hasNegativeCashFlow: true,
        depreciationExceedsIncome: true,
        realEstateProfessional: false,
        passiveActivityLossLikely: false,
      });
    });
  });

  describe("US — Passive activity loss flag", () => {
    it("should flag PAL scenario for non-real-estate-professional", () => {
      const result = taxAggregation(usPassiveActivityLoss);

      expect(result.deductibleExpenses).toBe(16000);
      expect(result.depreciationAllowed).toBe(5000);
      expect(result.taxableIncome).toBe(-6000);
      expect(result.totalIncome).toBe(114000);
      expect(result.flags).toEqual({
        hasNegativeCashFlow: true,
        depreciationExceedsIncome: true,
        realEstateProfessional: false,
        passiveActivityLossLikely: true,
      });
    });

    it("should not flag PAL when the investor is a real estate professional", () => {
      const result = taxAggregation({
        ...usPassiveActivityLoss,
        realEstateProfessional: true,
      });

      expect(result.taxableIncome).toBe(-6000);
      expect(result.flags.realEstateProfessional).toBe(true);
      expect(result.flags.passiveActivityLossLikely).toBe(false);
    });
  });

  describe("US — Multi-property aggregation", () => {
    it("should sum income and expenses across all properties", () => {
      const result = taxAggregation(usMultiPropertyNoLoss);

      expect(result.aggregateRentalIncome).toBe(45000);
      expect(result.aggregateRentalExpenses).toBe(12000);
      expect(result.aggregateMortgageInterest).toBe(17000);
      expect(result.aggregateDepreciation).toBe(8000);
      expect(result.deductibleExpenses).toBe(29000);
      expect(result.depreciationAllowed).toBe(8000);
      expect(result.taxableIncome).toBe(8000);
      expect(result.totalIncome).toBe(158000);
      expect(result.flags).toEqual({
        hasNegativeCashFlow: false,
        depreciationExceedsIncome: false,
        realEstateProfessional: false,
        passiveActivityLossLikely: false,
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle zero depreciation input", () => {
      const result = taxAggregation({
        properties: [
          {
            address: "1 No Depreciation Way",
            rentalIncome: 10000,
            rentalExpenses: 2000,
            mortgageInterestPaid: 3000,
            mortgagePrincipal: 1000,
            depreciation: 0,
          },
        ],
        jurisdiction: "CA",
        province: "AB",
        filingStatus: "single",
        otherIncome: 50000,
        year: 2026,
      });

      expect(result.aggregateDepreciation).toBe(0);
      expect(result.depreciationAllowed).toBe(0);
      expect(result.taxableIncome).toBe(5000);
      expect(result.flags.depreciationExceedsIncome).toBe(false);
    });

    it("should handle a single property", () => {
      const result = taxAggregation(canadaPositiveIncome);
      expect(canadaPositiveIncome.properties).toHaveLength(1);
      expect(result.aggregateRentalIncome).toBe(
        canadaPositiveIncome.properties[0].rentalIncome
      );
    });

    it("should pool a loss on one Canadian property against a gain on another", () => {
      const result = taxAggregation({
        properties: [
          {
            address: "Losing Property",
            rentalIncome: 5000,
            rentalExpenses: 4000,
            mortgageInterestPaid: 6000,
            mortgagePrincipal: 2000,
            depreciation: 1000,
          },
          {
            address: "Winning Property",
            rentalIncome: 20000,
            rentalExpenses: 3000,
            mortgageInterestPaid: 2000,
            mortgagePrincipal: 1000,
            depreciation: 4000,
          },
        ],
        jurisdiction: "CA",
        province: "QC",
        filingStatus: "single",
        otherIncome: 40000,
        year: 2026,
      });

      // Pooled: income 25000, deductible 15000, preliminary net 10000 (positive)
      expect(result.rentalIncomePool).toBe(25000);
      expect(result.deductibleExpenses).toBe(15000);
      expect(result.depreciationAllowed).toBe(5000);
      expect(result.taxableIncome).toBe(5000);
      expect(result.flags.hasNegativeCashFlow).toBe(false);
    });

    it("should add capital gains into total income without affecting taxable rental income", () => {
      const result = taxAggregation({
        properties: [
          {
            address: "Sold Property",
            rentalIncome: 10000,
            rentalExpenses: 2000,
            mortgageInterestPaid: 3000,
            mortgagePrincipal: 1000,
            depreciation: 1000,
            capGains: 50000,
          },
        ],
        jurisdiction: "US",
        state: "TX",
        filingStatus: "single",
        otherIncome: 70000,
        year: 2026,
      });

      expect(result.taxableIncome).toBe(4000);
      expect(result.capitalGains).toBe(50000);
      expect(result.totalIncome).toBe(124000);
    });

    it("should echo inputs and produce an ISO 8601 timestamp", () => {
      const result = taxAggregation(canadaPositiveIncome);

      expect(result.inputs).toEqual(canadaPositiveIncome);
      expect(() => new Date(result.calculatedAt).toISOString()).not.toThrow();
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
