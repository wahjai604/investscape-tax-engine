import type { PersonalIncomeTaxInput } from "../../../src/tax/taxTypes";

export const canadaBcPositiveIncome: PersonalIncomeTaxInput = {
  totalIncome: 84000,
  jurisdiction: "CA",
  province: "BC",
  filingStatus: "single",
  year: 2026,
};

export const usAzMarriedFilingJointly: PersonalIncomeTaxInput = {
  totalIncome: 158000,
  jurisdiction: "US",
  state: "AZ",
  filingStatus: "married",
  year: 2026,
};

export const usTexasNoStateTax: PersonalIncomeTaxInput = {
  totalIncome: 114000,
  jurisdiction: "US",
  state: "TX",
  filingStatus: "single",
  year: 2026,
};

export const canadaOntarioLowIncome: PersonalIncomeTaxInput = {
  totalIncome: 30000,
  jurisdiction: "CA",
  province: "ON",
  filingStatus: "single",
  year: 2026,
};

export const canadaZeroIncome: PersonalIncomeTaxInput = {
  totalIncome: 0,
  jurisdiction: "CA",
  province: "BC",
  filingStatus: "single",
  year: 2026,
};

export const usCaliforniaTopBracket: PersonalIncomeTaxInput = {
  totalIncome: 700000,
  jurisdiction: "US",
  state: "CA",
  filingStatus: "single",
  year: 2026,
};
