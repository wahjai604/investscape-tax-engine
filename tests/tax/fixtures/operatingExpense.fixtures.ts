import type { OperatingExpenseInput } from "../../../src/taxTypes";

export const caClearDeductibleVsCapitalized: OperatingExpenseInput = {
  jurisdiction: "CA",
  province: "BC",
  propertyType: "residential",
  expenses: [
    { description: "Roof repair (patching leak)", amount: 800 },
    { description: "New roof", amount: 12000 },
    { description: "Property management fees", amount: 2400 },
    { description: "HVAC service", amount: 400 },
  ],
};

export const usMixedWithReviewFlag: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [
    { description: "Gutter repair", amount: 200 },
    { description: "HVAC system replacement", amount: 8000 },
    { description: "Painted exterior", amount: 2500 },
    { description: "Property insurance", amount: 1800 },
  ],
};

export const caAllDeductibleSmallRepairs: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [
    { description: "Lightbulb replacements", amount: 50 },
    { description: "Gutter cleaning", amount: 200 },
    { description: "Paint touch-ups", amount: 300 },
  ],
};

export const usAllCapitalizedMajorRenovation: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [
    { description: "Kitchen renovation (full)", amount: 15000 },
    { description: "Bathroom renovation (full)", amount: 10000 },
    { description: "New electrical panel", amount: 5000 },
  ],
};

export const usCommercialDifferentThresholds: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "commercial",
  expenses: [
    { description: "Roof repair", amount: 5000 },
    { description: "New HVAC", amount: 12000 },
    { description: "Parking lot seal", amount: 3000 },
  ],
};

export const caAmbiguousLandscaping: OperatingExpenseInput = {
  jurisdiction: "CA",
  expenses: [{ description: "Landscaping work (unclear scope)", amount: 2000 }],
};

export const caMixedFullWorkedExample: OperatingExpenseInput = {
  jurisdiction: "CA",
  province: "BC",
  propertyType: "residential",
  expenses: [
    { description: "Roof repair (patching leak)", amount: 800 },
    { description: "New roof", amount: 12000 },
    { description: "Property management fees", amount: 2400 },
    { description: "Paint interior walls", amount: 1500 },
    { description: "Replaced kitchen appliances (upgrade)", amount: 5000 },
    { description: "HVAC servicing", amount: 400 },
    { description: "Property insurance", amount: 1200 },
  ],
};

export const usAzWorkedExample: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [
    { description: "Gutter repair", amount: 200 },
    { description: "Replaced entire HVAC system", amount: 8000 },
    { description: "Painted exterior", amount: 2500 },
    { description: "Tenant-finding ads (Zillow/Craigslist)", amount: 500 },
    { description: "Property taxes", amount: 3000 },
    { description: "Homeowners insurance", amount: 1800 },
    { description: "Replaced kitchen counters (upgrade)", amount: 4000 },
  ],
};

export const usBareRoofRepairResidential: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "Roof repair", amount: 5000 }],
};

export const usCustomAutoCapitalizeThreshold: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  autoCapitalizeThreshold: 100,
  expenses: [{ description: "Roof repair", amount: 500 }],
};

export const missingPropertyTypeDefaultsResidential: OperatingExpenseInput = {
  jurisdiction: "US",
  expenses: [{ description: "New roof", amount: 12000 }],
};

export const caUnmatchedRepairWithQualifier: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Fence repair (broken board)", amount: 300 }],
};

export const usBareRepairUnderThreshold: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "Deck repair", amount: 500 }],
};

export const usUnmatchedReplacement: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "Replaced water heater", amount: 1200 }],
};

export const caUnmatchedMiscellaneous: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Miscellaneous handyman work", amount: 250 }],
};

export const caCleaningWithoutGutter: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Move-out unit cleaning", amount: 150 }],
};

export const caParkingLotSeal: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "commercial",
  expenses: [{ description: "Parking lot resurfacing seal", amount: 1800 }],
};

// --- Branch-coverage fixtures below: each targets one specific uncovered
// operand identified from coverage/coverage-final.json's branch map for
// canadianRules.ts, usRules.ts, and ruleHelpers.ts (not guessed from the
// aggregate % — that file was read directly to find exact line/branch
// indices before writing these).

export const caHvacMaintenanceWithoutServicing: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "HVAC maintenance contract", amount: 500 }],
};

export const caElectricalPanelNonContiguousPhrase: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Electrical wiring and panel repair", amount: 9000 }],
};

export const caFurnaceReplacementNonContiguousPhrase: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Furnace unit replacement due to failure", amount: 4000 }],
};

export const caExteriorPaint: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Paint exterior trim", amount: 600 }],
};

export const caBareRepairResidentialUnderThreshold: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "residential",
  expenses: [{ description: "Chimney repair", amount: 1000 }],
};

export const caBareRepairCommercialOverThreshold: OperatingExpenseInput = {
  jurisdiction: "CA",
  propertyType: "commercial",
  expenses: [{ description: "Chimney repair", amount: 1200 }],
};

export const usHvacEntireOverhaul: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "HVAC entire overhaul", amount: 7000 }],
};

export const usHvacSystemSwap: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "HVAC system swap", amount: 6000 }],
};

export const usHvacServiceCall: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "HVAC service call", amount: 300 }],
};

export const usHvacMaintenanceWithoutServicing: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "HVAC maintenance contract", amount: 400 }],
};

export const usElectricalPanelNonContiguousPhrase: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "Electrical rewiring and panel replacement", amount: 10000 }],
};

export const usFurnaceReplacementNonContiguousPhrase: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "residential",
  expenses: [{ description: "Furnace unit replacement", amount: 3500 }],
};

export const usSealCoatWithoutParkingLotPhrase: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "commercial",
  expenses: [{ description: "Seal coat resurfacing", amount: 500 }],
};

export const usParkingAndSealWithoutEitherFixedPhrase: OperatingExpenseInput = {
  jurisdiction: "US",
  propertyType: "commercial",
  expenses: [{ description: "Parking area sealing work", amount: 500 }],
};
