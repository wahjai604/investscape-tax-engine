import { opportunityZones } from "../../src/E70-opportunity-zones";
import {
  legacyInvestmentFromPriorYear,
  legacyInvestmentDatedLater,
  permanentRegimeStandard,
  permanentRegimeRuralMeetsThreshold,
  ruralQOZBelowThreshold,
  standardQOZBelowThreshold,
} from "./fixtures/opportunityZones.fixtures";

describe("E70: Opportunity Zones", () => {
  describe("Regime is explicit, never inferred from today's date", () => {
    it("should keep the fixed 2026-12-31 legacy deadline for a 2025-dated investment, regardless of when the engine runs", () => {
      const result = opportunityZones(legacyInvestmentFromPriorYear);
      expect(result.deferralRecognitionDate).toBe("2026-12-31");
    });

    it("should apply the same fixed legacy deadline regardless of the investment date within the legacy regime", () => {
      const earlier = opportunityZones(legacyInvestmentFromPriorYear);
      const later = opportunityZones(legacyInvestmentDatedLater);
      expect(earlier.deferralRecognitionDate).toBe("2026-12-31");
      expect(later.deferralRecognitionDate).toBe("2026-12-31");
    });

    it("should compute a rolling 5-year deferral from the investment date under the permanent regime, not a fixed calendar deadline", () => {
      const result = opportunityZones(permanentRegimeStandard);
      expect(result.deferralRecognitionDate).toBe("2032-03-10");
      expect(result.deferralRecognitionDate).not.toBe("2026-12-31");
    });
  });

  describe("Basis step-up", () => {
    it("should apply the standard 10% step-up for a non-rural QOZ", () => {
      const result = opportunityZones(permanentRegimeStandard);
      expect(result.basisStepUpPercent).toBe(0.1);
      expect(result.applicableImprovementThreshold).toBe(1.0);
    });

    it("should apply the 30% rural step-up when the rural substantial-improvement threshold is met", () => {
      const result = opportunityZones(permanentRegimeRuralMeetsThreshold);
      expect(result.basisStepUpPercent).toBe(0.3);
      expect(result.applicableImprovementThreshold).toBe(0.5);
      expect(result.meetsSubstantialImprovementThreshold).toBe(true);
      expect(result.issues).toEqual([]);
    });
  });

  describe("Substantial improvement threshold — typed issue, not a silent pass", () => {
    it("should flag a rural QOZ claiming the 30% step-up without meeting the reduced 50% threshold", () => {
      const result = opportunityZones(ruralQOZBelowThreshold);
      expect(result.basisStepUpPercent).toBe(0.3);
      expect(result.meetsSubstantialImprovementThreshold).toBe(false);
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining("not yet substantiated")])
      );
    });

    it("should flag a standard QOZ that hasn't met the full 100% improvement threshold", () => {
      const result = opportunityZones(standardQOZBelowThreshold);
      expect(result.meetsSubstantialImprovementThreshold).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Metadata", () => {
    it("should include the advisory disclaimer, jurisdiction, and echo inputs", () => {
      const result = opportunityZones(permanentRegimeStandard);
      expect(result.jurisdiction).toBe("US");
      expect(result.disclaimer.length).toBeGreaterThan(0);
      expect(result.inputs).toEqual(permanentRegimeStandard);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
