import { depreciation } from "../../src/tax/depreciation";
import {
  canadaYear1Acquisition,
  canadaYear3WithSale,
  canadaYear3SoldAtLoss,
  usYear1Acquisition,
  usYear3WithSale,
  usCommercialYear1,
  canadaLandOnly,
} from "./fixtures/depreciation.fixtures";

describe("E48: Depreciation & Recapture Engine", () => {
  describe("Canada — CCA declining-balance", () => {
    it("should apply the 50% half-year rule in acquisition year", () => {
      const result = depreciation(canadaYear1Acquisition);

      expect(result.annualDepreciationAllowance).toBe(10000);
      expect(result.ccaPoolInfo).toEqual({
        openingUCC: 0,
        additionsAtHalfYear: 250000,
        ccaClaimable: 10000,
        closingUCC: 240000,
        halfYearRuleApplied: true,
      });
      expect(result.recaptureInfo).toBeNull();
      expect(result.depreciationMethod).toBe("CCA");
    });

    it("should track the UCC pool on a declining-balance basis (not straight-line) and calculate recapture on sale", () => {
      const result = depreciation(canadaYear3WithSale);

      expect(result.annualDepreciationAllowance).toBe(9216);
      expect(result.ccaPoolInfo).toEqual({
        openingUCC: 230400,
        additionsAtHalfYear: 0,
        ccaClaimable: 9216,
        closingUCC: 221184,
        halfYearRuleApplied: false,
      });

      expect(result.recaptureInfo).not.toBeNull();
      expect(result.recaptureInfo).toMatchObject({
        salePrice: 620000,
        adjustedBasis: 500000,
        gainOnSale: 120000,
        cumulativeCCAClaimedOrMACRS: 28816,
        recapture: 28816,
        recaptureType: "ordinary_income",
        capitalGainAfterRecapture: 91184,
        recaptureTaxRate: 1,
      });
      // Spec's worked example states recaptureTaxOwing: 12597 at "43.7%
      // marginal", but 28816 * 0.437 = 12592.592, which rounds to 12592.59,
      // not 12597 — a ~$4.41 arithmetic slip in the spec's hand math.
      // Asserting the mathematically correct value for the stated inputs.
      expect(result.recaptureInfo!.recaptureTaxOwing).toBe(12592.59);
    });

    it("should not produce negative recapture on a sale at a loss", () => {
      const result = depreciation(canadaYear3SoldAtLoss);

      expect(result.recaptureInfo).toMatchObject({
        gainOnSale: -100000,
        recapture: 0,
        capitalGainAfterRecapture: -100000,
        recaptureTaxOwing: 0,
      });
    });

    it("should throw for a post-acquisition year missing priorYearClosingUCC", () => {
      expect(() =>
        depreciation({
          ...canadaYear1Acquisition,
          currentYear: 2026,
          priorYearClosingUCC: undefined,
        })
      ).toThrow(/priorYearClosingUCC is required/);
    });

    it("should throw for a CA sale missing investorMarginalTaxRate", () => {
      const { investorMarginalTaxRate, ...withoutRate } = canadaYear3WithSale;
      expect(() => depreciation(withoutRate)).toThrow(
        /investorMarginalTaxRate is required/
      );
    });
  });

  describe("US — MACRS straight-line", () => {
    it("should apply the half-year convention in acquisition year (residential)", () => {
      const result = depreciation(usYear1Acquisition);

      expect(result.annualDepreciationAllowance).toBe(5454.55);
      expect(result.macrsInfo).toEqual({
        depreciableBase: 300000,
        recoveryPeriod: 27.5,
        annualMACRS: 10909.09,
        cumulativeDepreciation: 5454.55,
      });
      expect(result.recaptureInfo).toBeNull();
      expect(result.depreciationMethod).toBe("MACRS");
    });

    it("should calculate recapture with the federal 25% §1250 cap at sale", () => {
      const result = depreciation(usYear3WithSale);

      expect(result.annualDepreciationAllowance).toBe(10909.09);
      expect(result.macrsInfo!.cumulativeDepreciation).toBe(27272.73);

      expect(result.recaptureInfo).toEqual({
        salePrice: 380000,
        adjustedBasis: 300000,
        gainOnSale: 80000,
        cumulativeCCAClaimedOrMACRS: 27272.73,
        recapture: 27272.73,
        recaptureType: "section_1250_unrecaptured",
        capitalGainAfterRecapture: 52727.27,
        recaptureTaxRate: 0.25,
        recaptureTaxOwing: 6818.18,
      });
    });

    it("should throw for a post-acquisition sale missing priorCumulativeDepreciation", () => {
      const { priorCumulativeDepreciation, ...withoutPrior } = usYear3WithSale;
      expect(() => depreciation(withoutPrior)).toThrow(
        /priorCumulativeDepreciation is required/
      );
    });

    it("should not require priorCumulativeDepreciation for a non-sale projection (this year's deduction is unaffected)", () => {
      const { priorCumulativeDepreciation, salePrice, ...projectionOnly } =
        usYear3WithSale;
      const result = depreciation(projectionOnly);
      expect(result.annualDepreciationAllowance).toBe(10909.09);
      expect(result.macrsInfo!.cumulativeDepreciation).toBe(10909.09);
    });
  });

  describe("Edge cases", () => {
    it("should use the 39-year recovery period for commercial property", () => {
      const result = depreciation(usCommercialYear1);

      expect(result.annualDepreciationAllowance).toBe(12820.51);
      expect(result.macrsInfo).toEqual({
        depreciableBase: 1000000,
        recoveryPeriod: 39,
        annualMACRS: 25641.03,
        cumulativeDepreciation: 12820.51,
      });
    });

    it("should produce zero depreciation for a land-only property", () => {
      const result = depreciation(canadaLandOnly);

      expect(result.annualDepreciationAllowance).toBe(0);
      expect(result.ccaPoolInfo).toMatchObject({
        openingUCC: 0,
        additionsAtHalfYear: 0,
        ccaClaimable: 0,
        closingUCC: 0,
      });
    });

    it("should echo inputs and produce an ISO 8601 timestamp", () => {
      const result = depreciation(canadaYear1Acquisition);

      expect(result.inputs).toEqual(canadaYear1Acquisition);
      expect(result.year).toBe(canadaYear1Acquisition.currentYear);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });

    it("should chain multi-year CA CCA calls via priorYearClosingUCC and match cumulative totals", () => {
      const year1 = depreciation(canadaYear1Acquisition);
      const year2 = depreciation({
        ...canadaYear1Acquisition,
        currentYear: 2025,
        priorYearClosingUCC: year1.ccaPoolInfo!.closingUCC,
      });
      const year3 = depreciation({
        ...canadaYear1Acquisition,
        currentYear: 2026,
        priorYearClosingUCC: year2.ccaPoolInfo!.closingUCC,
      });

      expect(year1.annualDepreciationAllowance).toBe(10000);
      expect(year2.annualDepreciationAllowance).toBe(9600);
      expect(year3.annualDepreciationAllowance).toBe(9216);
      expect(year2.ccaPoolInfo!.openingUCC).toBe(240000);
      expect(year3.ccaPoolInfo!.closingUCC).toBe(221184);
    });
  });
});
