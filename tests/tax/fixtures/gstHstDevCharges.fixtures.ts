import type { GstHstDevChargesInput } from "../../../src/taxTypes";

export const onTorontoRegisteredResidential: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "ON",
  municipality: "Toronto",
  constructionCosts: 1200000,
  unitCount: 8,
  unitType: "residential",
  gstHstRegistered: true,
  devChargeRatePerUnit: 13500,
};

export const bcVancouverUnregisteredResidential: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "BC",
  municipality: "Vancouver",
  constructionCosts: 2500000,
  unitCount: 20,
  unitType: "residential",
  gstHstRegistered: false,
  devChargeRatePerUnit: 25000,
};

export const qcMontrealRegisteredCommercial: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "QC",
  municipality: "Montreal",
  constructionCosts: 1800000,
  unitCount: 10,
  unitType: "commercial",
  gstHstRegistered: true,
  devChargeRatePerUnit: 3500,
};

export const nsHalifaxRegisteredResidential: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "NS",
  municipality: "Halifax",
  constructionCosts: 800000,
  unitCount: 5,
  unitType: "residential",
  gstHstRegistered: true,
  devChargeRatePerUnit: 5000,
};

export const onZeroConstructionCostLandOnly: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "ON",
  constructionCosts: 0,
  unitCount: 3,
  unitType: "residential",
  gstHstRegistered: true,
  devChargeRatePerUnit: 10000,
};

export const abSmallUnregisteredProject: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "AB",
  constructionCosts: 400000,
  unitCount: 2,
  unitType: "residential",
  gstHstRegistered: false,
  devChargeRatePerUnit: 6000,
};

export const onTorontoDefaultDevChargeLookup: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "ON",
  municipality: "Toronto",
  constructionCosts: 1000000,
  unitCount: 4,
  unitType: "residential",
  gstHstRegistered: true,
};

export const onTorontoCommercialDefaultDevChargeLookup: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "ON",
  municipality: "Toronto",
  constructionCosts: 1000000,
  unitCount: 4,
  unitType: "commercial",
  gstHstRegistered: true,
};

export const bcNoMunicipalityDefaultLookup: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "BC",
  constructionCosts: 500000,
  unitCount: 2,
  unitType: "residential",
  gstHstRegistered: false,
};

export const bcUnknownMunicipalityFallsBackToProvince: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "BC",
  municipality: "Kelowna",
  constructionCosts: 500000,
  unitCount: 2,
  unitType: "commercial",
  gstHstRegistered: false,
};

export const skMissingOverrideThrows: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "SK",
  constructionCosts: 300000,
  unitCount: 1,
  unitType: "residential",
  gstHstRegistered: true,
};

export const skMissingOverrideWithMunicipalityThrows: GstHstDevChargesInput = {
  jurisdiction: "CA",
  province: "SK",
  municipality: "Regina",
  constructionCosts: 300000,
  unitCount: 1,
  unitType: "residential",
  gstHstRegistered: true,
};
