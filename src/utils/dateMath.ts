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
 * Adds `days` calendar days to an ISO "YYYY-MM-DD" date, with no business-day
 * or holiday adjustment — several IRC deadlines (e.g. the 1031 45-day
 * identification window) run on calendar days and are NOT extended when they
 * land on a weekend or holiday, so this must never shift the result.
 */
export function addDaysISO(dateISO: string, days: number): string {
  const [year, month, day] = parseISODate(dateISO);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return formatISODate(result);
}

/** Adds `years` calendar years to an ISO "YYYY-MM-DD" date (UTC, no DST drift). */
export function addYearsISO(dateISO: string, years: number): string {
  const [year, month, day] = parseISODate(dateISO);
  const result = new Date(Date.UTC(year + years, month - 1, day));
  return formatISODate(result);
}

/** Returns the earlier of two ISO "YYYY-MM-DD" dates (lexicographic order matches chronological order). */
export function earlierISODate(a: string, b: string): string {
  return a <= b ? a : b;
}

function parseISODate(dateISO: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!match) {
    throw new Error(`Invalid ISO date '${dateISO}'; expected YYYY-MM-DD`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function formatISODate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
