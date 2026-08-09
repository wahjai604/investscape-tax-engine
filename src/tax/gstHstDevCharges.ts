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

import { GST_HST_RATES, gstHstLabel } from "./taxRates/gstHstRates";
import { resolveDevChargeRatePerUnit } from "./devCharges/devChargeRates";
import type { GstHstDevChargesInput, GstHstDevChargesOutput } from "./taxTypes";

/**
 * E52: GST/HST & Development Charges Engine (Canada-only).
 *
 * GST/HST is charged on construction costs at the province's combined rate;
 * a GST/HST-registered developer claims 100% of it back as an Input Tax
 * Credit (net owing $0), while an unregistered developer cannot claim any
 * ITC (the full charge is a real project cost). Development charges are a
 * flat per-unit municipal fee that's never recoverable either way.
 *
 * `netGstHstOwing`/`totalGstHstCost` and `totalDevCharges`/`totalDevChargesCost`
 * are the same figures under two names because the spec's output interface
 * separates "the calculation" from "what E51 should add to project costs" —
 * they happen to be identical here since there's no other GST/HST or dev-
 * charge adjustment in this simple model, but keeping both names makes the
 * E51 hand-off explicit rather than implicit.
 */
export function gstHstDevCharges(input: GstHstDevChargesInput): GstHstDevChargesOutput {
  const gstHstRate = GST_HST_RATES[input.province];
  const gstHstChargedOnCosts = round(input.constructionCosts * gstHstRate, 2);

  const inputTaxCreditsRecoverable = input.gstHstRegistered ? gstHstChargedOnCosts : 0;
  const netGstHstOwing = round(gstHstChargedOnCosts - inputTaxCreditsRecoverable, 2);

  const devChargeRatePerUnit =
    input.devChargeRatePerUnit ??
    resolveDevChargeRatePerUnit(input.province, input.unitType, input.municipality);
  const totalDevCharges = round(input.unitCount * devChargeRatePerUnit, 2);

  const totalGstHstCost = netGstHstOwing;
  const totalDevChargesCost = totalDevCharges;
  const combinedCost = round(totalGstHstCost + totalDevChargesCost, 2);

  const registrationNote = input.gstHstRegistered
    ? "fully recoverable as ITCs (developer registered)"
    : "not recoverable — developer is not registered for GST/HST";
  const gstHstExplanation =
    `${input.province} ${gstHstLabel(input.province)} ${round(gstHstRate * 100, 3)}% on ` +
    `$${input.constructionCosts.toLocaleString()} construction = $${gstHstChargedOnCosts.toLocaleString()}; ` +
    registrationNote;

  const devChargeExplanation =
    `${input.municipality ?? input.province}: $${devChargeRatePerUnit.toLocaleString()}/unit × ` +
    `${input.unitCount} units = $${totalDevCharges.toLocaleString()}`;

  return {
    gstHstRate,
    gstHstChargedOnCosts,
    inputTaxCreditsRecoverable,
    netGstHstOwing,
    devChargeRatePerUnit,
    unitCount: input.unitCount,
    totalDevCharges,
    totalGstHstCost,
    totalDevChargesCost,
    combinedCost,
    jurisdiction: "CA",
    province: input.province,
    gstHstRegistered: input.gstHstRegistered,
    year: new Date().getFullYear(),
    calculatedAt: new Date().toISOString(),
    inputs: input,
    gstHstExplanation,
    devChargeExplanation,
  };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
