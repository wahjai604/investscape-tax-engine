import { gstHstDevCharges } from "../../src/tax/gstHstDevCharges";
import {
  onTorontoRegisteredResidential,
  bcVancouverUnregisteredResidential,
  qcMontrealRegisteredCommercial,
  nsHalifaxRegisteredResidential,
  onZeroConstructionCostLandOnly,
  abSmallUnregisteredProject,
  onTorontoDefaultDevChargeLookup,
  onTorontoCommercialDefaultDevChargeLookup,
  bcNoMunicipalityDefaultLookup,
  bcUnknownMunicipalityFallsBackToProvince,
  skMissingOverrideThrows,
  skMissingOverrideWithMunicipalityThrows,
} from "./fixtures/gstHstDevCharges.fixtures";

describe("E52: GST/HST & Development Charges Engine", () => {
  describe("GST/HST calculation", () => {
    it("should apply ON HST 13% and fully recover it via ITCs when registered (Test 1)", () => {
      const result = gstHstDevCharges(onTorontoRegisteredResidential);

      expect(result.gstHstRate).toBe(0.13);
      expect(result.gstHstChargedOnCosts).toBe(156000);
      expect(result.inputTaxCreditsRecoverable).toBe(156000);
      expect(result.netGstHstOwing).toBe(0);
      expect(result.totalDevCharges).toBe(108000);
      expect(result.combinedCost).toBe(108000);
    });

    it("should deny ITCs and leave the full GST as a cost when unregistered (Test 2)", () => {
      const result = gstHstDevCharges(bcVancouverUnregisteredResidential);

      expect(result.gstHstRate).toBe(0.05);
      expect(result.gstHstChargedOnCosts).toBe(125000);
      expect(result.inputTaxCreditsRecoverable).toBe(0);
      expect(result.netGstHstOwing).toBe(125000);
      expect(result.totalDevCharges).toBe(500000);
      expect(result.combinedCost).toBe(625000);
    });

    it("should apply Quebec's combined GST+QST rate of 14.975% (Test 3)", () => {
      const result = gstHstDevCharges(qcMontrealRegisteredCommercial);

      expect(result.gstHstRate).toBe(0.14975);
      expect(result.gstHstChargedOnCosts).toBe(269550);
      expect(result.inputTaxCreditsRecoverable).toBe(269550);
      expect(result.netGstHstOwing).toBe(0);
      expect(result.totalDevCharges).toBe(35000);
      expect(result.combinedCost).toBe(35000);
    });

    it("should apply the 15% Atlantic HST rate (Test 4)", () => {
      const result = gstHstDevCharges(nsHalifaxRegisteredResidential);

      expect(result.gstHstRate).toBe(0.15);
      expect(result.gstHstChargedOnCosts).toBe(120000);
      expect(result.inputTaxCreditsRecoverable).toBe(120000);
      expect(result.netGstHstOwing).toBe(0);
      expect(result.totalDevCharges).toBe(25000);
      expect(result.combinedCost).toBe(25000);
    });
  });

  describe("Development charges", () => {
    it("should apply different residential vs. commercial defaults for the same city", () => {
      const residential = gstHstDevCharges(onTorontoDefaultDevChargeLookup);
      const commercial = gstHstDevCharges(onTorontoCommercialDefaultDevChargeLookup);

      expect(residential.devChargeRatePerUnit).toBe(13750);
      expect(commercial.devChargeRatePerUnit).toBe(8750);
      expect(residential.devChargeRatePerUnit).toBeGreaterThan(commercial.devChargeRatePerUnit);
    });

    it("should fall back to the province default when no municipality is given", () => {
      const result = gstHstDevCharges(bcNoMunicipalityDefaultLookup);
      expect(result.devChargeRatePerUnit).toBe(10000);
      expect(result.totalDevCharges).toBe(20000);
    });

    it("should fall back to the province default when the municipality isn't in the lookup table", () => {
      const result = gstHstDevCharges(bcUnknownMunicipalityFallsBackToProvince);
      expect(result.devChargeRatePerUnit).toBe(5500);
      expect(result.totalDevCharges).toBe(11000);
    });

    it("should throw when no override is given for a province with no verified default (SK)", () => {
      expect(() => gstHstDevCharges(skMissingOverrideThrows)).toThrow(
        /No verified development charge default for province 'SK'/
      );
    });

    it("should include the municipality in the error message when one was supplied", () => {
      expect(() => gstHstDevCharges(skMissingOverrideWithMunicipalityThrows)).toThrow(
        /No verified development charge default for province 'SK' \/ municipality 'Regina'/
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle zero construction costs (land-only purchase) (Test 5)", () => {
      const result = gstHstDevCharges(onZeroConstructionCostLandOnly);

      expect(result.gstHstChargedOnCosts).toBe(0);
      expect(result.netGstHstOwing).toBe(0);
      expect(result.totalDevCharges).toBe(30000);
      expect(result.combinedCost).toBe(30000);
    });

    it("should handle a small unregistered project (Test 6)", () => {
      const result = gstHstDevCharges(abSmallUnregisteredProject);

      expect(result.gstHstRate).toBe(0.05);
      expect(result.gstHstChargedOnCosts).toBe(20000);
      expect(result.inputTaxCreditsRecoverable).toBe(0);
      expect(result.netGstHstOwing).toBe(20000);
      expect(result.totalDevCharges).toBe(12000);
      expect(result.combinedCost).toBe(32000);
    });

    it("should mirror netGstHstOwing/totalDevCharges into totalGstHstCost/totalDevChargesCost for E51", () => {
      const result = gstHstDevCharges(bcVancouverUnregisteredResidential);
      expect(result.totalGstHstCost).toBe(result.netGstHstOwing);
      expect(result.totalDevChargesCost).toBe(result.totalDevCharges);
    });

    it("should include province, municipality/registration context in the explanation strings", () => {
      const result = gstHstDevCharges(onTorontoRegisteredResidential);
      expect(result.gstHstExplanation).toContain("ON");
      expect(result.gstHstExplanation).toContain("registered");
      expect(result.devChargeExplanation).toContain("Toronto");
      expect(result.devChargeExplanation).toContain("8");
    });

    it("should echo inputs, jurisdiction, province, and produce an ISO 8601 timestamp with the current year", () => {
      const result = gstHstDevCharges(onTorontoRegisteredResidential);

      expect(result.inputs).toEqual(onTorontoRegisteredResidential);
      expect(result.jurisdiction).toBe("CA");
      expect(result.province).toBe("ON");
      expect(result.gstHstRegistered).toBe(true);
      expect(result.year).toBe(new Date().getFullYear());
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
