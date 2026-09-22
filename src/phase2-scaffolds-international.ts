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

/**
 * PHASE 2 — INTERFACES ONLY. Nothing in this file is implemented.
 *
 * Not E-numbered, matching this engine family's convention (see
 * investscape-docs Doc 63 §1 and Doc 64 §1): unimplemented Phase 2
 * contracts don't get an E-number until they're actually implemented.
 *
 * "Do NOT implement a pseudo-forecasting algorithm merely to fill the
 * interface. Stop at typed interfaces + documentation unless explicitly
 * instructed otherwise." — followed literally below, for every function
 * in this file.
 *
 * calculateCrossBorderWithholding used to live here (Canada <-> US
 * withholding — FIRPTA / Section 116 / Part XIII / §871(d)) but has since
 * been built for real; see E83-cross-border-withholding.ts. It was smaller
 * in surface area and not blocked on any go-to-market decision, unlike the
 * two functions remaining below:
 *
 * - calculateUKPropertyTax and calculateAustraliaPropertyTax are a
 *   materially bigger lift: entirely new jurisdictions this codebase has
 *   never modeled (new tax regimes, new currencies, new property-tax
 *   conventions — see UKPropertyTaxRequest/AustraliaPropertyTaxRequest
 *   below for how different their shapes already are from the CA/US
 *   model). These are blocked on a go-to-market decision (does InvestScape
 *   actually expand into UK/Australia) as much as on engineering time —
 *   do not treat them as "the same kind of gap, just two more countries."
 */

export interface UKPropertyTaxRequest {
  country: "England" | "Wales" | "Scotland" | "Northern Ireland";
  purchasePrice: number;
  isBuyToLet: boolean;
  annualMortgageInterest: number;
  landlordMarginalTaxRate: number;
}

export interface UKPropertyTaxResult {
  transferTax: number;
  section24CreditValue: number;
  effectiveTaxCostOfLeverage: number;
  issues: string[];
}

export interface AustraliaPropertyTaxRequest {
  purchaseDate: string;
  state: string;
  isEstablishedHome: boolean;
  purchasePrice: number;
}

export interface AustraliaPropertyTaxResult {
  regime: "pre_2027_transition" | "post_2027_transition";
  negativeGearingEligible: boolean;
  cgtTreatment: "flat_50_discount" | "indexed_with_30pct_minimum";
  stampDuty: number;
  issues: string[];
}

/**
 * Not implemented — blocked on a go-to-market decision (UK expansion),
 * not just unbuilt (see file header).
 */
export function calculateUKPropertyTax(_r: UKPropertyTaxRequest): UKPropertyTaxResult {
  throw new Error(
    "Phase 2 not implemented - market decision pending. See International Engine Master Spec."
  );
}

/**
 * Not implemented — blocked on a go-to-market decision (Australia
 * expansion), not just unbuilt (see file header).
 */
export function calculateAustraliaPropertyTax(
  _r: AustraliaPropertyTaxRequest
): AustraliaPropertyTaxResult {
  throw new Error(
    "Phase 2 not implemented - market decision pending. See International Engine Master Spec."
  );
}
