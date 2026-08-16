import type { CostSegregationInput } from "../../../src/taxTypes";

export const longTermRentalBenchmark: CostSegregationInput = {
  jurisdiction: "US",
  totalBuildingCostBasis: 1000000,
  propertyUse: "long_term_rental",
  useBenchmarkDefault: true,
};

export const shortTermRentalBenchmark: CostSegregationInput = {
  jurisdiction: "US",
  totalBuildingCostBasis: 1000000,
  propertyUse: "short_term_rental",
  useBenchmarkDefault: true,
};

export const commercialWithoutOverride: CostSegregationInput = {
  jurisdiction: "US",
  totalBuildingCostBasis: 1000000,
  propertyUse: "commercial",
  useBenchmarkDefault: true,
};

export const commercialWithCustomOverride: CostSegregationInput = {
  jurisdiction: "US",
  totalBuildingCostBasis: 1000000,
  propertyUse: "commercial",
  useBenchmarkDefault: false,
  customFiveYearPercent: 0.12,
  customFifteenYearPercent: 0.09,
};

export const missingCustomOverride: CostSegregationInput = {
  jurisdiction: "US",
  totalBuildingCostBasis: 1000000,
  propertyUse: "long_term_rental",
  useBenchmarkDefault: false,
};
