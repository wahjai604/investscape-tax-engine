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

import type { CanadianProvince, TaxBracket } from "../taxTypes";

interface CanadianBracketYear {
  federal: TaxBracket[];
  /**
   * Only provinces with verified bracket data are present here. AB, SK, MB,
   * QC, NB, NS, PE, NL, NT, YT, NU are intentionally omitted pending
   * verified rate data — personalIncomeTax() throws rather than guessing.
   */
  provincial: Partial<Record<CanadianProvince, TaxBracket[]>>;
}

export const canadianBrackets: Record<number, CanadianBracketYear> = {
  2026: {
    federal: [
      { lower: 0, upper: 55867, rate: 0.15 },
      { lower: 55867, upper: 111733, rate: 0.205 },
      { lower: 111733, upper: 173205, rate: 0.26 },
      { lower: 173205, upper: 246752, rate: 0.29 },
      { lower: 246752, upper: Infinity, rate: 0.33 },
    ],
    provincial: {
      BC: [
        { lower: 0, upper: 47937, rate: 0.0506 },
        { lower: 47937, upper: 95875, rate: 0.077 },
        { lower: 95875, upper: 110076, rate: 0.105 },
        { lower: 110076, upper: 133664, rate: 0.1229 },
        { lower: 133664, upper: 181232, rate: 0.1429 },
        { lower: 181232, upper: 252752, rate: 0.168 },
        { lower: 252752, upper: Infinity, rate: 0.2006 },
      ],
      ON: [
        { lower: 0, upper: 51446, rate: 0.0505 },
        { lower: 51446, upper: 102894, rate: 0.0915 },
        { lower: 102894, upper: 150000, rate: 0.1116 },
        { lower: 150000, upper: 220708, rate: 0.1216 },
        { lower: 220708, upper: Infinity, rate: 0.1316 },
      ],
    },
  },
};
