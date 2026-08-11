/**
 * @license Closed-Source License Keys (InvestScape)
 * @copyright 2026 Lighthouse Research Ltd. DBA InvestScape
 *
 * This module is part of the InvestScape formula engine library.
 * Use is restricted to licensed InvestScape subscribers (S1+).
 * Unauthorized copying, distribution, or use is prohibited.
 *
 * Licensing: https://investscape.com/licensing
 * Contact: licensing@investscape.com
 */

import { hasMinorRepairQualifier, type ExpenseRule } from "./ruleHelpers";

/**
 * Ordered IRS Pub 527 / IRC §162(a) keyword rules. Evaluated top-to-bottom;
 * the first match wins, so more specific patterns (e.g. "new roof") are
 * placed ahead of broader ones (e.g. bare "roof"). Anything not matched here
 * falls through to the generic repair/threshold fallback in
 * operatingExpense.ts.
 */
export const usRules: ExpenseRule[] = [
  {
    test: (d) => d.includes("upgrade"),
    classification: "capitalized",
    reason:
      "Upgrade/improvement over prior condition, not a like-for-like repair; capitalized and recovered via MACRS.",
    ruleCitation: "IRS Pub 527 §3.02; betterment test",
  },
  {
    test: (d) => d.includes("renovation") || d.includes("remodel"),
    classification: "capitalized",
    reason:
      "Full renovation is a betterment that adds value and prolongs useful life; capitalized and recovered via MACRS.",
    ruleCitation: "IRS Pub 527 §3.02; betterment test",
  },
  {
    test: (d) => d.includes("new roof") || (d.includes("roof") && d.includes("replace")),
    classification: "capitalized",
    reason:
      "Full roof replacement is a capital improvement that extends the building's useful life. Recovered via MACRS.",
    ruleCitation: "IRS Pub 527 §3.02; MACRS recovery",
  },
  {
    test: (d) => d.includes("roof") && hasMinorRepairQualifier(d),
    classification: "deductible",
    reason:
      "Routine roof repair restoring the property to its former condition. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, repair vs. improvement test",
  },
  {
    test: (d) =>
      d.includes("hvac") &&
      (d.includes("replac") || d.includes("new") || d.includes("entire") || d.includes("system")),
    classification: "capitalized",
    reason:
      "Entire HVAC system replacement is a capital improvement, not a repair. Recovered via MACRS.",
    ruleCitation:
      "IRS Pub 527 §3.02; MACRS recovery (7yr or 27.5/39yr building, depending on classification)",
  },
  {
    test: (d) => d.includes("hvac") && (d.includes("servic") || d.includes("maintenance")),
    classification: "deductible",
    reason:
      "Routine HVAC servicing/maintenance; upkeep of an existing system. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) => d.includes("electrical panel") || (d.includes("electrical") && d.includes("panel")),
    classification: "capitalized",
    reason:
      "Full electrical panel replacement is a capital improvement. Recovered via MACRS.",
    ruleCitation: "IRS Pub 527 §3.02; MACRS recovery",
  },
  {
    test: (d) => d.includes("new furnace") || (d.includes("furnace") && d.includes("replace")),
    classification: "capitalized",
    reason:
      "Furnace replacement is a capital improvement to a building system. Recovered via MACRS.",
    ruleCitation: "IRS Pub 527 §3.02; MACRS recovery",
  },
  {
    test: (d) =>
      d.includes("structural") ||
      d.includes("addition") ||
      d.includes("basement finishing") ||
      d.includes("deck construction"),
    classification: "capitalized",
    reason:
      "Structural change/addition to the property; capital improvement. Recovered via MACRS.",
    ruleCitation: "IRS Pub 527 §3.02; adaptation/betterment test",
  },
  {
    test: (d) =>
      d.includes("paint") &&
      (d.includes("touch-up") || d.includes("touch up") || d.includes("interior")),
    classification: "deductible",
    reason:
      "Routine interior painting/touch-up refreshes the property without extending its life. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) => d.includes("paint") && d.includes("exterior"),
    classification: "review",
    reason:
      "Exterior painting alone is typically deductible, but if bundled with structural work it becomes an improvement. Flagged for review of scope.",
    ruleCitation: "IRS Pub 527 §3.02, repair vs. improvement test",
  },
  {
    test: (d) => d.includes("paint"),
    classification: "review",
    reason:
      "Painting scope is unclear; routine refreshing is deductible while a full repaint tied to a renovation is capitalized. Flagged for review.",
    ruleCitation: "IRS Pub 527 §3.02, repair vs. improvement test",
  },
  {
    test: (d) => d.includes("lawn care") || d.includes("mowing"),
    classification: "deductible",
    reason: "Routine lawn/grounds care. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) => d.includes("landscaping"),
    classification: "review",
    reason:
      "Landscaping can be deductible (routine grounds maintenance) or capitalized (new garden design, hardscaping). Scope unclear — flagged for review.",
    ruleCitation: "IRS Pub 527 §3.02, repair vs. improvement test",
  },
  {
    test: (d) => d.includes("management"),
    classification: "deductible",
    reason: "Property management expense; reduces taxable rental income.",
    ruleCitation: "IRS Pub 527 §3.02, current expenses",
  },
  {
    test: (d) => d.includes("insurance"),
    classification: "deductible",
    reason: "Property/liability insurance premium; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, current expenses",
  },
  {
    test: (d) => d.includes("property tax") || d.includes("real estate tax"),
    classification: "deductible",
    reason: "Annual real estate tax bill; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, current expenses",
  },
  {
    test: (d) =>
      d.includes("advertising") ||
      d.includes("tenant-finding") ||
      d.includes("tenant finding") ||
      d.includes("tenant ad") ||
      d.includes("zillow") ||
      d.includes("craigslist"),
    classification: "deductible",
    reason: "Cost of finding tenants; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, current expenses",
  },
  {
    test: (d) => d.includes("legal") || d.includes("accounting"),
    classification: "deductible",
    reason:
      "Legal/accounting fees related to the rental activity; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, current expenses",
  },
  {
    test: (d) => d.includes("condo fee") || d.includes("hoa fee") || d.includes("hoa"),
    classification: "deductible",
    reason: "Monthly HOA/condo assessment; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, current expenses",
  },
  {
    test: (d) => d.includes("pest control"),
    classification: "deductible",
    reason: "Routine pest control; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) => d.includes("gutter"),
    classification: "deductible",
    reason: "Gutter cleaning/repair is routine upkeep. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) => d.includes("lightbulb") || d.includes("light bulb"),
    classification: "deductible",
    reason: "Minor consumable replacement; routine upkeep. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) => d.includes("cleaning"),
    classification: "deductible",
    reason: "Routine cleaning; fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
  {
    test: (d) =>
      d.includes("parking lot seal") ||
      d.includes("seal coat") ||
      (d.includes("parking") && d.includes("seal")),
    classification: "deductible",
    reason:
      "Sealcoating/resurfacing upkeep of an existing parking lot; routine maintenance. Fully deductible.",
    ruleCitation: "IRS Pub 527 §3.02, routine maintenance",
  },
];
