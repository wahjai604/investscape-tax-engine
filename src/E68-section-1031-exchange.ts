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
  SECTION_1031_EXCHANGE_DEADLINE_DAYS,
  SECTION_1031_IDENTIFICATION_DEADLINE_DAYS,
} from "./utils/constants";
import { addDaysISO, earlierISODate } from "./utils/dateMath";
import type { Section1031Input, Section1031Result } from "./taxTypes";

const DISCLAIMER =
  "Section 1031 like-kind exchange rules (IRC §1031) depend on strict timing, qualified-intermediary use, and the taxpayer's full facts and circumstances. This calculation is advisory only, does not model reverse or improvement exchanges, and does not constitute tax or legal advice — consult a qualified intermediary and tax professional before relying on it.";

/**
 * E68: Section 1031 Like-Kind Exchange Engine (US only).
 *
 * Computes the two IRC §1031(a)(3) deadlines and the taxable "boot" arising
 * from an incomplete exchange. Boot is modeled as two independent
 * requirements (reinvest all net equity from the relinquished sale; replace
 * at least as much debt as was paid off) rather than allowing extra cash to
 * offset a debt shortfall — a simplification of real IRS practice, documented
 * in docs/US-TAX-STRATEGIES-SOURCES.md. Recognized boot is then characterized
 * as depreciation recapture first, capital gain second, per Treas. Reg.
 * §1.1031(b)-1, so the two deferred amounts are tracked as separate fields.
 */
export function section1031Exchange(input: Section1031Input): Section1031Result {
  const {
    relinquishedSalePrice,
    relinquishedClosingDate,
    relinquishedAdjustedBasis,
    accumulatedDepreciation,
    replacementPropertyPrice,
    relinquishedDebtPayoff,
    replacementDebtAmount,
    taxReturnDueDate,
  } = input;

  const identificationDeadline = addDaysISO(
    relinquishedClosingDate,
    SECTION_1031_IDENTIFICATION_DEADLINE_DAYS
  );
  const exchangeDeadlineBy180Days = addDaysISO(
    relinquishedClosingDate,
    SECTION_1031_EXCHANGE_DEADLINE_DAYS
  );
  const exchangeDeadline = earlierISODate(exchangeDeadlineBy180Days, taxReturnDueDate);

  const netEquityFromRelinquished = round(relinquishedSalePrice - relinquishedDebtPayoff, 2);
  const investorCashIntoReplacement = round(
    replacementPropertyPrice - replacementDebtAmount,
    2
  );

  const equityShortfall = round(
    Math.max(0, netEquityFromRelinquished - investorCashIntoReplacement),
    2
  );
  const debtShortfall = round(Math.max(0, relinquishedDebtPayoff - replacementDebtAmount), 2);
  const bootAmount = round(equityShortfall + debtShortfall, 2);

  const realizedGain = round(relinquishedSalePrice - relinquishedAdjustedBasis, 2);
  const recognizedGain = round(Math.max(0, Math.min(bootAmount, realizedGain)), 2);
  const recognizedDepreciationRecapture = round(
    Math.min(recognizedGain, accumulatedDepreciation),
    2
  );
  const recognizedCapitalGain = round(recognizedGain - recognizedDepreciationRecapture, 2);

  const deferredDepreciationRecapture = round(
    accumulatedDepreciation - recognizedDepreciationRecapture,
    2
  );
  const totalDeferredGain = round(realizedGain - recognizedGain, 2);
  const deferredCapitalGain = round(totalDeferredGain - deferredDepreciationRecapture, 2);

  const issues: string[] = [];
  if (equityShortfall > 0) {
    issues.push(
      `$${equityShortfall.toFixed(2)} of net equity from the relinquished sale was not reinvested into the replacement property — this portion is taxable cash boot.`
    );
  }
  if (debtShortfall > 0) {
    issues.push(
      `Replacement debt of $${replacementDebtAmount.toFixed(2)} is $${debtShortfall.toFixed(2)} short of the $${relinquishedDebtPayoff.toFixed(2)} relinquished debt payoff — this portion is taxable mortgage boot.`
    );
  }
  if (replacementPropertyPrice < relinquishedSalePrice) {
    issues.push(
      `Replacement property price ($${replacementPropertyPrice.toFixed(2)}) is below the relinquished sale price ($${relinquishedSalePrice.toFixed(2)}); full deferral generally requires replacing at equal or greater value.`
    );
  }
  if (exchangeDeadline === taxReturnDueDate && taxReturnDueDate < exchangeDeadlineBy180Days) {
    issues.push(
      "The tax-return due date (including extensions) falls before the 180-day exchange deadline and governs instead."
    );
  }

  return {
    identificationDeadline,
    exchangeDeadline,
    bootAmount,
    equityShortfall,
    debtShortfall,
    realizedGain,
    recognizedGain,
    recognizedDepreciationRecapture,
    recognizedCapitalGain,
    deferredCapitalGain,
    deferredDepreciationRecapture,
    jurisdiction: "US",
    calculatedAt: new Date().toISOString(),
    inputs: input,
    issues,
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
