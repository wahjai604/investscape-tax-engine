import { calculateCrossBorderWithholding } from "../../src/E83-cross-border-withholding";
import {
  firptaStandardRate,
  firptaResidenceExemptionAtThreshold,
  firptaJustAboveResidenceExemption,
  firptaAtReducedRateUpperBound,
  firptaJustAboveReducedRateBand,
  firptaWithCertificate,
  firptaCertificateMissingEstimate,
  section116DefaultGross,
  section116WithClearanceCertificate,
  partXIIIDefaultGross,
  section216ElectionNetIncome,
  fdapDefaultGross,
  section871dElectionNetIncome,
  fdapElectionMissingMarginalRate,
  sameCountryUS,
  sameCountryCanada,
} from "./fixtures/crossBorderWithholding.fixtures";

describe("E83: Cross-Border Withholding (Canada <-> US)", () => {
  describe("FIRPTA — Canadian investor, US property, sale_proceeds", () => {
    it("applies the standard 15% rate to gross proceeds when the buyer has no residence intent", () => {
      const result = calculateCrossBorderWithholding(firptaStandardRate);
      expect(result.regime).toBe("FIRPTA");
      expect(result.withholdingRate).toBe(0.15);
      expect(result.withholdingBasisAmount).toBe(500000);
      expect(result.withholdingAmount).toBe(75000); // 500000 * 0.15
      expect(result.usedElectionOrCertificate).toBe(false);
    });

    it("exempts withholding entirely at the $300,000 residence threshold (inclusive)", () => {
      const result = calculateCrossBorderWithholding(firptaResidenceExemptionAtThreshold);
      expect(result.withholdingRate).toBe(0);
      expect(result.withholdingAmount).toBe(0);
    });

    it("jumps to the 10% reduced rate one dollar above the exemption threshold", () => {
      const result = calculateCrossBorderWithholding(firptaJustAboveResidenceExemption);
      expect(result.withholdingRate).toBe(0.1);
      expect(result.withholdingAmount).toBe(30000.1); // 300001 * 0.10
    });

    it("still applies the 10% reduced rate at the $1,000,000 upper bound (inclusive)", () => {
      const result = calculateCrossBorderWithholding(firptaAtReducedRateUpperBound);
      expect(result.withholdingRate).toBe(0.1);
      expect(result.withholdingAmount).toBe(100000); // 1000000 * 0.10
    });

    it("reverts to the standard 15% rate one dollar above the reduced-rate band", () => {
      const result = calculateCrossBorderWithholding(firptaJustAboveReducedRateBand);
      expect(result.withholdingRate).toBe(0.15);
      expect(result.withholdingAmount).toBe(150000.15); // 1000001 * 0.15
    });

    it("applies the statutory rate to the estimated gain, not gross proceeds, when a Form 8288-B certificate is used", () => {
      const withCertificate = calculateCrossBorderWithholding(firptaWithCertificate);
      const withoutCertificate = calculateCrossBorderWithholding(firptaStandardRate);
      expect(withCertificate.usedElectionOrCertificate).toBe(true);
      expect(withCertificate.withholdingBasisAmount).toBe(50000);
      expect(withCertificate.withholdingAmount).toBe(7500); // 50000 * 0.15
      expect(withCertificate.withholdingAmount).toBeLessThan(withoutCertificate.withholdingAmount);
    });

    it("falls back to the gross default and flags an issue when the certificate flag is set without an estimated gain", () => {
      const result = calculateCrossBorderWithholding(firptaCertificateMissingEstimate);
      expect(result.usedElectionOrCertificate).toBe(false);
      expect(result.withholdingAmount).toBe(75000); // gross default, same as firptaStandardRate
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining("falling back to the gross-proceeds default")])
      );
    });
  });

  describe("Section 116 — US investor, Canadian property, sale_proceeds", () => {
    it("applies 25% to gross proceeds absent a clearance certificate", () => {
      const result = calculateCrossBorderWithholding(section116DefaultGross);
      expect(result.regime).toBe("SECTION_116");
      expect(result.withholdingRate).toBe(0.25);
      expect(result.withholdingAmount).toBe(100000); // 400000 * 0.25
      expect(result.usedElectionOrCertificate).toBe(false);
    });

    it("applies 25% to the estimated gain, not gross proceeds, when a clearance certificate is used", () => {
      const withCertificate = calculateCrossBorderWithholding(section116WithClearanceCertificate);
      const withoutCertificate = calculateCrossBorderWithholding(section116DefaultGross);
      expect(withCertificate.usedElectionOrCertificate).toBe(true);
      expect(withCertificate.withholdingBasisAmount).toBe(60000);
      expect(withCertificate.withholdingAmount).toBe(15000); // 60000 * 0.25
      expect(withCertificate.withholdingAmount).toBeLessThan(withoutCertificate.withholdingAmount);
    });
  });

  describe("Part XIII / Section 216 — US investor, Canadian property, rental_income", () => {
    it("applies 25% to gross rent absent a Section 216 election", () => {
      const result = calculateCrossBorderWithholding(partXIIIDefaultGross);
      expect(result.regime).toBe("PART_XIII_SECTION_216");
      expect(result.withholdingRate).toBe(0.25);
      expect(result.withholdingAmount).toBe(6000); // 24000 * 0.25
      expect(result.usedElectionOrCertificate).toBe(false);
    });

    it("applies the investor's marginal rate to net rental income when a Section 216 election is used", () => {
      const withElection = calculateCrossBorderWithholding(section216ElectionNetIncome);
      const withoutElection = calculateCrossBorderWithholding(partXIIIDefaultGross);
      expect(withElection.usedElectionOrCertificate).toBe(true);
      expect(withElection.withholdingRate).toBe(0.3);
      expect(withElection.withholdingBasisAmount).toBe(10000);
      expect(withElection.withholdingAmount).toBe(3000); // 10000 * 0.30
      expect(withElection.withholdingAmount).toBeLessThan(withoutElection.withholdingAmount);
    });
  });

  describe("§871(d) / FDAP — Canadian investor, US property, rental_income", () => {
    it("applies the flat 30% FDAP rate to gross rent absent a §871(d) election", () => {
      const result = calculateCrossBorderWithholding(fdapDefaultGross);
      expect(result.regime).toBe("FDAP_871D");
      expect(result.withholdingRate).toBe(0.3);
      expect(result.withholdingAmount).toBe(9000); // 30000 * 0.30
      expect(result.usedElectionOrCertificate).toBe(false);
    });

    it("applies the investor's marginal rate to net rental income when a §871(d) election is used", () => {
      const withElection = calculateCrossBorderWithholding(section871dElectionNetIncome);
      const withoutElection = calculateCrossBorderWithholding(fdapDefaultGross);
      expect(withElection.usedElectionOrCertificate).toBe(true);
      expect(withElection.withholdingRate).toBe(0.22);
      expect(withElection.withholdingBasisAmount).toBe(12000);
      expect(withElection.withholdingAmount).toBe(2640); // 12000 * 0.22
      expect(withElection.withholdingAmount).toBeLessThan(withoutElection.withholdingAmount);
    });

    it("falls back to the gross statutory default and flags an issue when investorMarginalTaxRate is missing", () => {
      const result = calculateCrossBorderWithholding(fdapElectionMissingMarginalRate);
      expect(result.usedElectionOrCertificate).toBe(false);
      expect(result.withholdingRate).toBe(0.3);
      expect(result.withholdingAmount).toBe(9000); // gross default, same as fdapDefaultGross
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining("falling back to the gross-rent statutory default")])
      );
    });
  });

  describe("Same-country inputs — not cross-border", () => {
    it("returns a zero-rate result with an explanatory issue instead of throwing (US/US)", () => {
      const result = calculateCrossBorderWithholding(sameCountryUS);
      expect(result.regime).toBe("NOT_APPLICABLE");
      expect(result.withholdingRate).toBe(0);
      expect(result.withholdingAmount).toBe(0);
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining("domestic, not cross-border")])
      );
    });

    it("returns a zero-rate result with an explanatory issue instead of throwing (Canada/Canada)", () => {
      const result = calculateCrossBorderWithholding(sameCountryCanada);
      expect(result.regime).toBe("NOT_APPLICABLE");
      expect(result.withholdingRate).toBe(0);
      expect(result.withholdingAmount).toBe(0);
    });

    it("does not claim foreign tax credit eligibility for a domestic transaction", () => {
      const result = calculateCrossBorderWithholding(sameCountryUS);
      expect(result.foreignTaxCreditEligible).toBe(false);
      expect(result.fullyOffsetsDoubleTaxation).toBe(false);
    });
  });

  describe("Foreign tax credit modeling — honest, not fabricated", () => {
    it("marks all four cross-border regimes as FTC-eligible in principle but never claims full double-tax offset", () => {
      for (const result of [
        calculateCrossBorderWithholding(firptaStandardRate),
        calculateCrossBorderWithholding(section116DefaultGross),
        calculateCrossBorderWithholding(partXIIIDefaultGross),
        calculateCrossBorderWithholding(fdapDefaultGross),
      ]) {
        expect(result.foreignTaxCreditEligible).toBe(true);
        expect(result.fullyOffsetsDoubleTaxation).toBe(false);
        expect(result.issues).toEqual(
          expect.arrayContaining([expect.stringContaining("fullyOffsetsDoubleTaxation is not fully modeled")])
        );
      }
    });
  });

  describe("Metadata", () => {
    it("includes the advisory disclaimer and echoes inputs", () => {
      const result = calculateCrossBorderWithholding(firptaStandardRate);
      expect(result.disclaimer.length).toBeGreaterThan(0);
      expect(result.inputs).toEqual(firptaStandardRate);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
