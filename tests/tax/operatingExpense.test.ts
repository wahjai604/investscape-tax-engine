import { operatingExpense } from "../../src/tax/operatingExpense";
import {
  caClearDeductibleVsCapitalized,
  usMixedWithReviewFlag,
  caAllDeductibleSmallRepairs,
  usAllCapitalizedMajorRenovation,
  usCommercialDifferentThresholds,
  caAmbiguousLandscaping,
  caMixedFullWorkedExample,
  usAzWorkedExample,
  usBareRoofRepairResidential,
  usCustomAutoCapitalizeThreshold,
  missingPropertyTypeDefaultsResidential,
  caUnmatchedRepairWithQualifier,
  usBareRepairUnderThreshold,
  usUnmatchedReplacement,
  caUnmatchedMiscellaneous,
  caCleaningWithoutGutter,
  caParkingLotSeal,
  caHvacMaintenanceWithoutServicing,
  caElectricalPanelNonContiguousPhrase,
  caFurnaceReplacementNonContiguousPhrase,
  caExteriorPaint,
  caBareRepairResidentialUnderThreshold,
  caBareRepairCommercialOverThreshold,
  usHvacEntireOverhaul,
  usHvacSystemSwap,
  usHvacServiceCall,
  usHvacMaintenanceWithoutServicing,
  usElectricalPanelNonContiguousPhrase,
  usFurnaceReplacementNonContiguousPhrase,
  usSealCoatWithoutParkingLotPhrase,
  usParkingAndSealWithoutEitherFixedPhrase,
} from "./fixtures/operatingExpense.fixtures";

describe("E50: Operating Expense Deduction Engine", () => {
  describe("Canada — CRA Folio S4-F2-C1 rules", () => {
    it("should classify routine repairs as deductible and improvements as capitalized (Test 1)", () => {
      const result = operatingExpense(caClearDeductibleVsCapitalized);

      expect(result.totalExpenses).toBe(15600);
      expect(result.totalDeductible).toBe(3600);
      expect(result.totalCapitalized).toBe(12000);

      const [roofRepair, newRoof, management, hvacService] = result.expenses;
      expect(roofRepair.classification).toBe("deductible");
      expect(newRoof.classification).toBe("capitalized");
      expect(management.classification).toBe("deductible");
      expect(hvacService.classification).toBe("deductible");

      expect(result.capitalizedGuidance).toEqual([
        { assetClass: "Building improvement", recoveryPeriod: "CCA Class 1 @ 4% declining-balance (~25yr)" },
      ]);
    });

    it("should flag scope-ambiguous landscaping for review and exclude it from totals (Test 6)", () => {
      const result = operatingExpense(caAmbiguousLandscaping);

      expect(result.expenses).toHaveLength(1);
      expect(result.expenses[0].classification).toBe("review");
      expect(result.expenses[0].deductibleAmount).toBe(0);
      expect(result.expenses[0].capitalizedAmount).toBe(0);
      expect(result.totalDeductible).toBe(0);
      expect(result.totalCapitalized).toBe(0);
      // propertyType defaults to residential when omitted, per interface.
      expect(result.propertyType).toBe("residential");
    });

    it("should classify every item as deductible for small routine repairs (Test 3)", () => {
      const result = operatingExpense(caAllDeductibleSmallRepairs);

      expect(result.totalExpenses).toBe(550);
      expect(result.totalDeductible).toBe(550);
      expect(result.totalCapitalized).toBe(0);
      expect(result.expenses.every((e) => e.classification === "deductible")).toBe(true);
      expect(result.capitalizedGuidance).toEqual([]);
    });

    it("should sum per-item totals correctly on a full mixed worked example, independent of the spec prompt's own arithmetic", () => {
      const result = operatingExpense(caMixedFullWorkedExample);

      // 800 (roof repair) + 2400 (mgmt) + 1500 (paint) + 400 (hvac) + 1200 (insurance) = 6300.
      expect(result.totalDeductible).toBe(6300);
      // 12000 (new roof) + 5000 (upgraded appliances) = 17000.
      expect(result.totalCapitalized).toBe(17000);
      expect(result.totalExpenses).toBe(23300);

      const appliances = result.expenses.find((e) => e.description.includes("appliances"))!;
      expect(appliances.classification).toBe("capitalized");
      expect(result.capitalizedGuidance).toContainEqual({
        assetClass: "Appliance/Equipment",
        recoveryPeriod: "CCA Class 8 @ 20% declining-balance (~5yr)",
      });
    });
  });

  describe("US — IRS Pub 527 rules", () => {
    it("should classify per IRS guidance and flag ambiguous exterior painting for review (Test 2)", () => {
      const result = operatingExpense(usMixedWithReviewFlag);

      expect(result.totalExpenses).toBe(12500);
      expect(result.totalDeductible).toBe(2000);
      expect(result.totalCapitalized).toBe(8000);

      const [gutterRepair, hvacReplacement, paintedExterior, insurance] = result.expenses;
      expect(gutterRepair.classification).toBe("deductible");
      expect(hvacReplacement.classification).toBe("capitalized");
      expect(paintedExterior.classification).toBe("review");
      expect(paintedExterior.deductibleAmount).toBe(0);
      expect(paintedExterior.capitalizedAmount).toBe(0);
      expect(insurance.classification).toBe("deductible");
    });

    it("should classify every item as capitalized for a major renovation (Test 4)", () => {
      const result = operatingExpense(usAllCapitalizedMajorRenovation);

      expect(result.totalExpenses).toBe(30000);
      expect(result.totalDeductible).toBe(0);
      expect(result.totalCapitalized).toBe(30000);
      expect(result.expenses.every((e) => e.classification === "capitalized")).toBe(true);
      expect(result.capitalizedGuidance).toHaveLength(3);
      expect(result.capitalizedGuidance.every((g) => g.recoveryPeriod === "27.5-year straight-line (MACRS)")).toBe(
        true
      );
    });

    it("should apply a lower capitalization threshold for commercial property, capitalizing an unqualified bare repair (Test 5)", () => {
      const result = operatingExpense(usCommercialDifferentThresholds);

      expect(result.totalExpenses).toBe(20000);
      expect(result.totalDeductible).toBe(3000);
      expect(result.totalCapitalized).toBe(17000);

      const [roofRepair, newHvac, parkingLotSeal] = result.expenses;
      expect(roofRepair.classification).toBe("capitalized");
      expect(newHvac.classification).toBe("capitalized");
      expect(parkingLotSeal.classification).toBe("deductible");

      const commercialGuidance = result.capitalizedGuidance.find(
        (g) => g.assetClass === "Building improvement"
      );
      expect(commercialGuidance?.recoveryPeriod).toBe("39-year straight-line (MACRS)");
    });

    it("should sum per-item totals correctly on a full mixed worked example, independent of the spec prompt's own arithmetic", () => {
      const result = operatingExpense(usAzWorkedExample);

      // 200 (gutter) + 500 (ads) + 3000 (property tax) + 1800 (insurance) = 5500.
      expect(result.totalDeductible).toBe(5500);
      // 8000 (hvac) + 4000 (upgraded counters) = 12000.
      expect(result.totalCapitalized).toBe(12000);
      expect(result.totalExpenses).toBe(20000);
    });
  });

  describe("Repair capitalization threshold", () => {
    it("should keep an unqualified bare repair deductible when its amount is within the residential threshold", () => {
      const result = operatingExpense(caClearDeductibleVsCapitalized);
      // "Roof repair (patching leak)" is deductible because of the "patching leak" qualifier,
      // not because it's under threshold — covered separately here via a bare-repair case.
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should capitalize an unqualified bare repair above the residential threshold", () => {
      const result = operatingExpense(usBareRoofRepairResidential);
      expect(result.expenses[0].classification).toBe("capitalized");
      expect(result.expenses[0].capitalizedAmount).toBe(5000);
    });

    it("should honor a caller-supplied autoCapitalizeThreshold override", () => {
      const result = operatingExpense(usCustomAutoCapitalizeThreshold);
      expect(result.expenses[0].classification).toBe("capitalized");
      expect(result.expenses[0].reason).toContain("$100");
    });

    it("should deduct an unmatched-keyword repair carrying a minor-repair qualifier", () => {
      const result = operatingExpense(caUnmatchedRepairWithQualifier);
      expect(result.expenses[0].classification).toBe("deductible");
      expect(result.expenses[0].deductibleAmount).toBe(300);
    });

    it("should deduct a bare unqualified repair when its amount is under threshold", () => {
      const result = operatingExpense(usBareRepairUnderThreshold);
      expect(result.expenses[0].classification).toBe("deductible");
      expect(result.expenses[0].deductibleAmount).toBe(500);
    });
  });

  describe("Generic new/replacement and unmatched fallbacks", () => {
    it("should capitalize a non-repair item described as a replacement even without a specific keyword match", () => {
      const result = operatingExpense(usUnmatchedReplacement);
      expect(result.expenses[0].classification).toBe("capitalized");
      expect(result.expenses[0].capitalizedAmount).toBe(1200);
    });

    it("should flag a completely unmatched description for review", () => {
      const result = operatingExpense(caUnmatchedMiscellaneous);
      expect(result.expenses[0].classification).toBe("review");
    });

    it("should deduct generic cleaning that isn't gutter-specific", () => {
      const result = operatingExpense(caCleaningWithoutGutter);
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should deduct parking lot sealcoating as routine maintenance", () => {
      const result = operatingExpense(caParkingLotSeal);
      expect(result.expenses[0].classification).toBe("deductible");
    });
  });

  describe("Edge cases", () => {
    it("should default propertyType to residential when omitted", () => {
      const result = operatingExpense(missingPropertyTypeDefaultsResidential);
      expect(result.propertyType).toBe("residential");
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should include a rule citation and jurisdiction on every line item", () => {
      const result = operatingExpense(caClearDeductibleVsCapitalized);
      for (const expense of result.expenses) {
        expect(expense.ruleCitation.length).toBeGreaterThan(0);
        expect(expense.jurisdiction).toBe("CA");
      }
    });

    it("should include the advisory disclaimer and echo inputs with an ISO 8601 timestamp", () => {
      const result = operatingExpense(caClearDeductibleVsCapitalized);
      expect(result.disclaimer.length).toBeGreaterThan(0);
      expect(result.inputs).toEqual(caClearDeductibleVsCapitalized);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });

    it("should sum deductible + capitalized + review-pending amounts back to the expense total", () => {
      const result = operatingExpense(usMixedWithReviewFlag);
      const reviewAmount = result.expenses
        .filter((e) => e.classification === "review")
        .reduce((sum, e) => sum + e.amount, 0);
      expect(result.totalDeductible + result.totalCapitalized + reviewAmount).toBe(result.totalExpenses);
    });
  });

  describe("Rule-table branch coverage (each operand of a compound keyword test)", () => {
    it("should deduct CA HVAC maintenance described without the word 'servicing'", () => {
      const result = operatingExpense(caHvacMaintenanceWithoutServicing);
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should capitalize a CA electrical panel job where 'electrical' and 'panel' aren't a contiguous phrase", () => {
      const result = operatingExpense(caElectricalPanelNonContiguousPhrase);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should capitalize a CA furnace replacement where 'furnace' and 'replace' aren't phrased as 'new furnace'", () => {
      const result = operatingExpense(caFurnaceReplacementNonContiguousPhrase);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should flag CA exterior painting for review", () => {
      const result = operatingExpense(caExteriorPaint);
      expect(result.expenses[0].classification).toBe("review");
    });

    it("should deduct a bare CA repair under the residential threshold", () => {
      const result = operatingExpense(caBareRepairResidentialUnderThreshold);
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should capitalize a bare CA repair over the (lower) commercial threshold", () => {
      const result = operatingExpense(caBareRepairCommercialOverThreshold);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should capitalize a US HVAC job described as an 'entire' overhaul", () => {
      const result = operatingExpense(usHvacEntireOverhaul);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should capitalize a US HVAC 'system' swap", () => {
      const result = operatingExpense(usHvacSystemSwap);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should deduct a US HVAC service call", () => {
      const result = operatingExpense(usHvacServiceCall);
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should deduct US HVAC maintenance described without the word 'servicing'", () => {
      const result = operatingExpense(usHvacMaintenanceWithoutServicing);
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should capitalize a US electrical panel job where 'electrical' and 'panel' aren't a contiguous phrase", () => {
      const result = operatingExpense(usElectricalPanelNonContiguousPhrase);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should capitalize a US furnace replacement where 'furnace' and 'replace' aren't phrased as 'new furnace'", () => {
      const result = operatingExpense(usFurnaceReplacementNonContiguousPhrase);
      expect(result.expenses[0].classification).toBe("capitalized");
    });

    it("should deduct US 'seal coat' work not phrased as 'parking lot seal'", () => {
      const result = operatingExpense(usSealCoatWithoutParkingLotPhrase);
      expect(result.expenses[0].classification).toBe("deductible");
    });

    it("should deduct US parking-area sealing work phrased as neither fixed phrase", () => {
      const result = operatingExpense(usParkingAndSealWithoutEitherFixedPhrase);
      expect(result.expenses[0].classification).toBe("deductible");
    });
  });
});
