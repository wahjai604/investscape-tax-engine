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
} from "./taxTypes";
