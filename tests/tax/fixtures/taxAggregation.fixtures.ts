import type { TaxAggregationInput } from "../../../src/taxTypes";

export const canadaPositiveIncome: TaxAggregationInput = {
  properties: [
    {
      address: "123 Main St, Vancouver, BC",
      rentalIncome: 36000,
      rentalExpenses: 9000,
      mortgageInterestPaid: 14000,
      mortgagePrincipal: 8000,
      depreciation: 9000,
    },
  ],
  jurisdiction: "CA",
  province: "BC",
  filingStatus: "single",
  otherIncome: 80000,
  year: 2026,
};

export const canadaCcaLossRestriction: TaxAggregationInput = {
  properties: [
    {
      address: "456 Oak Ave, Toronto, ON",
      rentalIncome: 18000,
      rentalExpenses: 8000,
      mortgageInterestPaid: 12000,
      mortgagePrincipal: 6000,
      depreciation: 6000,
    },
  ],
  jurisdiction: "CA",
  province: "ON",
  filingStatus: "single",
  otherIncome: 60000,
  year: 2026,
};

export const usPassiveActivityLoss: TaxAggregationInput = {
  properties: [
    {
      address: "789 Desert Rd, Phoenix, AZ",
      rentalIncome: 15000,
      rentalExpenses: 6000,
      mortgageInterestPaid: 10000,
      mortgagePrincipal: 5000,
      depreciation: 5000,
    },
  ],
  jurisdiction: "US",
  state: "AZ",
  filingStatus: "single",
  otherIncome: 120000,
  realEstateProfessional: false,
  year: 2026,
};

export const usMultiPropertyNoLoss: TaxAggregationInput = {
  properties: [
    {
      address: "111 Oak St, Denver, CO",
      rentalIncome: 25000,
      rentalExpenses: 7000,
      mortgageInterestPaid: 9000,
      mortgagePrincipal: 4000,
      depreciation: 4500,
    },
    {
      address: "222 Maple Ave, Denver, CO",
      rentalIncome: 20000,
      rentalExpenses: 5000,
      mortgageInterestPaid: 8000,
      mortgagePrincipal: 3000,
      depreciation: 3500,
    },
  ],
  jurisdiction: "US",
  state: "CO",
  filingStatus: "married",
  otherIncome: 150000,
  realEstateProfessional: false,
  year: 2026,
};
