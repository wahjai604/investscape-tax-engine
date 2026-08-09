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

export { taxAggregation } from "./taxAggregation";
export { personalIncomeTax } from "./personalIncomeTax";
export { depreciation } from "./depreciation";
export { mortgageInterest } from "./mortgageInterest";
export { operatingExpense } from "./operatingExpense";
export { developerProfit } from "./developerProfit";
export { gstHstDevCharges } from "./gstHstDevCharges";
export { passiveActivityLoss } from "./passiveActivityLoss";
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
