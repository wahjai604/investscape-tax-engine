import type { DepreciationInput } from "../../../src/taxTypes";

export const canadaYear1Acquisition: DepreciationInput = {
  jurisdiction: "CA",
  purchasePrice: 600000,
  buildingCost: 500000,
  landCost: 100000,
  propertyType: "residential",
  acquisitionYear: 2024,
  currentYear: 2024,
};

export const canadaYear3WithSale: DepreciationInput = {
  jurisdiction: "CA",
  purchasePrice: 600000,
  buildingCost: 500000,
  landCost: 100000,
  propertyType: "residential",
  acquisitionYear: 2024,
  currentYear: 2026,
  priorYearClosingUCC: 230400,
  salePrice: 620000,
  investorMarginalTaxRate: 0.437,
};

export const canadaYear3SoldAtLoss: DepreciationInput = {
  jurisdiction: "CA",
  purchasePrice: 600000,
  buildingCost: 500000,
  landCost: 100000,
  propertyType: "residential",
  acquisitionYear: 2024,
  currentYear: 2026,
  priorYearClosingUCC: 230400,
  salePrice: 400000,
  investorMarginalTaxRate: 0.437,
};

export const usYear1Acquisition: DepreciationInput = {
  jurisdiction: "US",
  purchasePrice: 375000,
  buildingCost: 300000,
  landCost: 75000,
  propertyType: "residential",
  acquisitionYear: 2024,
  currentYear: 2024,
};

export const usYear3WithSale: DepreciationInput = {
  jurisdiction: "US",
  purchasePrice: 375000,
  buildingCost: 300000,
  landCost: 75000,
  propertyType: "residential",
  acquisitionYear: 2024,
  currentYear: 2026,
  priorCumulativeDepreciation: 16363.64,
  salePrice: 380000,
};

export const usCommercialYear1: DepreciationInput = {
  jurisdiction: "US",
  purchasePrice: 1200000,
  buildingCost: 1000000,
  landCost: 200000,
  propertyType: "commercial",
  acquisitionYear: 2026,
  currentYear: 2026,
};

export const canadaLandOnly: DepreciationInput = {
  jurisdiction: "CA",
  purchasePrice: 200000,
  buildingCost: 0,
  landCost: 200000,
  propertyType: "residential",
  acquisitionYear: 2026,
  currentYear: 2026,
};
