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

import { canadianRules } from "./expenseRules/canadianRules";
import { usRules } from "./expenseRules/usRules";
import { defaultCapitalizeThreshold, hasMinorRepairQualifier } from "./expenseRules/ruleHelpers";
import type {
  CapitalizedGuidance,
  ExpenseClassification,
  Jurisdiction,
  OperatingExpenseInput,
  OperatingExpenseLineItem,
  OperatingExpenseLineItemResult,
  OperatingExpenseOutput,
  PropertyType,
} from "./taxTypes";

const DISCLAIMER =
  "This classification is advisory only and does not constitute tax, legal, or accounting advice. Consult a qualified tax professional for a final determination before filing.";

interface ClassificationResult {
  classification: ExpenseClassification;
  reason: string;
  ruleCitation: string;
}

/**
 * E50: Operating Expense Deduction Engine.
 *
 * Classifies each rental expense line item as deductible (current period) or
 * capitalized (depreciated over time, see E48) using CRA Folio S4-F2-C1 (CA)
 * or IRS Pub 527 / IRC §162(a) (US) keyword rules. Anything the rule tables
 * can't confidently resolve — an unqualified bare "repair" whose amount lands
 * on the wrong side of the capitalization threshold, or an inherently
 * ambiguous item like exterior painting or unscoped landscaping — is flagged
 * "review" rather than force-classified, per the spec's own guidance that
 * ambiguous items should not be auto-classified.
 *
 * "review" items contribute to `totalExpenses` but are deliberately excluded
 * from `totalDeductible`/`totalCapitalized` (their per-item deductibleAmount
 * and capitalizedAmount are both 0, not null — the output type declares
 * these as `number`, and 0-pending-review keeps that contract intact rather
 * than smuggling in a null the type doesn't allow). The spec's own worked
 * examples hand-total a "review" case's deductible sum incorrectly (off by
 * exactly the review item's untouched amount, e.g. its Example 1 sums to
 * 6,300 but states 6,400); this engine's totals are computed by summing the
 * per-item deductibleAmount/capitalizedAmount fields, so they're internally
 * consistent even where the prompt's hand arithmetic was not.
 *
 * `province` is accepted and echoed for interface completeness, but no
 * province-specific expense thresholds are currently verified, so it does
 * not affect classification.
 */
export function operatingExpense(input: OperatingExpenseInput): OperatingExpenseOutput {
  const propertyType: PropertyType = input.propertyType ?? "residential";
  const jurisdiction = input.jurisdiction;

  const expenses: OperatingExpenseLineItemResult[] = input.expenses.map((item) =>
    classifyLineItem(item, jurisdiction, propertyType, input.autoCapitalizeThreshold)
  );

  const totalExpenses = round(
    input.expenses.reduce((sum, item) => sum + item.amount, 0),
    2
  );
  const totalDeductible = round(
    expenses.reduce((sum, item) => sum + item.deductibleAmount, 0),
    2
  );
  const totalCapitalized = round(
    expenses.reduce((sum, item) => sum + item.capitalizedAmount, 0),
    2
  );

  const capitalizedGuidance: CapitalizedGuidance[] = expenses
    .filter((item) => item.classification === "capitalized" || item.classification === "mixed")
    .map((item) => buildCapitalizedGuidance(item.description, jurisdiction, propertyType));

  return {
    expenses,
    totalExpenses,
    totalDeductible,
    totalCapitalized,
    capitalizedGuidance,
    jurisdiction,
    propertyType,
    disclaimer: DISCLAIMER,
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function classifyLineItem(
  item: OperatingExpenseLineItem,
  jurisdiction: Jurisdiction,
  propertyType: PropertyType,
  autoCapitalizeThreshold: number | undefined
): OperatingExpenseLineItemResult {
  const { classification, reason, ruleCitation } = classifyExpense(
    item,
    jurisdiction,
    propertyType,
    autoCapitalizeThreshold
  );

  const deductibleAmount = classification === "deductible" ? round(item.amount, 2) : 0;
  const capitalizedAmount = classification === "capitalized" ? round(item.amount, 2) : 0;

  return {
    description: item.description,
    amount: item.amount,
    classification,
    reason,
    deductibleAmount,
    capitalizedAmount,
    jurisdiction,
    ruleCitation,
  };
}

function classifyExpense(
  item: OperatingExpenseLineItem,
  jurisdiction: Jurisdiction,
  propertyType: PropertyType,
  autoCapitalizeThreshold: number | undefined
): ClassificationResult {
  const lowerDescription = item.description.toLowerCase();
  const rules = jurisdiction === "CA" ? canadianRules : usRules;

  for (const rule of rules) {
    if (rule.test(lowerDescription)) {
      return rule;
    }
  }

  const genericCitation =
    jurisdiction === "CA"
      ? "CRA Folio S4-F2-C1, repair vs. improvement test"
      : "IRS Pub 527 §3.02, repair vs. improvement test";

  if (lowerDescription.includes("repair")) {
    if (hasMinorRepairQualifier(lowerDescription)) {
      return {
        classification: "deductible",
        reason:
          "Repair qualified as a minor, like-for-like fix (patch/leak/crack-type language); restores the property to its former condition. Fully deductible.",
        ruleCitation: genericCitation,
      };
    }

    const threshold =
      autoCapitalizeThreshold ?? defaultCapitalizeThreshold(jurisdiction, propertyType);
    if (item.amount > threshold) {
      return {
        classification: "capitalized",
        reason: `Unqualified repair costing more than the $${threshold.toLocaleString()} comfort threshold with no indication of a minor fix; presumed to be a de facto replacement/improvement. Capitalized pending confirmation.`,
        ruleCitation: genericCitation,
      };
    }

    return {
      classification: "deductible",
      reason: `Repair cost is within the $${threshold.toLocaleString()} comfort threshold; presumed to be routine. Fully deductible.`,
      ruleCitation: genericCitation,
    };
  }

  if (
    lowerDescription.includes("new ") ||
    lowerDescription.includes("replacement") ||
    lowerDescription.includes("replaced")
  ) {
    return {
      classification: "capitalized",
      reason:
        "Description indicates a new installation or replacement rather than a repair; treated as a capital improvement absent contrary detail.",
      ruleCitation: genericCitation,
    };
  }

  return {
    classification: "review",
    reason:
      "Description doesn't match a known repair or improvement pattern with enough confidence to auto-classify. Flagged for manual review.",
    ruleCitation: genericCitation,
  };
}

function buildCapitalizedGuidance(
  description: string,
  jurisdiction: Jurisdiction,
  propertyType: PropertyType
): CapitalizedGuidance {
  const isAppliance = /appliance|fridge|refrigerator|dishwasher|stove|oven|counter|countertop/i.test(
    description
  );
  const assetClass = isAppliance ? "Appliance/Equipment" : "Building improvement";

  if (jurisdiction === "CA") {
    return {
      assetClass,
      recoveryPeriod: isAppliance
        ? "CCA Class 8 @ 20% declining-balance (~5yr)"
        : "CCA Class 1 @ 4% declining-balance (~25yr)",
    };
  }

  return {
    assetClass,
    recoveryPeriod: isAppliance
      ? "5-year MACRS"
      : propertyType === "commercial"
      ? "39-year straight-line (MACRS)"
      : "27.5-year straight-line (MACRS)",
  };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
