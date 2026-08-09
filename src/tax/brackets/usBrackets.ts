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

import type { FilingStatus, TaxBracket } from "../taxTypes";

interface UsBracketYear {
  federal: Record<FilingStatus, TaxBracket[]>;
  /**
   * `null` means the state has no personal income tax (a verified fact, not
   * missing data). A state absent from this map entirely means its bracket
   * data has not been loaded yet — personalIncomeTax() throws rather than
   * guessing. Only AZ and CA carry populated bracket data so far; the
   * remaining ~40 taxing states are intentionally omitted pending verified
   * rate data.
   */
  state: Partial<Record<string, TaxBracket[] | null>>;
}

export const usBrackets: Record<number, UsBracketYear> = {
  2026: {
    federal: {
      single: [
        { lower: 0, upper: 11600, rate: 0.1 },
        { lower: 11600, upper: 47150, rate: 0.12 },
        { lower: 47150, upper: 100525, rate: 0.22 },
        { lower: 100525, upper: 191950, rate: 0.24 },
        { lower: 191950, upper: 243725, rate: 0.32 },
        { lower: 243725, upper: 609350, rate: 0.35 },
        { lower: 609350, upper: Infinity, rate: 0.37 },
      ],
      married: [
        { lower: 0, upper: 23200, rate: 0.1 },
        { lower: 23200, upper: 94300, rate: 0.12 },
        { lower: 94300, upper: 201050, rate: 0.22 },
        { lower: 201050, upper: 383900, rate: 0.24 },
        { lower: 383900, upper: 487450, rate: 0.32 },
        { lower: 487450, upper: 731200, rate: 0.35 },
        { lower: 731200, upper: Infinity, rate: 0.37 },
      ],
      head_of_household: [
        { lower: 0, upper: 17400, rate: 0.1 },
        { lower: 17400, upper: 66550, rate: 0.12 },
        { lower: 66550, upper: 100525, rate: 0.22 },
        { lower: 100525, upper: 191950, rate: 0.24 },
        { lower: 191950, upper: 243700, rate: 0.32 },
        { lower: 243700, upper: 609350, rate: 0.35 },
        { lower: 609350, upper: Infinity, rate: 0.37 },
      ],
    },
    state: {
      // Simplified two-bracket approximation, as given in the E47 spec's
      // worked example. Not verified against real 2026 Arizona law (Arizona
      // has used a flat rate since 2023) and not filing-status-specific.
      AZ: [
        { lower: 0, upper: 82100, rate: 0.0255 },
        { lower: 82100, upper: Infinity, rate: 0.0355 },
      ],
      CA: [
        { lower: 0, upper: 10099, rate: 0.01 },
        { lower: 10099, upper: 23942, rate: 0.02 },
        { lower: 23942, upper: 37788, rate: 0.04 },
        { lower: 37788, upper: 52455, rate: 0.06 },
        { lower: 52455, upper: 66295, rate: 0.08 },
        { lower: 66295, upper: 340328, rate: 0.093 },
        { lower: 340328, upper: 408393, rate: 0.103 },
        { lower: 408393, upper: 680656, rate: 0.113 },
        { lower: 680656, upper: Infinity, rate: 0.123 },
      ],
      AK: null,
      FL: null,
      NV: null,
      SD: null,
      TN: null,
      TX: null,
      WA: null,
      WY: null,
    },
  },
};
