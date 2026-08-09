import type { PassiveActivityLossInput } from "../../../src/tax/taxTypes";

export const noExceptionRentalLoss: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "CA",
  materially_participates: false,
  real_estate_professional: false,
  rentalsFromE46: -50000,
  suspendedLossCarryforward: 0,
  agiFederal: 120000,
};

export const materialParticipantUnderLimit: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "AZ",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: -30000,
  suspendedLossCarryforward: 10000,
  agiFederal: 140000,
};

export const realEstateProfessionalHighAgiPhaseout: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "TX",
  materially_participates: false,
  real_estate_professional: true,
  rentalsFromE46: -20000,
  agiFederal: 200000,
};

export const taxHarvestingSuspendedLoss: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "CA",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: 10000,
  suspendedLossCarryforward: 50000,
  capitalGainsTaxRate: 0.15,
  propertiesForSaleThisYear: [{ description: "Rental House A", realizedGain: 80000 }],
};

export const noExceptionPositiveIncome: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "OR",
  materially_participates: false,
  real_estate_professional: false,
  rentalsFromE46: 50000,
};

export const suspendedLossOffsetByPassiveIncome: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "FL",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: 15000,
  suspendedLossCarryforward: 30000,
};

export const partialAgiPhaseout: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "NY",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: -40000,
  agiFederal: 170000,
};

export const harvestWithNoSuspendedLoss: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "CA",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: 10000,
  suspendedLossCarryforward: 0,
  capitalGainsTaxRate: 0.2,
  propertiesForSaleThisYear: [{ description: "Rental House B", realizedGain: 40000 }],
};

export const harvestAcrossMultipleProperties: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "CA",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: 0,
  suspendedLossCarryforward: 20000,
  capitalGainsTaxRate: 0.15,
  propertiesForSaleThisYear: [
    { description: "Rental House C", realizedGain: 15000 },
    { description: "Rental House D", realizedGain: 15000 },
  ],
};

export const harvestDefaultCapitalGainsRate: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "CA",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: 0,
  suspendedLossCarryforward: 10000,
  propertiesForSaleThisYear: [{ description: "Rental House E", realizedGain: 20000 }],
};

export const otherPassiveIncomeSourcesReduceLoss: PassiveActivityLossInput = {
  jurisdiction: "US",
  state: "CA",
  materially_participates: true,
  real_estate_professional: false,
  rentalsFromE46: -40000,
  passiveIncomeOtherSources: 15000,
  agiFederal: 100000,
};
