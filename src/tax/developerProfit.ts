/**
 * @license Closed-Source License Keys (InvestScape)
 * @copyright 2026 Lighthouse Research Ltd. DBA InvestScape
 *
 * This module is part of the InvestScape formula engine library.
 * Use is restricted to licensed InvestScape subscribers (S3 Enterprise+).
 * Unauthorized copying, distribution, or use is prohibited.
 *
 * Licensing: https://investscape.com/licensing
 * Contact: licensing@investscape.com
 */

import type { DeveloperProfitInput, DeveloperProfitOutput } from "./taxTypes";

/**
 * E51: Developer Profit & Tax Engine.
 *
 * Development profit is active business income: no PAL limits (US), no
 * rental-loss restriction (Canada), and no depreciation — development costs
 * are expensed as incurred rather than capitalized (a developer who instead
 * retains a completed building as a rental uses E48, not this engine).
 *
 * Canada adds GST/HST and municipal development charges (both pre-calculated
 * by E52 and passed in here) into total costs; the US has no equivalent, so
 * any gstHstOwing/developmentChargesOwing passed for a US project are echoed
 * in the output but excluded from totalCosts, per spec.
 *
 * afterTaxProfit/effectiveTaxRate are `null` — not simply omitted — when
 * developerMarginalTaxRate isn't supplied and pre-tax profit isn't exactly
 * zero, mirroring how depreciation.ts's RecaptureInfo uses `| null` for "not
 * applicable" rather than leaving the field undefined. At exactly zero
 * pre-tax profit the tax owed is $0 regardless of rate, so both are reported
 * as 0 even without a rate.
 *
 * The input spec has no `year` field (unlike E48/E49, which take an explicit
 * currentYear because bracket/schedule lookups need it); E51 does no
 * year-dependent lookup, so `year` is simply the current calendar year at
 * calculation time, for audit-trail purposes only.
 */
export function developerProfit(input: DeveloperProfitInput): DeveloperProfitOutput {
  const gstHstOwing = round(input.gstHstOwing ?? 0, 2);
  const developmentChargesOwing = round(input.developmentChargesOwing ?? 0, 2);

  let totalCosts = input.hardCosts + input.softCosts;
  if (input.jurisdiction === "CA") {
    totalCosts += gstHstOwing + developmentChargesOwing;
  }
  totalCosts = round(totalCosts, 2);

  const preMinusTaxProfit = round(input.totalRevenueFromSales - totalCosts, 2);

  let afterTaxProfit: number | null = null;
  let effectiveTaxRate: number | null = null;

  if (preMinusTaxProfit === 0) {
    afterTaxProfit = 0;
    effectiveTaxRate = 0;
  } else if (input.developerMarginalTaxRate !== undefined) {
    const incomeTaxOwing = Math.max(0, preMinusTaxProfit * input.developerMarginalTaxRate);
    afterTaxProfit = round(preMinusTaxProfit - incomeTaxOwing, 2);
    effectiveTaxRate =
      input.totalRevenueFromSales !== 0
        ? round(incomeTaxOwing / input.totalRevenueFromSales, 4)
        : 0;
  }

  return {
    totalRevenueFromSales: input.totalRevenueFromSales,
    hardCosts: input.hardCosts,
    softCosts: input.softCosts,
    totalCosts,
    gstHstOwing,
    developmentChargesOwing,
    preMinusTaxProfit,
    afterTaxProfit,
    effectiveTaxRate,
    jurisdiction: input.jurisdiction,
    year: new Date().getFullYear(),
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
