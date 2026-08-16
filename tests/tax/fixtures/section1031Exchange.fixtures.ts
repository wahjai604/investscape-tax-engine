import type { Section1031Input } from "../../../src/taxTypes";

const BASE: Section1031Input = {
  jurisdiction: "US",
  relinquishedSalePrice: 500000,
  relinquishedClosingDate: "2026-01-07",
  relinquishedAdjustedBasis: 250000,
  accumulatedDepreciation: 80000,
  replacementPropertyPrice: 500000,
  relinquishedDebtPayoff: 300000,
  replacementDebtAmount: 300000,
  taxReturnDueDate: "2027-04-15",
};

/** relinquishedClosingDate + 45 days lands on Saturday 2026-02-21; deadline must NOT shift. */
export const weekendHolidayDeadline: Section1031Input = { ...BASE };

/** taxReturnDueDate (2026-04-15) is earlier than closingDate + 180 days (2026-07-06), so it caps the exchange deadline. */
export const taxFilingDeadlineCapsExchangeWindow: Section1031Input = {
  ...BASE,
  taxReturnDueDate: "2026-04-15",
};

/** Debt fully replaced (no debt shortfall), but investor pulls cash out — boot from equity shortfall only. */
export const equityShortfallBootOnly: Section1031Input = {
  ...BASE,
  replacementDebtAmount: 200000,
  relinquishedDebtPayoff: 200000,
  replacementPropertyPrice: 400000,
};

/** Equity fully reinvested and value requirement met, but replacement debt is reduced — boot from debt shortfall only. */
export const debtShortfallBootOnly: Section1031Input = {
  ...BASE,
  relinquishedDebtPayoff: 300000,
  replacementDebtAmount: 100000,
  replacementPropertyPrice: 600000,
};

/** Both net equity fully reinvested and debt fully replaced — zero boot, full deferral. */
export const fullDeferralNoBoot: Section1031Input = { ...BASE };
