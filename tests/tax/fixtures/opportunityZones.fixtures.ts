import type { OpportunityZoneInput } from "../../../src/taxTypes";

/** Dated in 2025, under the legacy regime — must keep its fixed 2026-12-31 deadline even though "today" is 2026+. */
export const legacyInvestmentFromPriorYear: OpportunityZoneInput = {
  jurisdiction: "US",
  regime: "legacy_2017",
  investmentDate: "2025-06-01",
  isRuralQOZ: false,
  originalGainAmount: 200000,
  substantialImprovementCompletedPercent: 1,
};

export const legacyInvestmentDatedLater: OpportunityZoneInput = {
  jurisdiction: "US",
  regime: "legacy_2017",
  investmentDate: "2026-08-01",
  isRuralQOZ: false,
  originalGainAmount: 150000,
  substantialImprovementCompletedPercent: 1,
};

export const permanentRegimeStandard: OpportunityZoneInput = {
  jurisdiction: "US",
  regime: "permanent_2026",
  investmentDate: "2027-03-10",
  isRuralQOZ: false,
  originalGainAmount: 300000,
  substantialImprovementCompletedPercent: 1,
};

export const permanentRegimeRuralMeetsThreshold: OpportunityZoneInput = {
  jurisdiction: "US",
  regime: "permanent_2026",
  investmentDate: "2027-03-10",
  isRuralQOZ: true,
  originalGainAmount: 300000,
  substantialImprovementCompletedPercent: 0.55,
};

/** Rural QOZ claiming the 30% step-up but under the reduced 50% improvement threshold. */
export const ruralQOZBelowThreshold: OpportunityZoneInput = {
  jurisdiction: "US",
  regime: "permanent_2026",
  investmentDate: "2027-03-10",
  isRuralQOZ: true,
  originalGainAmount: 300000,
  substantialImprovementCompletedPercent: 0.3,
};

/** Standard (non-rural) QOZ under the full 100% improvement threshold. */
export const standardQOZBelowThreshold: OpportunityZoneInput = {
  jurisdiction: "US",
  regime: "permanent_2026",
  investmentDate: "2027-03-10",
  isRuralQOZ: false,
  originalGainAmount: 300000,
  substantialImprovementCompletedPercent: 0.9,
};
