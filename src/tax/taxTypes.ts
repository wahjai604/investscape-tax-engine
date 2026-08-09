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

export type Jurisdiction = "CA" | "US";

export type CanadianProvince =
  | "BC"
  | "AB"
  | "SK"
  | "MB"
  | "ON"
  | "QC"
  | "NB"
  | "NS"
  | "PE"
  | "NL"
  | "NT"
  | "YT"
  | "NU";

export type FilingStatus = "single" | "married" | "head_of_household";

export interface TaxAggregationProperty {
  address: string;
  rentalIncome: number;
  rentalExpenses: number;
  mortgageInterestPaid: number;
  mortgagePrincipal: number;
  depreciation: number;
  capGains?: number;
}

export interface TaxAggregationInput {
  properties: TaxAggregationProperty[];
  jurisdiction: Jurisdiction;
  province?: CanadianProvince | string;
  state?: string;
  filingStatus: FilingStatus;
  otherIncome: number;
  realEstateProfessional?: boolean;
  year: number;
}

export interface TaxAggregationFlags {
  hasNegativeCashFlow: boolean;
  depreciationExceedsIncome: boolean;
  realEstateProfessional: boolean;
  passiveActivityLossLikely: boolean;
}

export interface TaxAggregationOutput {
  aggregateRentalIncome: number;
  aggregateRentalExpenses: number;
  aggregateMortgageInterest: number;
  aggregateDepreciation: number;

  rentalIncomePool: number;
  deductibleExpenses: number;
  depreciationAllowed: number;

  taxableIncome: number;
  capitalGains: number;

  totalIncome: number;

  flags: TaxAggregationFlags;

  calculatedAt: string;
  inputs: TaxAggregationInput;
}

/** A single marginal-rate tax bracket. `upper` is exclusive-open (use Infinity for the top bracket). */
export interface TaxBracket {
  lower: number;
  upper: number;
  rate: number;
}

/** Portion of income taxed within one bracket, for audit-trail transparency. */
export interface TaxBracketBreakdown {
  income: number;
  rate: number;
  tax: number;
}

export interface PersonalIncomeTaxInput {
  totalIncome: number;

  jurisdiction: Jurisdiction;
  province?: CanadianProvince | string;
  state?: string;
  filingStatus: FilingStatus;
  year: number;

  capitalGainsIncome?: number;
  capitalGainsInclusionRate?: number;

  dependents?: number;
}

export interface PersonalIncomeTaxOutput {
  totalIncome: number;
  taxableIncome: number;

  federalTaxBracket: string;
  federalTaxOwing: number;

  provincialStateTaxBracket: string;
  provincialStateTaxOwing: number;

  totalTaxOwing: number;
  marginalTaxRate: number;
  effectiveTaxRate: number;

  brackets: {
    federalBrackets: TaxBracketBreakdown[];
    provincialStateBrackets: TaxBracketBreakdown[];
  };

  capitalGainsTaxed?: number;

  calculatedAt: string;
  inputs: PersonalIncomeTaxInput;
}

export type PropertyType = "residential" | "commercial";

export interface DepreciationInput {
  jurisdiction: Jurisdiction;
  purchasePrice: number;
  buildingCost: number;
  landCost: number;

  propertyType: PropertyType;
  acquisitionYear: number;

  currentYear: number;
  /** Accepted for interface completeness; multi-year projection is not yet implemented — call once per year, threading state via priorYearClosingUCC / priorCumulativeDepreciation. */
  holdingYears?: number;

  salePrice?: number;
  saleYear?: number;

  priorYearClosingUCC?: number;
  priorCumulativeDepreciation?: number;

  /**
   * Investor's marginal tax rate (E47's `marginalTaxRate` output). Canadian
   * CCA recapture is 100% ordinary income taxed at the investor's marginal
   * rate rather than a fixed statutory rate, so this is required whenever
   * jurisdiction is "CA" and a sale is being processed (salePrice given).
   * Not used for US, which recaptures at a fixed 25% federal §1250 cap.
   */
  investorMarginalTaxRate?: number;
}

export interface CcaPoolInfo {
  openingUCC: number;
  additionsAtHalfYear: number;
  ccaClaimable: number;
  closingUCC: number;
  halfYearRuleApplied: boolean;
}

export interface MacrsInfo {
  depreciableBase: number;
  recoveryPeriod: number;
  annualMACRS: number;
  cumulativeDepreciation: number;
}

export type RecaptureType = "ordinary_income" | "section_1250_unrecaptured";

export interface RecaptureInfo {
  salePrice: number;
  adjustedBasis: number;
  gainOnSale: number;

  cumulativeCCAClaimedOrMACRS: number;
  recapture: number;
  recaptureType: RecaptureType;

  capitalGainAfterRecapture: number;

  recaptureTaxRate: number;
  recaptureTaxOwing: number;
}

export interface DepreciationOutput {
  annualDepreciationAllowance: number;

  ccaPoolInfo?: CcaPoolInfo;
  macrsInfo?: MacrsInfo;
  recaptureInfo: RecaptureInfo | null;

  depreciationMethod: "CCA" | "MACRS";
  jurisdiction: Jurisdiction;
  year: number;

  calculatedAt: string;
  inputs: DepreciationInput;
}

export type PaymentFrequency = "annual" | "semi-annual" | "monthly";

export interface MortgageInterestInput {
  jurisdiction: Jurisdiction;
  loanAmount: number;
  annualRate: number;
  amortizationYears: number;

  originationYear: number;
  currentYear: number;

  /** Defaults to "monthly" if omitted. */
  paymentFrequency?: PaymentFrequency;

  priorYearEndingBalance?: number;
}

export interface MortgageInterestOutput {
  annualPayment: number;
  annualInterest: number;
  annualPrincipal: number;

  beginningBalance: number;
  endingBalance: number;

  effectiveAnnualRate: number;

  loanAmount: number;
  amortizationYears: number;
  monthsRemaining: number;

  deductibleInterest: number;
  nonDeductibleInterest?: number;

  jurisdiction: Jurisdiction;
  year: number;

  calculatedAt: string;
  inputs: MortgageInterestInput;
}

export type ExpenseClassification =
  | "deductible"
  | "capitalized"
  | "mixed"
  | "review";

export interface OperatingExpenseLineItem {
  description: string;
  amount: number;
  /** Optional UX hint only; classification is driven by `description`, not this field. */
  category?: string;
}

export interface OperatingExpenseInput {
  jurisdiction: Jurisdiction;
  province?: CanadianProvince | string;
  /** Defaults to "residential" if omitted. */
  propertyType?: PropertyType;

  expenses: OperatingExpenseLineItem[];

  /** Overrides the engine's built-in repair-vs-improvement dollar threshold when provided. */
  autoCapitalizeThreshold?: number;
}

export interface OperatingExpenseLineItemResult {
  description: string;
  amount: number;
  classification: ExpenseClassification;
  reason: string;
  /** 0 for "review" items — nothing is allocated until the ambiguity is resolved. */
  deductibleAmount: number;
  /** 0 for "review" items — nothing is allocated until the ambiguity is resolved. */
  capitalizedAmount: number;
  jurisdiction: Jurisdiction;
  ruleCitation: string;
}

export interface CapitalizedGuidance {
  assetClass: string;
  recoveryPeriod: string;
}

export interface OperatingExpenseOutput {
  expenses: OperatingExpenseLineItemResult[];

  totalExpenses: number;
  totalDeductible: number;
  totalCapitalized: number;

  /** One entry per capitalized (or mixed) expense, in the same order as `expenses`. */
  capitalizedGuidance: CapitalizedGuidance[];

  jurisdiction: Jurisdiction;
  propertyType: PropertyType;

  disclaimer: string;

  calculatedAt: string;
  inputs: OperatingExpenseInput;
}

export interface DeveloperSoftCostDetails {
  architecturalEngineering: number;
  permits: number;
  insurance: number;
  management: number;
  financing: number;
  advertising: number;
  other: number;
}

export interface DeveloperProfitInput {
  jurisdiction: Jurisdiction;
  province?: CanadianProvince | string;
  /** Accepted alongside `province` for interface consistency with the other engines (see TaxAggregationInput/PersonalIncomeTaxInput); not used in any E51 calculation. */
  state?: string;

  totalRevenueFromSales: number;

  hardCosts: number;
  softCosts: number;

  /** Optional itemized breakdown, echoed for audit trail only — `softCosts` (not this) drives the calculation. */
  softCostDetails?: DeveloperSoftCostDetails;

  /** CA only: pre-calculated by E52. Ignored for US per spec (no GST/HST/dev-charge equivalent). */
  gstHstOwing?: number;
  /** CA only: pre-calculated by E52. Ignored for US per spec. */
  developmentChargesOwing?: number;

  /** US only; noted as not affecting this engine's math (active business income has no PAL limits either way). */
  realEstateProfessional?: boolean;

  /** Developer's marginal tax rate (e.g. from E47). Optional — without it, afterTaxProfit/effectiveTaxRate are null unless pre-tax profit is exactly zero. */
  developerMarginalTaxRate?: number;
}

export type GstHstProvince =
  | "BC"
  | "AB"
  | "SK"
  | "MB"
  | "ON"
  | "QC"
  | "NB"
  | "NS"
  | "PE"
  | "NL";

export interface GstHstDevChargesInput {
  jurisdiction: "CA";
  province: GstHstProvince;
  municipality?: string;

  constructionCosts: number;

  unitCount: number;
  unitType: PropertyType;

  gstHstRegistered: boolean;

  /** Overrides the municipality/province default lookup when provided. */
  devChargeRatePerUnit?: number;
}

export interface GstHstDevChargesOutput {
  gstHstRate: number;
  gstHstChargedOnCosts: number;

  inputTaxCreditsRecoverable: number;
  netGstHstOwing: number;

  devChargeRatePerUnit: number;
  unitCount: number;
  totalDevCharges: number;

  /** Amount to feed into E51's project costs — equal to netGstHstOwing. */
  totalGstHstCost: number;
  /** Amount to feed into E51's project costs — equal to totalDevCharges. */
  totalDevChargesCost: number;
  combinedCost: number;

  jurisdiction: "CA";
  province: GstHstProvince;
  gstHstRegistered: boolean;
  year: number;

  calculatedAt: string;
  inputs: GstHstDevChargesInput;

  gstHstExplanation: string;
  devChargeExplanation: string;
}

export interface DeveloperProfitOutput {
  totalRevenueFromSales: number;

  hardCosts: number;
  softCosts: number;
  /** hardCosts + softCosts, plus gstHstOwing + developmentChargesOwing when jurisdiction is CA. */
  totalCosts: number;

  gstHstOwing: number;
  developmentChargesOwing: number;

  preMinusTaxProfit: number;

  /** Null when no developerMarginalTaxRate was supplied and pre-tax profit isn't exactly zero (no tax rate to apply). */
  afterTaxProfit: number | null;
  /** Null under the same condition as afterTaxProfit. */
  effectiveTaxRate: number | null;

  jurisdiction: Jurisdiction;
  year: number;

  calculatedAt: string;
  inputs: DeveloperProfitInput;
}

export interface PassiveActivityLossPropertyForSale {
  description: string;
  realizedGain: number;
  /**
   * Declared in the spec's input interface but never referenced by the
   * harvesting formula in the spec's own Step 6 (it sums `realizedGain`
   * across properties and applies the suspended-loss pool globally, not
   * per-property). Kept optional and echoed via `inputs` only.
   */
  usableAgainstSuspendedLoss?: number;
}

/**
 * Field names below mix snake_case (materially_participates,
 * pal_exception_applies, calculated_at, ...) with this codebase's usual
 * camelCase. That's preserved deliberately: these are the literal input/
 * output contract keys the spec's own worked examples and test fixtures use
 * (e.g. `materially_participates: false` as a fixture key), so renaming them
 * to camelCase would break the documented contract rather than just fix a
 * style inconsistency.
 */
export interface PassiveActivityLossInput {
  jurisdiction: "US";
  state: string;

  materially_participates: boolean;
  real_estate_professional: boolean;

  rentalsFromE46: number;
  passiveIncomeOtherSources?: number;

  suspendedLossCarryforward?: number;

  agiFederal?: number;

  propertiesForSaleThisYear?: PassiveActivityLossPropertyForSale[];

  capitalGainsTaxRate?: number;
  incomeTaxRate?: number;
}

export interface PassiveActivityLossHarvestingAnalysis {
  propertiesSuggested: string[];
  suspendedLossAvailableToUse: number;
  capitalGainsTax_ifHarvest: number;
  capitalGainsTax_ifNotHarvest: number;
  taxSavingFromHarvest: number;
  netProceedsAfterHarvest: number;
}

export interface PassiveActivityLossOutput {
  pal_exception_applies: boolean;
  pal_deduction_limit: number;

  passiveIncomeLossForYear: number;
  passiveIncomeOtherSources: number;
  totalPassiveIncome: number;

  agi: number;
  phaseoutThreshold: number;
  /** Fraction of the $25k limit consumed by the AGI phaseout (0 = none, 1 = fully phased out). */
  phaseoutPercentage: number;
  phaseout_reduced_deduction: number;

  deductiblePassiveLoss: number;
  suspendedLossForYear: number;

  suspendedLossCarryforward_prior: number;
  suspendedLossCarryforward_current: number;

  /** Present only when `propertiesForSaleThisYear` was supplied and non-empty. */
  harvestingAnalysis?: PassiveActivityLossHarvestingAnalysis;

  jurisdiction: "US";
  year: number;

  calculated_at: string;
  inputs: PassiveActivityLossInput;

  disclaimer: string;
}
