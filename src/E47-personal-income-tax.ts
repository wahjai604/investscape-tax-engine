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

import { canadianBrackets } from "./brackets/canadianBrackets";
import { usBrackets } from "./brackets/usBrackets";
import type {
  CanadianProvince,
  PersonalIncomeTaxInput,
  PersonalIncomeTaxOutput,
  TaxBracket,
  TaxBracketBreakdown,
} from "./taxTypes";

interface ProgressiveTaxResult {
  totalTax: number;
  breakdown: TaxBracketBreakdown[];
  marginalRate: number;
}

/**
 * E47: Personal Income Tax Engine.
 *
 * Applies progressive marginal brackets to the aggregate taxable income
 * produced by E46, for both the federal and provincial/state layer, and
 * combines them into total tax owing plus marginal/effective rates.
 *
 * Bracket data is only loaded for jurisdictions that have been verified
 * (see brackets/canadianBrackets.ts and brackets/usBrackets.ts). Any other
 * province, state, or year throws rather than silently applying a guessed
 * rate table — a wrong tax bracket is worse than a clear error.
 */
export function personalIncomeTax(
  input: PersonalIncomeTaxInput
): PersonalIncomeTaxOutput {
  const { totalIncome, year } = input;
  const taxableIncome = totalIncome;

  const { federalBrackets, regionalBrackets } = resolveBrackets(input);

  const federalResult = calculateProgressiveTax(taxableIncome, federalBrackets);
  const regionalResult = regionalBrackets
    ? calculateProgressiveTax(taxableIncome, regionalBrackets)
    : { totalTax: 0, breakdown: [], marginalRate: 0 };

  const totalTaxOwing = round(federalResult.totalTax + regionalResult.totalTax, 2);
  const marginalTaxRate = round(
    federalResult.marginalRate + regionalResult.marginalRate,
    4
  );
  const effectiveTaxRate =
    taxableIncome > 0 ? round(totalTaxOwing / taxableIncome, 4) : 0;

  return {
    totalIncome,
    taxableIncome,
    federalTaxBracket: formatRate(federalResult.marginalRate),
    federalTaxOwing: round(federalResult.totalTax, 2),
    provincialStateTaxBracket: formatRate(regionalResult.marginalRate),
    provincialStateTaxOwing: round(regionalResult.totalTax, 2),
    totalTaxOwing,
    marginalTaxRate,
    effectiveTaxRate,
    brackets: {
      federalBrackets: federalResult.breakdown,
      provincialStateBrackets: regionalResult.breakdown,
    },
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function resolveBrackets(input: PersonalIncomeTaxInput): {
  federalBrackets: TaxBracket[];
  regionalBrackets: TaxBracket[] | null;
} {
  const { jurisdiction, year } = input;

  if (jurisdiction === "CA") {
    const table = canadianBrackets[year];
    if (!table) {
      throw new Error(`Canadian tax bracket data not loaded for year ${year}`);
    }
    if (!input.province) {
      throw new Error("province is required for CA jurisdiction");
    }
    const regionalBrackets = table.provincial[input.province as CanadianProvince];
    if (!regionalBrackets) {
      throw new Error(
        `Provincial tax bracket data not yet loaded for province '${input.province}'`
      );
    }
    return { federalBrackets: table.federal, regionalBrackets };
  }

  const table = usBrackets[year];
  if (!table) {
    throw new Error(`US tax bracket data not loaded for year ${year}`);
  }
  const federalBrackets = table.federal[input.filingStatus];
  if (!federalBrackets) {
    throw new Error(
      `US federal tax bracket data not loaded for filing status '${input.filingStatus}'`
    );
  }
  if (!input.state) {
    throw new Error("state is required for US jurisdiction");
  }
  if (!(input.state in table.state)) {
    throw new Error(
      `State tax bracket data not yet loaded for state '${input.state}'`
    );
  }
  // A value of `null` here is a verified no-income-tax state, not missing data.
  const regionalBrackets = table.state[input.state] ?? null;
  return { federalBrackets, regionalBrackets };
}

function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[]
): ProgressiveTaxResult {
  let totalTax = 0;
  const breakdown: TaxBracketBreakdown[] = [];
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (income <= bracket.lower) break;

    const incomeInBracket = Math.min(income, bracket.upper) - bracket.lower;
    const taxInBracket = incomeInBracket * bracket.rate;

    totalTax += taxInBracket;
    breakdown.push({
      income: round(incomeInBracket, 2),
      rate: bracket.rate,
      tax: round(taxInBracket, 2),
    });
    marginalRate = bracket.rate;

    if (income <= bracket.upper) break;
  }

  return { totalTax, breakdown, marginalRate };
}

function formatRate(rate: number): string {
  return `${round(rate * 100, 4)}%`;
}

function round(value: number, decimals: number): number {
  // Binary floating point multiplication (e.g. 28133 * 0.205) can land a
  // hair below the exact decimal value (5767.264999999999 instead of
  // 5767.265). toPrecision cleans up that noise before rounding so
  // exact-decimal tax math doesn't get rounded down by a cent.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
