/**
 * @license Closed-Source License Keys (InvestScape)
 * @copyright 2026 Lighthouse Research Ltd. DBA InvestScape
 *
 * This module is part of the InvestScape formula engine library.
 * Use is restricted to licensed InvestScape subscribers (S1+).
 * Unauthorized copying, distribution, or use is prohibited.
 *
 * Licensing: https://investscape.com/licensing
 * Contact: licensing@investscape.com
 */

export { taxAggregation } from "./E46-tax-aggregation";
export { personalIncomeTax } from "./E47-personal-income-tax";
export { depreciation } from "./E48-depreciation";
export { mortgageInterest } from "./E49-mortgage-interest";
export { operatingExpense } from "./E50-operating-expense";
export { developerProfit } from "./E51-developer-profit";
export { gstHstDevCharges } from "./E52-gst-hst-dev-charges";
export { passiveActivityLoss } from "./E53-passive-activity-loss";
export { section1031Exchange } from "./E68-section-1031-exchange";
export { costSegregation } from "./E69-cost-segregation";
export { opportunityZones } from "./E70-opportunity-zones";
export { calculateCrossBorderWithholding } from "./E83-cross-border-withholding";

// Phase 2 scaffolds (typed contracts only — not implemented, not
// E-numbered; every function below throws immediately when called). See
// phase2-scaffolds-international.ts's own doc comment for what's actually
// blocking each of the two remaining functions.
export * from "./phase2-scaffolds-international";

export type {
  TaxAggregationInput,
  TaxAggregationOutput,
  TaxAggregationProperty,
  TaxAggregationFlags,
  PersonalIncomeTaxInput,
  PersonalIncomeTaxOutput,
  TaxBracket,
  TaxBracketBreakdown,
  DepreciationInput,
  DepreciationOutput,
  PropertyType,
  CcaPoolInfo,
  MacrsInfo,
  RecaptureInfo,
  RecaptureType,
  MortgageInterestInput,
  MortgageInterestOutput,
  PaymentFrequency,
  Jurisdiction,
  CanadianProvince,
  FilingStatus,
  ExpenseClassification,
  OperatingExpenseLineItem,
  OperatingExpenseInput,
  OperatingExpenseLineItemResult,
  CapitalizedGuidance,
  OperatingExpenseOutput,
  DeveloperSoftCostDetails,
  DeveloperProfitInput,
  DeveloperProfitOutput,
  GstHstProvince,
  GstHstDevChargesInput,
  GstHstDevChargesOutput,
  PassiveActivityLossPropertyForSale,
  PassiveActivityLossInput,
  PassiveActivityLossHarvestingAnalysis,
  PassiveActivityLossOutput,
  Section1031Input,
  Section1031Result,
  CostSegregationPropertyUse,
  CostSegregationInput,
  CostSegregationResult,
  OpportunityZoneRegime,
  OpportunityZoneInput,
  OpportunityZoneResult,
  CrossBorderTransactionType,
  CrossBorderWithholdingRequest,
  CrossBorderWithholdingResult,
} from "./taxTypes";
