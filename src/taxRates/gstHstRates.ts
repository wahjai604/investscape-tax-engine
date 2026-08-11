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

import type { GstHstProvince } from "../taxTypes";

/** 2026 combined GST/HST/QST rates by province. */
export const GST_HST_RATES: Record<GstHstProvince, number> = {
  BC: 0.05, // GST only
  AB: 0.05, // GST only
  SK: 0.05, // GST only
  MB: 0.05, // GST only
  ON: 0.13, // HST (5% GST + 8% PST)
  QC: 0.14975, // 5% GST + 9.975% QST
  NB: 0.15, // HST (5% GST + 10% PST)
  NS: 0.15, // HST (5% GST + 10% PST)
  PE: 0.15, // HST (5% GST + 10% PST)
  NL: 0.15, // HST (5% GST + 10% PST)
};

const HST_PROVINCES: ReadonlySet<GstHstProvince> = new Set(["ON", "NB", "NS", "PE", "NL"]);

/** Label for the tax type levied in a given province, for explanation text. */
export function gstHstLabel(province: GstHstProvince): string {
  if (province === "QC") return "GST+QST";
  if (HST_PROVINCES.has(province)) return "HST";
  return "GST";
}
