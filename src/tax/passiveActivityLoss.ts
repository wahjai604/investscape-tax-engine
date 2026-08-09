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

import type {
  PassiveActivityLossHarvestingAnalysis,
  PassiveActivityLossInput,
  PassiveActivityLossOutput,
} from "./taxTypes";

const PAL_DEDUCTION_LIMIT = 25000;
const PHASEOUT_THRESHOLD = 150000;
const DEFAULT_CAPITAL_GAINS_RATE = 0.15;

const DISCLAIMER =
  "Passive Activity Loss rules (IRC §469) are complex and depend on the taxpayer's full facts and circumstances — material participation tests, at-risk rules, and other provisions are not modeled here. This calculation is advisory only; consult a tax professional before relying on it for filing.";

/**
 * E53: Passive Activity Loss (PAL) & Tax Harvesting Engine (US only).
 *
 * Layers on top of E46: E46 computes taxable rental income/loss without PAL
 * limits, and this engine determines how much of a loss is actually
 * deductible this year (capped at $25k, phased out above $150k AGI, and
 * only available at all if the investor materially participates or is a
 * real estate professional) versus suspended for future years.
 *
 * The spec's input has no `year` field (unlike E48/E49's explicit
 * currentYear, which schedule lookups need); PAL has no year-dependent
 * lookup here either, so `year` is the current calendar year, for
 * audit-trail purposes only.
 */
export function passiveActivityLoss(
  input: PassiveActivityLossInput
): PassiveActivityLossOutput {
  const pal_exception_applies =
    input.materially_participates || input.real_estate_professional;
  const pal_deduction_limit = pal_exception_applies ? PAL_DEDUCTION_LIMIT : 0;

  const passiveIncomeLossForYear = input.rentalsFromE46;
  const passiveIncomeOtherSources = input.passiveIncomeOtherSources ?? 0;
  const totalPassiveIncome = round(
    passiveIncomeLossForYear + passiveIncomeOtherSources,
    2
  );

  const agi = input.agiFederal ?? 0;

  let phaseout_reduced_deduction = pal_deduction_limit;
  let phaseoutPercentage = 0;
  if (pal_exception_applies && agi > PHASEOUT_THRESHOLD) {
    const excessIncome = agi - PHASEOUT_THRESHOLD;
    const reduction = Math.min(PAL_DEDUCTION_LIMIT, excessIncome * 0.5);
    phaseout_reduced_deduction = round(
      Math.max(0, PAL_DEDUCTION_LIMIT - reduction),
      2
    );
    phaseoutPercentage = round(reduction / PAL_DEDUCTION_LIMIT, 4);
  }

  let deductiblePassiveLoss = 0;
  let suspendedLossForYear = 0;
  if (totalPassiveIncome < 0) {
    const passiveLossAmount = Math.abs(totalPassiveIncome);
    deductiblePassiveLoss = round(
      Math.min(passiveLossAmount, phaseout_reduced_deduction),
      2
    );
    suspendedLossForYear = round(passiveLossAmount - deductiblePassiveLoss, 2);
  }

  const suspendedLossCarryforward_prior = input.suspendedLossCarryforward ?? 0;
  const suspendedLossCarryforward_current = round(
    suspendedLossCarryforward_prior + suspendedLossForYear,
    2
  );

  const harvestingAnalysis = buildHarvestingAnalysis(
    input,
    suspendedLossCarryforward_current
  );

  return {
    pal_exception_applies,
    pal_deduction_limit,
    passiveIncomeLossForYear,
    passiveIncomeOtherSources,
    totalPassiveIncome,
    agi,
    phaseoutThreshold: PHASEOUT_THRESHOLD,
    phaseoutPercentage,
    phaseout_reduced_deduction,
    deductiblePassiveLoss,
    suspendedLossForYear,
    suspendedLossCarryforward_prior,
    suspendedLossCarryforward_current,
    harvestingAnalysis,
    jurisdiction: input.jurisdiction,
    year: new Date().getFullYear(),
    calculated_at: new Date().toISOString(),
    inputs: input,
    disclaimer: DISCLAIMER,
  };
}

function buildHarvestingAnalysis(
  input: PassiveActivityLossInput,
  suspendedLossCarryforward_current: number
): PassiveActivityLossHarvestingAnalysis | undefined {
  if (!input.propertiesForSaleThisYear || input.propertiesForSaleThisYear.length === 0) {
    return undefined;
  }

  const totalRealizedGains = round(
    input.propertiesForSaleThisYear.reduce((sum, property) => sum + property.realizedGain, 0),
    2
  );
  const suspendedLossAvailableToUse = round(
    Math.min(suspendedLossCarryforward_current, totalRealizedGains),
    2
  );

  const rate = input.capitalGainsTaxRate ?? DEFAULT_CAPITAL_GAINS_RATE;
  const capitalGainsTax_ifNotHarvest = round(totalRealizedGains * rate, 2);
  const taxableGainsAfterHarvest = Math.max(
    0,
    totalRealizedGains - suspendedLossAvailableToUse
  );
  const capitalGainsTax_ifHarvest = round(taxableGainsAfterHarvest * rate, 2);
  const taxSavingFromHarvest = round(
    capitalGainsTax_ifNotHarvest - capitalGainsTax_ifHarvest,
    2
  );
  const netProceedsAfterHarvest = round(
    totalRealizedGains - capitalGainsTax_ifHarvest,
    2
  );

  return {
    propertiesSuggested: input.propertiesForSaleThisYear.map((property) => property.description),
    suspendedLossAvailableToUse,
    capitalGainsTax_ifHarvest,
    capitalGainsTax_ifNotHarvest,
    taxSavingFromHarvest,
    netProceedsAfterHarvest,
  };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
