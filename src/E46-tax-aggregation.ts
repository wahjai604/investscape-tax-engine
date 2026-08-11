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

import type { TaxAggregationInput, TaxAggregationOutput } from "./taxTypes";

/**
 * E46: Tax Aggregation Engine.
 *
 * Pools property-level rental income/expenses across the portfolio and applies
 * jurisdiction-specific loss-restriction rules before handing an aggregate
 * taxable income figure to E47 (Personal Income Tax).
 *
 * Canada: CRA rental-loss restriction — CCA cannot be used to create or
 * increase a rental loss, so depreciation is zeroed out whenever the
 * pre-depreciation rental pool is already in a loss position.
 *
 * US: no property-pool-level restriction; full depreciation is always
 * allowed here. Passive Activity Loss limits are applied downstream in E53,
 * and this engine only raises a preliminary flag for that engine to consume.
 */
export function taxAggregation(
  input: TaxAggregationInput
): TaxAggregationOutput {
  const aggregateRentalIncome = sum(input.properties, (p) => p.rentalIncome);
  const aggregateRentalExpenses = sum(
    input.properties,
    (p) => p.rentalExpenses
  );
  const aggregateMortgageInterest = sum(
    input.properties,
    (p) => p.mortgageInterestPaid
  );
  const aggregateDepreciation = sum(input.properties, (p) => p.depreciation);
  const capitalGains = sum(input.properties, (p) => p.capGains ?? 0);

  const rentalIncomePool = aggregateRentalIncome;
  const deductibleExpenses = aggregateRentalExpenses + aggregateMortgageInterest;
  const preliminaryNetIncome = rentalIncomePool - deductibleExpenses;

  const depreciationAllowed =
    input.jurisdiction === "CA" && preliminaryNetIncome < 0
      ? 0
      : aggregateDepreciation;

  const taxableIncome = rentalIncomePool - deductibleExpenses - depreciationAllowed;
  const totalIncome = taxableIncome + input.otherIncome + capitalGains;

  const realEstateProfessional = input.realEstateProfessional ?? false;

  const flags = {
    hasNegativeCashFlow: preliminaryNetIncome < 0,
    depreciationExceedsIncome: aggregateDepreciation > preliminaryNetIncome,
    realEstateProfessional,
    passiveActivityLossLikely:
      input.jurisdiction === "US" &&
      taxableIncome < 0 &&
      !realEstateProfessional,
  };

  return {
    aggregateRentalIncome,
    aggregateRentalExpenses,
    aggregateMortgageInterest,
    aggregateDepreciation,
    rentalIncomePool,
    deductibleExpenses,
    depreciationAllowed,
    taxableIncome,
    capitalGains,
    totalIncome,
    flags,
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((total, item) => total + selector(item), 0);
}
