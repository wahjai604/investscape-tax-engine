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

/**
 * Named constants for the US Tax Strategies engines (E68-E70: Section 1031
 * Exchange, Cost Segregation, Opportunity Zones). Every sourced figure here
 * is documented, with citations, in docs/US-TAX-STRATEGIES-SOURCES.md — this
 * file holds only the values, not the rationale.
 */

// ---------------------------------------------------------------------------
// E68: Section 1031 Like-Kind Exchange
// ---------------------------------------------------------------------------

/** IRC §1031(a)(3)(A) — calendar days from relinquished-property closing, no weekend/holiday extension. */
export const SECTION_1031_IDENTIFICATION_DEADLINE_DAYS = 45;
/** IRC §1031(a)(3)(B) — calendar days from relinquished-property closing, runs concurrently with the 45-day clock. */
export const SECTION_1031_EXCHANGE_DEADLINE_DAYS = 180;

// ---------------------------------------------------------------------------
// E69: Cost Segregation
// ---------------------------------------------------------------------------

/** Median % of building cost basis reclassified into accelerated (5/7/15-yr) categories — unfurnished long-term rental, single-family. */
export const COST_SEG_LTR_BENCHMARK_MEDIAN = 0.176;
/** Median % of building cost basis reclassified into accelerated categories — short-term rental. */
export const COST_SEG_STR_BENCHMARK_MEDIAN = 0.304;

/** Average share of building cost basis allocated to the 5-year MACRS category, across studies. */
export const COST_SEG_FIVE_YEAR_SHARE_AVERAGE = 0.163;
export const COST_SEG_FIVE_YEAR_SHARE_LOW = 0.05;
export const COST_SEG_FIVE_YEAR_SHARE_HIGH = 0.33;

/** Average share of building cost basis allocated to the 15-year MACRS category, across studies. */
export const COST_SEG_FIFTEEN_YEAR_SHARE_AVERAGE = 0.114;
export const COST_SEG_FIFTEEN_YEAR_SHARE_LOW = 0.0;
export const COST_SEG_FIFTEEN_YEAR_SHARE_HIGH = 0.68;

/** IRS Pub 946 MACRS half-year-convention, 200% declining-balance, first-year rate for 5-year property. */
export const MACRS_FIVE_YEAR_FIRST_YEAR_RATE = 0.2;
/** IRS Pub 946 MACRS half-year-convention, 150% declining-balance, first-year rate for 15-year property. */
export const MACRS_FIFTEEN_YEAR_FIRST_YEAR_RATE = 0.05;

// ---------------------------------------------------------------------------
// E70: Opportunity Zones
// ---------------------------------------------------------------------------

/** OZ 1.0 (legacy, pre-2027 investments): fixed gain-recognition deadline regardless of investment date. */
export const OZ_LEGACY_DEADLINE = "2026-12-31";
/** OZ 2.0 (permanent, post-OBBBA): rolling deferral window measured from the investment date. */
export const OZ_ROLLING_DEFERRAL_YEARS = 5;

export const OZ_STANDARD_STEPUP = 0.1;
export const OZ_RURAL_STEPUP = 0.3;

export const OZ_STANDARD_IMPROVEMENT_THRESHOLD = 1.0;
export const OZ_RURAL_IMPROVEMENT_THRESHOLD = 0.5;
