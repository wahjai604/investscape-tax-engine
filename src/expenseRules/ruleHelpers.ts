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

import type { Jurisdiction, PropertyType } from "../taxTypes";

/** A single keyword-matched classification rule for one jurisdiction's expense list. */
export interface ExpenseRule {
  /** Receives the lowercased expense description. */
  test: (lowerDescription: string) => boolean;
  classification: "deductible" | "capitalized" | "review";
  reason: string;
  ruleCitation: string;
}

const MINOR_REPAIR_QUALIFIERS = [
  "patch",
  "leak",
  "touch-up",
  "touch up",
  "crack",
  "broken",
  "fix",
];

/** Words that mark a "repair" as a small like-for-like fix rather than a de facto replacement. */
export function hasMinorRepairQualifier(description: string): boolean {
  return MINOR_REPAIR_QUALIFIERS.some((qualifier) =>
    description.includes(qualifier)
  );
}

/**
 * Dollar threshold above which an unqualified, bare "repair" (no minor-repair
 * qualifier, no more specific rule match) is presumed to be a de facto
 * replacement and capitalized rather than deducted. Commercial thresholds are
 * set lower than residential, reflecting that commercial building systems are
 * more often capitalized in practice.
 */
export function defaultCapitalizeThreshold(
  jurisdiction: Jurisdiction,
  propertyType: PropertyType
): number {
  if (jurisdiction === "CA") {
    return propertyType === "commercial" ? 1000 : 1500;
  }
  return propertyType === "commercial" ? 2000 : 2500;
}
