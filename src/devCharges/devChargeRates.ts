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

import type { GstHstProvince, PropertyType } from "../taxTypes";

interface DevChargeRatePair {
  residential: number;
  commercial: number;
}

/**
 * Municipality-specific 2026 estimates, taken as the midpoint of each named
 * city's range in the spec. Keyed lowercase; looked up case-insensitively.
 */
const MUNICIPALITY_RATES: Record<string, DevChargeRatePair> = {
  toronto: { residential: 13750, commercial: 8750 },
  vancouver: { residential: 25000, commercial: 12500 },
  calgary: { residential: 7500, commercial: 4500 },
  edmonton: { residential: 5500, commercial: 3500 },
  montreal: { residential: 5500, commercial: 3500 },
  winnipeg: { residential: 3500, commercial: 2000 },
};

/**
 * Province-level fallback, used when no municipality is given or the given
 * municipality has no entry above. Derived from the spec's "Other"/regional
 * ranges (AB is the average of its two named cities; QC/MB reuse their only
 * named city since no other QC/MB figure is given in the spec; NB/PE/NL
 * reuse the spec's combined "Atlantic (avg)" figure alongside NS).
 *
 * SK has no data point anywhere in the spec, so it's intentionally omitted —
 * callers must pass `devChargeRatePerUnit` explicitly for SK, per this
 * engine's policy of never guessing at unverified rate data (see
 * personalIncomeTax.ts's bracket tables for the same policy).
 */
const PROVINCE_DEFAULT_RATES: Partial<Record<GstHstProvince, DevChargeRatePair>> = {
  ON: { residential: 10000, commercial: 6500 },
  BC: { residential: 10000, commercial: 5500 },
  AB: { residential: 6000, commercial: 4000 },
  QC: { residential: 5500, commercial: 3500 },
  MB: { residential: 3500, commercial: 2000 },
  NB: { residential: 4500, commercial: 2500 },
  NS: { residential: 4500, commercial: 2500 },
  PE: { residential: 4500, commercial: 2500 },
  NL: { residential: 4500, commercial: 2500 },
};

/** Resolves a per-unit dev charge rate when the caller doesn't supply one directly. */
export function resolveDevChargeRatePerUnit(
  province: GstHstProvince,
  unitType: PropertyType,
  municipality: string | undefined
): number {
  const municipalityKey = municipality?.trim().toLowerCase();
  const rates =
    (municipalityKey ? MUNICIPALITY_RATES[municipalityKey] : undefined) ??
    PROVINCE_DEFAULT_RATES[province];

  if (!rates) {
    throw new Error(
      `No verified development charge default for province '${province}'` +
        (municipality ? ` / municipality '${municipality}'` : "") +
        ". Pass devChargeRatePerUnit explicitly."
    );
  }

  return rates[unitType];
}
