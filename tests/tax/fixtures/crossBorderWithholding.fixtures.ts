import type { CrossBorderWithholdingRequest } from "../../../src/taxTypes";

// --- FIRPTA (CA investor, US property, sale_proceeds) ---

/** Standard 15% FIRPTA rate: buyer has no residence intent. 500000 x 0.15 = 75000. */
export const firptaStandardRate: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 500000,
};

/** At the $300,000 residence-exemption threshold (inclusive) with buyer residence intent -> 0% withholding. */
export const firptaResidenceExemptionAtThreshold: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 300000,
  buyerIntendsUseAsResidence: true,
};

/** One dollar above the exemption threshold -> jumps into the 10% reduced-rate band. 300001 x 0.10 = 30000.10. */
export const firptaJustAboveResidenceExemption: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 300001,
  buyerIntendsUseAsResidence: true,
};

/** At the $1,000,000 upper bound of the reduced-rate band (inclusive) -> still 10%. 1000000 x 0.10 = 100000. */
export const firptaAtReducedRateUpperBound: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 1000000,
  buyerIntendsUseAsResidence: true,
};

/** One dollar above the reduced-rate band -> back to the standard 15% rate despite residence intent. 1000001 x 0.15 = 150000.15. */
export const firptaJustAboveReducedRateBand: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 1000001,
  buyerIntendsUseAsResidence: true,
};

/** Form 8288-B certificate: 15% standard rate (no residence intent) applied to the $50,000 estimated gain, not the $500,000 gross price. 50000 x 0.15 = 7500. */
export const firptaWithCertificate: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 500000,
  useNetBasisElectionOrCertificate: true,
  estimatedGainOrNetIncome: 50000,
};

/** Certificate flag set but no estimated gain supplied -> must fall back to the gross default rather than silently computing $0. */
export const firptaCertificateMissingEstimate: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 500000,
  useNetBasisElectionOrCertificate: true,
};

// --- Section 116 (US investor, Canadian property, sale_proceeds) ---

/** Default 25% of gross proceeds, no clearance certificate. 400000 x 0.25 = 100000. */
export const section116DefaultGross: CrossBorderWithholdingRequest = {
  investorHomeCountry: "US",
  propertyCountry: "Canada",
  transactionType: "sale_proceeds",
  grossAmount: 400000,
};

/** With a clearance certificate: 25% applied to the $60,000 estimated gain instead of the $400,000 gross proceeds. 60000 x 0.25 = 15000. */
export const section116WithClearanceCertificate: CrossBorderWithholdingRequest = {
  investorHomeCountry: "US",
  propertyCountry: "Canada",
  transactionType: "sale_proceeds",
  grossAmount: 400000,
  useNetBasisElectionOrCertificate: true,
  estimatedGainOrNetIncome: 60000,
};

// --- Part XIII / Section 216 (US investor, Canadian property, rental_income) ---

/** Default 25% of gross annual rent, no Section 216 election. 24000 x 0.25 = 6000. */
export const partXIIIDefaultGross: CrossBorderWithholdingRequest = {
  investorHomeCountry: "US",
  propertyCountry: "Canada",
  transactionType: "rental_income",
  grossAmount: 24000,
};

/** Section 216 election: 30% marginal rate applied to $10,000 net rental income (after expenses) instead of 25% of $24,000 gross. 10000 x 0.30 = 3000. */
export const section216ElectionNetIncome: CrossBorderWithholdingRequest = {
  investorHomeCountry: "US",
  propertyCountry: "Canada",
  transactionType: "rental_income",
  grossAmount: 24000,
  useNetBasisElectionOrCertificate: true,
  estimatedGainOrNetIncome: 10000,
  investorMarginalTaxRate: 0.3,
};

// --- §871(d) / FDAP (Canadian investor, US property, rental_income) ---

/** Default 30% FDAP withholding on gross rent, no §871(d) election. 30000 x 0.30 = 9000. */
export const fdapDefaultGross: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "rental_income",
  grossAmount: 30000,
};

/** §871(d) election: 22% marginal rate applied to $12,000 net rental income instead of 30% of $30,000 gross. 12000 x 0.22 = 2640. */
export const section871dElectionNetIncome: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "rental_income",
  grossAmount: 30000,
  useNetBasisElectionOrCertificate: true,
  estimatedGainOrNetIncome: 12000,
  investorMarginalTaxRate: 0.22,
};

/** Election flag set on rental income but missing investorMarginalTaxRate -> must fall back to the gross statutory default. */
export const fdapElectionMissingMarginalRate: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "US",
  transactionType: "rental_income",
  grossAmount: 30000,
  useNetBasisElectionOrCertificate: true,
  estimatedGainOrNetIncome: 12000,
};

// --- Same-country (not cross-border) ---

export const sameCountryUS: CrossBorderWithholdingRequest = {
  investorHomeCountry: "US",
  propertyCountry: "US",
  transactionType: "sale_proceeds",
  grossAmount: 100000,
};

export const sameCountryCanada: CrossBorderWithholdingRequest = {
  investorHomeCountry: "Canada",
  propertyCountry: "Canada",
  transactionType: "rental_income",
  grossAmount: 24000,
};
