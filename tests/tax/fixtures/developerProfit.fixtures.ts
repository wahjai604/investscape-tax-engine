import type { DeveloperProfitInput } from "../../../src/tax/taxTypes";

export const caOntario8UnitProject: DeveloperProfitInput = {
  jurisdiction: "CA",
  province: "ON",
  totalRevenueFromSales: 1800000,
  hardCosts: 1200000,
  softCosts: 240000,
  gstHstOwing: 65000,
  developmentChargesOwing: 72000,
  developerMarginalTaxRate: 0.45,
};

export const usArizonaSingleFamily: DeveloperProfitInput = {
  jurisdiction: "US",
  state: "AZ",
  totalRevenueFromSales: 800000,
  hardCosts: 500000,
  softCosts: 80000,
  gstHstOwing: 0,
  developmentChargesOwing: 0,
  developerMarginalTaxRate: 0.35,
};

export const usCaliforniaMultiFamily: DeveloperProfitInput = {
  jurisdiction: "US",
  state: "CA",
  totalRevenueFromSales: 3500000,
  hardCosts: 2100000,
  softCosts: 350000,
  developerMarginalTaxRate: 0.48,
};

export const caBreakEvenProject: DeveloperProfitInput = {
  jurisdiction: "CA",
  totalRevenueFromSales: 1500000,
  hardCosts: 1000000,
  softCosts: 350000,
  gstHstOwing: 50000,
  developmentChargesOwing: 100000,
};

export const usLossProject: DeveloperProfitInput = {
  jurisdiction: "US",
  totalRevenueFromSales: 1000000,
  hardCosts: 900000,
  softCosts: 150000,
};

export const usMinimalProject: DeveloperProfitInput = {
  jurisdiction: "US",
  totalRevenueFromSales: 500000,
  hardCosts: 300000,
  softCosts: 0,
  developerMarginalTaxRate: 0.3,
};

export const usIgnoresGstHstAndDevCharges: DeveloperProfitInput = {
  jurisdiction: "US",
  totalRevenueFromSales: 1000000,
  hardCosts: 600000,
  softCosts: 100000,
  // A US project should never actually populate these (no GST/HST or dev
  // charges in the US), but if it did, they must not affect totalCosts.
  gstHstOwing: 40000,
  developmentChargesOwing: 60000,
  developerMarginalTaxRate: 0.3,
};

export const caLossProjectWithRate: DeveloperProfitInput = {
  jurisdiction: "CA",
  totalRevenueFromSales: 900000,
  hardCosts: 800000,
  softCosts: 150000,
  gstHstOwing: 20000,
  developmentChargesOwing: 10000,
  developerMarginalTaxRate: 0.4,
};

export const usZeroRevenueLoss: DeveloperProfitInput = {
  jurisdiction: "US",
  totalRevenueFromSales: 0,
  hardCosts: 1000,
  softCosts: 0,
  developerMarginalTaxRate: 0.3,
};

export const caFullSoftCostDetails: DeveloperProfitInput = {
  jurisdiction: "CA",
  province: "BC",
  totalRevenueFromSales: 1200000,
  hardCosts: 800000,
  softCosts: 150000,
  softCostDetails: {
    architecturalEngineering: 60000,
    permits: 20000,
    insurance: 15000,
    management: 30000,
    financing: 15000,
    advertising: 5000,
    other: 5000,
  },
  gstHstOwing: 30000,
  developmentChargesOwing: 40000,
  developerMarginalTaxRate: 0.4,
};
