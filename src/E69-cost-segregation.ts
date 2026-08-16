/**
 * @license Closed-Source License Keys (InvestScape)
 * @copyright 2026 Lighthouse Research Ltd. DBA InvestScape
 *
 * This module is part of the InvestScape formula engine library.
 * Use is restricted to licensed InvestScape subscribers (S2+).
 * Unauthorized copying, distribution, or use is prohibited.
 *
 * Licensing: https://investscape.com/licensing
 * Contact: licensing@investscape.com
 */

import {
  COST_SEG_FIFTEEN_YEAR_SHARE_AVERAGE,
  COST_SEG_FIFTEEN_YEAR_SHARE_HIGH,
  COST_SEG_FIFTEEN_YEAR_SHARE_LOW,
  COST_SEG_FIVE_YEAR_SHARE_AVERAGE,
  COST_SEG_FIVE_YEAR_SHARE_HIGH,
  COST_SEG_FIVE_YEAR_SHARE_LOW,
  COST_SEG_LTR_BENCHMARK_MEDIAN,
  COST_SEG_STR_BENCHMARK_MEDIAN,
  MACRS_FIFTEEN_YEAR_FIRST_YEAR_RATE,
  MACRS_FIVE_YEAR_FIRST_YEAR_RATE,
} from "./utils/constants";
import type { CostSegregationInput, CostSegregationResult } from "./taxTypes";

const DISCLAIMER =
  "Cost segregation benchmark defaults are national medians from published industry studies, not a substitute for an engineering-based cost segregation study of this specific property. Supply customFiveYearPercent/customFifteenYearPercent from a real study whenever one is available. This calculation is advisory only — consult a qualified cost segregation professional and CPA before relying on it for filing.";

/**
 * E69: Cost Segregation Engine (US only — MACRS accelerated categories have
 * no Canadian CCA equivalent).
 *
 * Reclassifies building cost basis out of straight-line 27.5/39-year
 * depreciation into the 5- and 15-year accelerated categories. No verified
 * benchmark exists for commercial property (only long_term_rental and
 * short_term_rental have a published median), so commercial requires an
 * explicit custom override rather than a guessed default — consistent with
 * this engine's existing convention of throwing rather than fabricating a
 * number (see E47's bracket-lookup behavior).
 */
export function costSegregation(input: CostSegregationInput): CostSegregationResult {
  const { totalBuildingCostBasis, propertyUse, useBenchmarkDefault } = input;

  let fiveYearPercent: number;
  let fifteenYearPercent: number;
  let benchmarkRangeUsed: { low: number; high: number; median: number };
  let usedCustomOverride: boolean;

  if (!useBenchmarkDefault) {
    if (input.customFiveYearPercent == null || input.customFifteenYearPercent == null) {
      throw new Error(
        "customFiveYearPercent and customFifteenYearPercent are required when useBenchmarkDefault is false"
      );
    }
    fiveYearPercent = input.customFiveYearPercent;
    fifteenYearPercent = input.customFifteenYearPercent;
    const totalCustom = round(fiveYearPercent + fifteenYearPercent, 4);
    benchmarkRangeUsed = { low: totalCustom, high: totalCustom, median: totalCustom };
    usedCustomOverride = true;
  } else {
    if (propertyUse === "commercial") {
      throw new Error(
        "No verified commercial cost-segregation benchmark default exists yet; supply customFiveYearPercent/customFifteenYearPercent from a real study (see docs/US-TAX-STRATEGIES-SOURCES.md)."
      );
    }
    const totalMedian =
      propertyUse === "short_term_rental"
        ? COST_SEG_STR_BENCHMARK_MEDIAN
        : COST_SEG_LTR_BENCHMARK_MEDIAN;

    const shareSum = COST_SEG_FIVE_YEAR_SHARE_AVERAGE + COST_SEG_FIFTEEN_YEAR_SHARE_AVERAGE;
    fiveYearPercent = round(totalMedian * (COST_SEG_FIVE_YEAR_SHARE_AVERAGE / shareSum), 4);
    fifteenYearPercent = round(
      totalMedian * (COST_SEG_FIFTEEN_YEAR_SHARE_AVERAGE / shareSum),
      4
    );

    const low = COST_SEG_FIVE_YEAR_SHARE_LOW + COST_SEG_FIFTEEN_YEAR_SHARE_LOW;
    const high = Math.min(1, COST_SEG_FIVE_YEAR_SHARE_HIGH + COST_SEG_FIFTEEN_YEAR_SHARE_HIGH);
    benchmarkRangeUsed = { low, high, median: totalMedian };
    usedCustomOverride = false;
  }

  const fiveYearReclassified = round(totalBuildingCostBasis * fiveYearPercent, 2);
  const fifteenYearReclassified = round(totalBuildingCostBasis * fifteenYearPercent, 2);
  const remainingStraightLine = round(
    totalBuildingCostBasis - fiveYearReclassified - fifteenYearReclassified,
    2
  );

  const firstYearAcceleratedDepreciation = round(
    fiveYearReclassified * MACRS_FIVE_YEAR_FIRST_YEAR_RATE +
      fifteenYearReclassified * MACRS_FIFTEEN_YEAR_FIRST_YEAR_RATE,
    2
  );

  return {
    fiveYearReclassified,
    fifteenYearReclassified,
    remainingStraightLine,
    benchmarkRangeUsed,
    firstYearAcceleratedDepreciation,
    usedCustomOverride,
    jurisdiction: "US",
    calculatedAt: new Date().toISOString(),
    inputs: input,
    disclaimer: DISCLAIMER,
  };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
