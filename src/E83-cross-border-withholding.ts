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

import {
  FIRPTA_STANDARD_WITHHOLDING_RATE,
  FIRPTA_REDUCED_WITHHOLDING_RATE,
  FIRPTA_RESIDENCE_EXEMPTION_THRESHOLD,
  FIRPTA_REDUCED_RATE_UPPER_THRESHOLD,
  SECTION_116_WITHHOLDING_RATE,
  PART_XIII_WITHHOLDING_RATE,
  US_FDAP_RENTAL_WITHHOLDING_RATE,
} from "./utils/constants";
import type {
  CrossBorderWithholdingRequest,
  CrossBorderWithholdingResult,
} from "./taxTypes";

const DISCLAIMER =
  "Cross-border withholding (FIRPTA, Section 116, Part XIII, §871(d)/Section 216) depends on the investor's full facts and circumstances, current IRS/CRA guidance, and the Canada-US Tax Treaty. This calculation is advisory only, is scoped to Canada <-> US real property transactions, does not model the investor's home-country tax liability or foreign-tax-credit limitation mechanics (see foreignTaxCreditEligible/fullyOffsetsDoubleTaxation and issues[]), and does not constitute tax or legal advice — consult a cross-border tax professional before relying on it.";

/**
 * E83: Cross-Border Withholding Engine (Canada <-> US only).
 *
 * Covers the four real directional cases this codebase's existing CA/US
 * jurisdiction support (E46-E53, E68-E70) creates: a Canadian investor
 * selling or renting US property (FIRPTA / §871(d) FDAP), and a US investor
 * selling or renting Canadian property (Section 116 / Part XIII with a
 * Section 216 election). Same-country combinations return a zero-rate result
 * rather than throwing, so callers don't have to pre-filter — see
 * docs/CROSS-BORDER-WITHHOLDING-SOURCES.md for every rate and threshold's
 * citation.
 *
 * `foreignTaxCreditEligible` is a principle-level flag: withheld FIRPTA/
 * Section 116/Part XIII/§871(d) tax is, in principle, a creditable foreign
 * income tax under the Canada-US Tax Treaty and each country's own domestic
 * FTC rules (IRC §901 / ITA §126). `fullyOffsetsDoubleTaxation` is
 * deliberately conservative (always false) because computing an actual
 * offset requires the investor's home-country tax liability on the same
 * income, treaty sourcing rules, and domestic FTC limitation mechanics (US
 * Form 1116 / Canadian federal+provincial limits) that this engine does not
 * model — a disclosed gap in `issues`, not a fabricated "yes."
 */
export function calculateCrossBorderWithholding(
  request: CrossBorderWithholdingRequest
): CrossBorderWithholdingResult {
  const { investorHomeCountry, propertyCountry, transactionType, grossAmount } = request;

  if (investorHomeCountry === propertyCountry) {
    return buildResult(request, {
      withholdingRate: 0,
      withholdingBasisAmount: grossAmount,
      usedElectionOrCertificate: false,
      foreignTaxCreditEligible: false,
      fullyOffsetsDoubleTaxation: false,
      regime: "NOT_APPLICABLE",
      jurisdiction: investorHomeCountry === "Canada" ? "CA" : "US",
      issues: [
        `investorHomeCountry and propertyCountry are both ${investorHomeCountry} — this is a domestic, not cross-border, transaction. No cross-border withholding regime applies; use this jurisdiction's own domestic tax engines (E46-E53, E68-E70) instead.`,
      ],
    });
  }

  if (propertyCountry === "US" && transactionType === "sale_proceeds") {
    return firpta(request);
  }
  if (propertyCountry === "US" && transactionType === "rental_income") {
    return usFdapRental(request);
  }
  if (propertyCountry === "Canada" && transactionType === "sale_proceeds") {
    return section116(request);
  }
  return partXIIIRental(request);
}

function firpta(request: CrossBorderWithholdingRequest): CrossBorderWithholdingResult {
  const { grossAmount, buyerIntendsUseAsResidence, useNetBasisElectionOrCertificate } = request;
  const issues: string[] = [];

  let rate: number;
  if (buyerIntendsUseAsResidence && grossAmount <= FIRPTA_RESIDENCE_EXEMPTION_THRESHOLD) {
    rate = 0;
  } else if (
    buyerIntendsUseAsResidence &&
    grossAmount <= FIRPTA_REDUCED_RATE_UPPER_THRESHOLD
  ) {
    rate = FIRPTA_REDUCED_WITHHOLDING_RATE;
  } else {
    rate = FIRPTA_STANDARD_WITHHOLDING_RATE;
  }

  const { basisAmount, usedElection } = resolveBasis(request, grossAmount, issues, "gain");

  if (usedElection) {
    issues.push(
      "Form 8288-B withholding is approved by the IRS at the seller's actual anticipated tax liability, not simply this statutory rate applied to the estimated gain — this engine approximates the certificate amount as rate x estimatedGainOrNetIncome, which is a simplification, not the IRS's own computation. Confirm the actual approved amount on the issued 8288-B."
    );
  }
  if (rate === FIRPTA_REDUCED_WITHHOLDING_RATE || rate === 0) {
    issues.push(
      "Reduced/zero FIRPTA withholding applies only when the BUYER intends to use the property as a residence under the IRC §1445(b)(5) 50%-use test for the first two 12-month periods after transfer — this is a fact about the buyer, not the investor, and should be confirmed before relying on it."
    );
  }

  return buildResult(request, {
    withholdingRate: rate,
    withholdingBasisAmount: basisAmount,
    usedElectionOrCertificate: usedElection,
    foreignTaxCreditEligible: true,
    fullyOffsetsDoubleTaxation: false,
    regime: "FIRPTA",
    jurisdiction: "CROSS_BORDER",
    issues,
  });
}

function section116(request: CrossBorderWithholdingRequest): CrossBorderWithholdingResult {
  const { grossAmount } = request;
  const issues: string[] = [];

  const { basisAmount, usedElection } = resolveBasis(request, grossAmount, issues, "gain");

  if (usedElection) {
    issues.push(
      "A real Section 116 clearance certificate is issued once the non-resident vendor remits (or secures) CRA's tax on the actual computed gain — it is not the purchaser applying 25% to an estimated gain figure. This engine approximates the certificate-basis withholding as rate x estimatedGainOrNetIncome, a simplification of the real remittance/certificate mechanics (CRA Information Circular IC72-17R6)."
    );
  } else {
    issues.push(
      "Absent a clearance certificate, the purchaser must withhold 25% of GROSS proceeds regardless of the vendor's actual gain (or loss) — this can materially overstate the vendor's true Canadian tax liability. A vendor expecting a modest gain or a loss should apply for a Section 116 clearance certificate before closing."
    );
  }

  return buildResult(request, {
    withholdingRate: SECTION_116_WITHHOLDING_RATE,
    withholdingBasisAmount: basisAmount,
    usedElectionOrCertificate: usedElection,
    foreignTaxCreditEligible: true,
    fullyOffsetsDoubleTaxation: false,
    regime: "SECTION_116",
    jurisdiction: "CROSS_BORDER",
    issues,
  });
}

function partXIIIRental(request: CrossBorderWithholdingRequest): CrossBorderWithholdingResult {
  const { grossAmount } = request;
  const issues: string[] = [];

  const { basisAmount, usedElection, rate, effectiveWithholding } = resolveNetIncomeElection(
    request,
    grossAmount,
    PART_XIII_WITHHOLDING_RATE,
    issues
  );

  if (usedElection) {
    issues.push(
      "A Section 216 election taxes net rental income at graduated resident-style rates via a full T1159 return, not a flat rate — this engine approximates that with the single investorMarginalTaxRate supplied, rather than modeling Canada's federal+provincial bracket schedule for a non-resident filer. The real return may produce a different (typically lower, sometimes refundable) result."
    );
  } else {
    issues.push(
      "Absent a Section 216 election (or an approved NR6 to withhold on net rather than gross rent), Part XIII requires withholding 25% of GROSS rental income with no deduction for expenses — this is often far more than 25% of net income and most non-resident landlords with meaningful expenses benefit from electing."
    );
  }

  return buildResult(request, {
    withholdingRate: rate,
    withholdingBasisAmount: basisAmount,
    usedElectionOrCertificate: usedElection,
    foreignTaxCreditEligible: true,
    fullyOffsetsDoubleTaxation: false,
    regime: "PART_XIII_SECTION_216",
    jurisdiction: "CROSS_BORDER",
    issues,
    withholdingAmountOverride: effectiveWithholding,
  });
}

function usFdapRental(request: CrossBorderWithholdingRequest): CrossBorderWithholdingResult {
  const { grossAmount } = request;
  const issues: string[] = [];

  const { basisAmount, usedElection, rate, effectiveWithholding } = resolveNetIncomeElection(
    request,
    grossAmount,
    US_FDAP_RENTAL_WITHHOLDING_RATE,
    issues
  );

  if (usedElection) {
    issues.push(
      "A §871(d) election treats net rental income as effectively connected income taxed at graduated US rates via Form 1040-NR, not a flat rate — this engine approximates that with the single investorMarginalTaxRate supplied, rather than modeling the full US federal (and any state) bracket schedule for a nonresident-alien filer. The real return may produce a different result."
    );
  } else {
    issues.push(
      "Absent a §871(d) election, US-source rental income paid to a nonresident alien is FDAP income taxed at a flat 30% of GROSS rent with no deduction for expenses (or a lower treaty rate, not modeled here — the Canada-US Tax Treaty does not reduce this rate below 30% for real property rental income). Most non-resident landlords with meaningful expenses benefit from electing net treatment."
    );
  }

  return buildResult(request, {
    withholdingRate: rate,
    withholdingBasisAmount: basisAmount,
    usedElectionOrCertificate: usedElection,
    foreignTaxCreditEligible: true,
    fullyOffsetsDoubleTaxation: false,
    regime: "FDAP_871D",
    jurisdiction: "CROSS_BORDER",
    issues,
    withholdingAmountOverride: effectiveWithholding,
  });
}

/** Resolves the sale-proceeds basis: grossAmount by default, or estimatedGainOrNetIncome when a certificate is used. */
function resolveBasis(
  request: CrossBorderWithholdingRequest,
  grossAmount: number,
  issues: string[],
  _kind: "gain"
): { basisAmount: number; usedElection: boolean } {
  if (!request.useNetBasisElectionOrCertificate) {
    return { basisAmount: grossAmount, usedElection: false };
  }
  if (request.estimatedGainOrNetIncome === undefined) {
    issues.push(
      "useNetBasisElectionOrCertificate was true but estimatedGainOrNetIncome was not supplied — falling back to the gross-proceeds default because a certificate/election amount cannot be computed without it."
    );
    return { basisAmount: grossAmount, usedElection: false };
  }
  return { basisAmount: request.estimatedGainOrNetIncome, usedElection: true };
}

/**
 * Resolves the rental-income basis and rate: gross rent at the statutory
 * flat rate by default, or net rental income at the investor's supplied
 * marginal rate when a §871(d)/Section 216 election is used.
 */
function resolveNetIncomeElection(
  request: CrossBorderWithholdingRequest,
  grossAmount: number,
  statutoryRate: number,
  issues: string[]
): { basisAmount: number; usedElection: boolean; rate: number; effectiveWithholding: number } {
  if (!request.useNetBasisElectionOrCertificate) {
    return {
      basisAmount: grossAmount,
      usedElection: false,
      rate: statutoryRate,
      effectiveWithholding: round(statutoryRate * grossAmount, 2),
    };
  }
  if (
    request.estimatedGainOrNetIncome === undefined ||
    request.investorMarginalTaxRate === undefined
  ) {
    issues.push(
      "useNetBasisElectionOrCertificate was true but estimatedGainOrNetIncome and/or investorMarginalTaxRate was not supplied — falling back to the gross-rent statutory default because the net-income election amount cannot be computed without both."
    );
    return {
      basisAmount: grossAmount,
      usedElection: false,
      rate: statutoryRate,
      effectiveWithholding: round(statutoryRate * grossAmount, 2),
    };
  }
  return {
    basisAmount: request.estimatedGainOrNetIncome,
    usedElection: true,
    rate: request.investorMarginalTaxRate,
    effectiveWithholding: round(request.investorMarginalTaxRate * request.estimatedGainOrNetIncome, 2),
  };
}

function buildResult(
  request: CrossBorderWithholdingRequest,
  parts: {
    withholdingRate: number;
    withholdingBasisAmount: number;
    usedElectionOrCertificate: boolean;
    foreignTaxCreditEligible: boolean;
    fullyOffsetsDoubleTaxation: boolean;
    regime: CrossBorderWithholdingResult["regime"];
    jurisdiction: CrossBorderWithholdingResult["jurisdiction"];
    issues: string[];
    withholdingAmountOverride?: number;
  }
): CrossBorderWithholdingResult {
  const withholdingAmount =
    parts.withholdingAmountOverride !== undefined
      ? parts.withholdingAmountOverride
      : round(parts.withholdingRate * parts.withholdingBasisAmount, 2);

  const issues = [...parts.issues];
  if (parts.foreignTaxCreditEligible) {
    issues.push(
      "fullyOffsetsDoubleTaxation is not fully modeled: it requires computing the investor's home-country tax on this same income, applying Canada-US Tax Treaty sourcing rules, and applying each country's own domestic foreign-tax-credit limitation mechanics (US Form 1116 categories/limits, or Canadian federal+provincial FTC limits) — none of which this engine calculates. Confirm actual double-tax relief with a cross-border tax professional."
    );
  }

  return {
    withholdingRate: parts.withholdingRate,
    withholdingAmount,
    withholdingBasisAmount: parts.withholdingBasisAmount,
    usedElectionOrCertificate: parts.usedElectionOrCertificate,
    foreignTaxCreditEligible: parts.foreignTaxCreditEligible,
    fullyOffsetsDoubleTaxation: parts.fullyOffsetsDoubleTaxation,
    regime: parts.regime,
    jurisdiction: parts.jurisdiction,
    calculatedAt: new Date().toISOString(),
    inputs: request,
    issues,
    disclaimer: DISCLAIMER,
  };
}

function round(value: number, decimals: number): number {
  // Binary floating point can land a hair off the exact decimal value;
  // toPrecision cleans that noise up before rounding.
  const cleaned = Number(value.toPrecision(12));
  const factor = 10 ** decimals;
  return Math.round((cleaned + Number.EPSILON) * factor) / factor;
}
