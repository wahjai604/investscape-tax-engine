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

import type { MortgageInterestInput, MortgageInterestOutput } from "./taxTypes";

const PERIODS_PER_YEAR: Record<NonNullable<MortgageInterestInput["paymentFrequency"]>, number> = {
  monthly: 12,
  "semi-annual": 2,
  annual: 1,
};

/**
 * E49: Mortgage Interest Deduction Engine.
 *
 * Splits each year's mortgage payment into deductible interest and
 * non-deductible principal by running a period-by-period amortization
 * schedule for the year, using a payment amount fixed at loan origination
 * (the same figure every year of the loan, per the given multi-year test
 * fixtures) applied against whatever balance carries in from the prior year.
 *
 * Canada: mortgages compound semi-annually, not monthly. The period rate
 * used for both the payment formula and the amortization loop is derived
 * from the semi-annual-compounded effective annual rate — not the plain
 * nominal-rate/12 used by US loans — so it stays consistent with the
 * `effectiveAnnualRate` this function reports and with how Canadian
 * mortgages actually amortize.
 *
 * US: standard nominal-rate/(periods per year) convention.
 *
 * SALT-cap constraints on deductibility are applied downstream (E50/E53);
 * this engine reports the full interest amount as deductible.
 *
 * Single-year calculator: multi-year holds are computed by calling once
 * per year, threading balance forward via `priorYearEndingBalance`.
 */
export function mortgageInterest(
  input: MortgageInterestInput
): MortgageInterestOutput {
  const paymentFrequency = input.paymentFrequency ?? "monthly";
  const periodsPerYear = PERIODS_PER_YEAR[paymentFrequency];

  const isOriginationYear = input.currentYear === input.originationYear;
  if (!isOriginationYear && input.priorYearEndingBalance === undefined) {
    throw new Error(
      "priorYearEndingBalance is required for a year after loan origination"
    );
  }
  const beginningBalance = isOriginationYear
    ? input.loanAmount
    : input.priorYearEndingBalance!;

  const effectiveAnnualRate =
    input.jurisdiction === "CA"
      ? Math.pow(1 + input.annualRate / 2, 2) - 1
      : input.annualRate;

  const periodRate =
    input.jurisdiction === "CA"
      ? Math.pow(1 + effectiveAnnualRate, 1 / periodsPerYear) - 1
      : input.annualRate / periodsPerYear;

  const totalPeriods = input.amortizationYears * periodsPerYear;
  const periodPayment = calculatePeriodPayment(
    input.loanAmount,
    periodRate,
    totalPeriods
  );

  const { annualInterest, annualPrincipal, endingBalance } =
    beginningBalance <= 0
      ? { annualInterest: 0, annualPrincipal: 0, endingBalance: 0 }
      : amortizeYear(beginningBalance, periodRate, periodPayment, periodsPerYear);

  const totalMonthsOfLoan = input.amortizationYears * 12;
  const monthsElapsed = (input.currentYear - input.originationYear) * 12;
  // If the loan is already paid off, no months remain regardless of the
  // original schedule (it may have been paid down faster than scheduled).
  const monthsRemaining =
    beginningBalance <= 0
      ? 0
      : Math.max(0, totalMonthsOfLoan - monthsElapsed);

  return {
    annualPayment: round(annualInterest + annualPrincipal, 2),
    annualInterest: round(annualInterest, 2),
    annualPrincipal: round(annualPrincipal, 2),
    beginningBalance: round(beginningBalance, 2),
    endingBalance: round(endingBalance, 2),
    effectiveAnnualRate,
    loanAmount: input.loanAmount,
    amortizationYears: input.amortizationYears,
    monthsRemaining,
    deductibleInterest: round(annualInterest, 2),
    nonDeductibleInterest: 0,
    jurisdiction: input.jurisdiction,
    year: input.currentYear,
    calculatedAt: new Date().toISOString(),
    inputs: input,
  };
}

function calculatePeriodPayment(
  loanAmount: number,
  periodRate: number,
  totalPeriods: number
): number {
  if (periodRate === 0) {
    return loanAmount / totalPeriods;
  }
  const growth = Math.pow(1 + periodRate, totalPeriods);
  return (loanAmount * periodRate * growth) / (growth - 1);
}

function amortizeYear(
  beginningBalance: number,
  periodRate: number,
  periodPayment: number,
  periodsInYear: number
): { annualInterest: number; annualPrincipal: number; endingBalance: number } {
  let balance = beginningBalance;
  let annualInterest = 0;
  let annualPrincipal = 0;

  for (let period = 0; period < periodsInYear; period++) {
    if (balance <= 0) break;

    const interestThisPeriod = balance * periodRate;
    // Don't let the final payment overpay the remaining balance.
    const principalThisPeriod = Math.min(
      periodPayment - interestThisPeriod,
      balance
    );

    annualInterest += interestThisPeriod;
    annualPrincipal += principalThisPeriod;
    balance -= principalThisPeriod;
  }

  return { annualInterest, annualPrincipal, endingBalance: Math.max(0, balance) };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
