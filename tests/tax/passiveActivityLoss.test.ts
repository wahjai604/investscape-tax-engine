import { passiveActivityLoss } from "../../src/tax/E53-passive-activity-loss";
import {
  noExceptionRentalLoss,
  materialParticipantUnderLimit,
  realEstateProfessionalHighAgiPhaseout,
  taxHarvestingSuspendedLoss,
  noExceptionPositiveIncome,
  suspendedLossOffsetByPassiveIncome,
  partialAgiPhaseout,
  harvestWithNoSuspendedLoss,
  harvestAcrossMultipleProperties,
  harvestDefaultCapitalGainsRate,
  otherPassiveIncomeSourcesReduceLoss,
} from "./fixtures/passiveActivityLoss.fixtures";

describe("E53: Passive Activity Loss (PAL) & Tax Harvesting Engine", () => {
  describe("PAL exception eligibility", () => {
    it("should deny the PAL exception and suspend the entire loss with no material participation or RE professional status (Test 1)", () => {
      const result = passiveActivityLoss(noExceptionRentalLoss);

      expect(result.pal_exception_applies).toBe(false);
      expect(result.pal_deduction_limit).toBe(0);
      expect(result.deductiblePassiveLoss).toBe(0);
      expect(result.suspendedLossForYear).toBe(50000);
      expect(result.suspendedLossCarryforward_current).toBe(50000);
    });

    it("should grant the PAL exception for a real estate professional (Test 3)", () => {
      const result = passiveActivityLoss(realEstateProfessionalHighAgiPhaseout);
      expect(result.pal_exception_applies).toBe(true);
      expect(result.pal_deduction_limit).toBe(25000);
    });
  });

  describe("AGI phaseout", () => {
    it("should apply no phaseout below the $150k threshold (Test 2)", () => {
      const result = passiveActivityLoss(materialParticipantUnderLimit);
      expect(result.phaseout_reduced_deduction).toBe(25000);
      expect(result.phaseoutPercentage).toBe(0);
    });

    it("should fully phase out the $25k deduction at $200k AGI (Test 3)", () => {
      const result = passiveActivityLoss(realEstateProfessionalHighAgiPhaseout);
      expect(result.agi).toBe(200000);
      expect(result.phaseoutThreshold).toBe(150000);
      expect(result.phaseoutPercentage).toBe(1);
      expect(result.phaseout_reduced_deduction).toBe(0);
      expect(result.deductiblePassiveLoss).toBe(0);
      expect(result.suspendedLossForYear).toBe(20000);
    });

    it("should apply a partial 50-cent-per-dollar reduction between the threshold and full phaseout", () => {
      const result = passiveActivityLoss(partialAgiPhaseout);
      expect(result.phaseoutPercentage).toBe(0.4);
      expect(result.phaseout_reduced_deduction).toBe(15000);
      expect(result.deductiblePassiveLoss).toBe(15000);
      expect(result.suspendedLossForYear).toBe(25000);
    });
  });

  describe("Deductible vs. suspended loss", () => {
    it("should cap the deductible loss at $25k and carry forward the remainder (Test 2)", () => {
      const result = passiveActivityLoss(materialParticipantUnderLimit);

      expect(result.deductiblePassiveLoss).toBe(25000);
      expect(result.suspendedLossForYear).toBe(5000);
      expect(result.suspendedLossCarryforward_prior).toBe(10000);
      expect(result.suspendedLossCarryforward_current).toBe(15000);
    });

    it("should net other passive income sources against the rental loss before applying the cap", () => {
      const result = passiveActivityLoss(otherPassiveIncomeSourcesReduceLoss);

      expect(result.totalPassiveIncome).toBe(-25000);
      expect(result.deductiblePassiveLoss).toBe(25000);
      expect(result.suspendedLossForYear).toBe(0);
      expect(result.suspendedLossCarryforward_current).toBe(0);
    });
  });

  describe("Tax harvesting", () => {
    it("should calculate the tax saving from harvesting suspended losses against a sale gain (Test 4)", () => {
      const result = passiveActivityLoss(taxHarvestingSuspendedLoss);

      expect(result.harvestingAnalysis).toEqual({
        propertiesSuggested: ["Rental House A"],
        suspendedLossAvailableToUse: 50000,
        capitalGainsTax_ifHarvest: 4500,
        capitalGainsTax_ifNotHarvest: 12000,
        taxSavingFromHarvest: 7500,
        netProceedsAfterHarvest: 75500,
      });
    });

    it("should cap suspended loss usage at the realized gain and produce zero saving with no suspended loss", () => {
      const result = passiveActivityLoss(harvestWithNoSuspendedLoss);

      expect(result.harvestingAnalysis?.suspendedLossAvailableToUse).toBe(0);
      expect(result.harvestingAnalysis?.taxSavingFromHarvest).toBe(0);
      expect(result.harvestingAnalysis?.capitalGainsTax_ifHarvest).toBe(
        result.harvestingAnalysis?.capitalGainsTax_ifNotHarvest
      );
    });

    it("should aggregate realized gains across multiple properties for sale", () => {
      const result = passiveActivityLoss(harvestAcrossMultipleProperties);

      expect(result.harvestingAnalysis).toEqual({
        propertiesSuggested: ["Rental House C", "Rental House D"],
        suspendedLossAvailableToUse: 20000,
        capitalGainsTax_ifHarvest: 1500,
        capitalGainsTax_ifNotHarvest: 4500,
        taxSavingFromHarvest: 3000,
        netProceedsAfterHarvest: 28500,
      });
    });

    it("should default the capital gains rate to 15% when not supplied", () => {
      const result = passiveActivityLoss(harvestDefaultCapitalGainsRate);

      expect(result.harvestingAnalysis).toEqual({
        propertiesSuggested: ["Rental House E"],
        suspendedLossAvailableToUse: 10000,
        capitalGainsTax_ifHarvest: 1500,
        capitalGainsTax_ifNotHarvest: 3000,
        taxSavingFromHarvest: 1500,
        netProceedsAfterHarvest: 18500,
      });
    });

    it("should omit harvestingAnalysis when no properties for sale are supplied", () => {
      const result = passiveActivityLoss(noExceptionRentalLoss);
      expect(result.harvestingAnalysis).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should report no PAL issue for positive income with no exception (Test 5)", () => {
      const result = passiveActivityLoss(noExceptionPositiveIncome);

      expect(result.pal_exception_applies).toBe(false);
      expect(result.pal_deduction_limit).toBe(0);
      expect(result.passiveIncomeLossForYear).toBe(50000);
      expect(result.deductiblePassiveLoss).toBe(0);
      expect(result.suspendedLossForYear).toBe(0);
    });

    it("should leave the suspended loss carryforward unchanged when passive income offsets it without eliminating it (Test 6)", () => {
      const result = passiveActivityLoss(suspendedLossOffsetByPassiveIncome);

      expect(result.passiveIncomeLossForYear).toBe(15000);
      expect(result.deductiblePassiveLoss).toBe(0);
      expect(result.suspendedLossForYear).toBe(0);
      expect(result.suspendedLossCarryforward_prior).toBe(30000);
      expect(result.suspendedLossCarryforward_current).toBe(30000);
    });

    it("should include the advisory disclaimer, echo inputs, and produce an ISO 8601 timestamp with the current year", () => {
      const result = passiveActivityLoss(materialParticipantUnderLimit);

      expect(result.disclaimer.length).toBeGreaterThan(0);
      expect(result.inputs).toEqual(materialParticipantUnderLimit);
      expect(result.jurisdiction).toBe("US");
      expect(result.year).toBe(new Date().getFullYear());
      expect(result.calculated_at).toBe(new Date(result.calculated_at).toISOString());
    });
  });
});
