import type { MortgageInterestInput } from "../../../src/tax/taxTypes";

export const canadaYear1Monthly: MortgageInterestInput = {
  jurisdiction: "CA",
  loanAmount: 360000,
  annualRate: 0.055,
  amortizationYears: 25,
  originationYear: 2026,
  currentYear: 2026,
  paymentFrequency: "monthly",
};

export const usYear1Monthly: MortgageInterestInput = {
  jurisdiction: "US",
  loanAmount: 240000,
  annualRate: 0.06,
  amortizationYears: 30,
  originationYear: 2026,
  currentYear: 2026,
  paymentFrequency: "monthly",
};

export const usYear25NearEnd: MortgageInterestInput = {
  jurisdiction: "US",
  loanAmount: 240000,
  annualRate: 0.06,
  amortizationYears: 30,
  originationYear: 2001,
  currentYear: 2026,
  priorYearEndingBalance: 18205,
  paymentFrequency: "monthly",
};

export const usLoanPaidOff: MortgageInterestInput = {
  jurisdiction: "US",
  loanAmount: 240000,
  annualRate: 0.06,
  amortizationYears: 30,
  originationYear: 2001,
  currentYear: 2026,
  priorYearEndingBalance: 0,
};

export const canadaYear1Annual: MortgageInterestInput = {
  jurisdiction: "CA",
  loanAmount: 360000,
  annualRate: 0.055,
  amortizationYears: 25,
  originationYear: 2026,
  currentYear: 2026,
  paymentFrequency: "annual",
};

export const usZeroInterestRate: MortgageInterestInput = {
  jurisdiction: "US",
  loanAmount: 100000,
  annualRate: 0.0,
  amortizationYears: 10,
  originationYear: 2026,
  currentYear: 2026,
};
