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

import type {
  CcaPoolInfo,
  DepreciationInput,
  DepreciationOutput,
  MacrsInfo,
  RecaptureInfo,
} from "./taxTypes";

const CCA_CLASS_1_RATE = 0.04;
const US_RESIDENTIAL_RECOVERY_YEARS = 27.5;
const US_COMMERCIAL_RECOVERY_YEARS = 39;
const US_SECTION_1250_FEDERAL_RATE = 0.25;

/**
 * E48: Depreciation & Recapture Engine.
 *
 * Canada: declining-balance CCA (Class 1 @ 4%) with the 50% half-year rule
 * in the acquisition year. US: straight-line MACRS (27.5yr residential /
 * 39yr commercial) with the half-year convention. Land is never
 * depreciated in either jurisdiction.
 *
 * This is a single-year calculator: multi-year holds are computed by
 * calling once per year, threading pool state forward via
 * `priorYearClosingUCC` (CA) or `priorCumulativeDepreciation` (US).
 */
export function depreciation(input: DepreciationInput): DepreciationOutput {
  return input.jurisdiction === "CA"
    ? calculateCanadian(input)
    : calculateUs(input);
}

function calculateCanadian(input: DepreciationInput): DepreciationOutput {
  const isAcquisitionYear = input.currentYear === input.acquisitionYear;

  if (!isAcquisitionYear && input.priorYearClosingUCC === undefined) {
    throw new Error(
      "priorYearClosingUCC is required for CA depreciation in a year after acquisition"
    );
  }

  const openingUCC = isAcquisitionYear ? 0 : input.priorYearClosingUCC!;
  const additionsAtHalfYear = isAcquisitionYear ? input.buildingCost * 0.5 : 0;
  const { ccaClaimable, closingUCC } = calculateCCA(
    openingUCC,
    additionsAtHalfYear
  );

  const ccaPoolInfo: CcaPoolInfo = {
    openingUCC: round(openingUCC, 2),
    additionsAtHalfYear: round(additionsAtHalfYear, 2),
    ccaClaimable,
    closingUCC,
    halfYearRuleApplied: isAcquisitionYear,
  };

  // No capital additions are modeled after the acquisition year, so total
  // CCA claimed to date is simply what's been drawn down from the pool
  // that was seeded in year 1 (buildingCost * 0.5).
  const cumulativeCCAClaimed = round(
    input.buildingCost * 0.5 - closingUCC,
    2
  );

  return {
    annualDepreciationAllowance: ccaClaimable,
    ccaPoolInfo,
    recaptureInfo: buildCanadianRecapture(input, cumulativeCCAClaimed),
    depreciationMethod: "CCA",
    jurisdiction: "CA",
    year: input.currentYear,
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function buildCanadianRecapture(
  input: DepreciationInput,
  cumulativeCCAClaimed: number
): RecaptureInfo | null {
  if (input.salePrice === undefined || input.salePrice === null) {
    return null;
  }
  if (input.investorMarginalTaxRate === undefined) {
    throw new Error(
      "investorMarginalTaxRate is required to compute CA recapture tax owing (pass E47's marginalTaxRate output)"
    );
  }

  const adjustedBasis = input.buildingCost;
  const gainOnSale = round(input.salePrice - adjustedBasis, 2);
  // A sale at a loss (gainOnSale < 0) recaptures nothing — recapture is
  // capped below at zero gain, not the raw (possibly negative) gain.
  const recapture = round(
    Math.min(cumulativeCCAClaimed, Math.max(gainOnSale, 0)),
    2
  );
  const capitalGainAfterRecapture = round(gainOnSale - recapture, 2);
  const recaptureTaxRate = 1.0;

  return {
    salePrice: input.salePrice,
    adjustedBasis,
    gainOnSale,
    cumulativeCCAClaimedOrMACRS: cumulativeCCAClaimed,
    recapture,
    recaptureType: "ordinary_income",
    capitalGainAfterRecapture,
    recaptureTaxRate,
    recaptureTaxOwing: round(recapture * input.investorMarginalTaxRate, 2),
  };
}

function calculateUs(input: DepreciationInput): DepreciationOutput {
  const isAcquisitionYear = input.currentYear === input.acquisitionYear;
  const recoveryPeriod =
    input.propertyType === "commercial"
      ? US_COMMERCIAL_RECOVERY_YEARS
      : US_RESIDENTIAL_RECOVERY_YEARS;

  const annualDepreciation = calculateMACRS(
    input.buildingCost,
    recoveryPeriod,
    isAcquisitionYear
  );
  const annualDepreciationAllowance = round(annualDepreciation, 2);

  if (
    !isAcquisitionYear &&
    input.salePrice != null &&
    input.priorCumulativeDepreciation === undefined
  ) {
    throw new Error(
      "priorCumulativeDepreciation is required to compute recapture on a US sale in a year after acquisition"
    );
  }

  const cumulativeDepreciation = round(
    (input.priorCumulativeDepreciation ?? 0) + annualDepreciation,
    2
  );

  const macrsInfo: MacrsInfo = {
    depreciableBase: input.buildingCost,
    recoveryPeriod,
    annualMACRS: round(input.buildingCost / recoveryPeriod, 2),
    cumulativeDepreciation,
  };

  return {
    annualDepreciationAllowance,
    macrsInfo,
    recaptureInfo: buildUsRecapture(input, cumulativeDepreciation),
    depreciationMethod: "MACRS",
    jurisdiction: "US",
    year: input.currentYear,
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function buildUsRecapture(
  input: DepreciationInput,
  cumulativeDepreciation: number
): RecaptureInfo | null {
  if (input.salePrice === undefined || input.salePrice === null) {
    return null;
  }

  const adjustedBasis = input.buildingCost;
  const gainOnSale = round(input.salePrice - adjustedBasis, 2);
  const recapture = round(
    Math.min(cumulativeDepreciation, Math.max(gainOnSale, 0)),
    2
  );
  const capitalGainAfterRecapture = round(gainOnSale - recapture, 2);
  const recaptureTaxRate = US_SECTION_1250_FEDERAL_RATE;

  return {
    salePrice: input.salePrice,
    adjustedBasis,
    gainOnSale,
    cumulativeCCAClaimedOrMACRS: cumulativeDepreciation,
    recapture,
    recaptureType: "section_1250_unrecaptured",
    capitalGainAfterRecapture,
    recaptureTaxRate,
    recaptureTaxOwing: round(recapture * recaptureTaxRate, 2),
  };
}

function calculateCCA(
  openingUCC: number,
  additions: number,
  rate: number = CCA_CLASS_1_RATE
): { ccaClaimable: number; closingUCC: number } {
  const base = openingUCC + additions;
  const ccaClaimable = round(base * rate, 2);
  const closingUCC = round(base - ccaClaimable, 2);
  return { ccaClaimable, closingUCC };
}

function calculateMACRS(
  depreciableBase: number,
  recoveryPeriod: number,
  isAcquisitionYear: boolean
): number {
  const annualMACRS = depreciableBase / recoveryPeriod;
  return isAcquisitionYear ? annualMACRS * 0.5 : annualMACRS;
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value
  // (e.g. 28133 * 0.205 = 5767.264999999999); toPrecision cleans that noise
  // up before rounding so exact-decimal tax math doesn't round down a cent.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
