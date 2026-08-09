# InvestScape Tax Engine (E46–E53)

**Proprietary Real Estate Investment Tax Calculation Suite**

© 2026 Lighthouse Research Ltd. DBA InvestScape. All rights reserved.

---

## Overview

The InvestScape Tax Engine is a jurisdiction-aware real estate investment and developer tax calculation library. It comprises 8 specialized modules (E46–E53) that compute:

- **Rental income aggregation** (E46)
- **Personal income tax** with progressive brackets (E47)
- **Depreciation & recapture** (CCA declining-balance for Canada, MACRS for US) (E48)
- **Mortgage interest deduction** (E49)
- **Operating expense classification** (deductible vs. capitalized) (E50)
- **Developer profit & tax** (active income, no PAL limits) (E51)
- **GST/HST & development charges** (Canada-only) (E52)
- **Passive activity loss limits & tax harvesting** (US-only) (E53)

This library powers InvestScape's real-time tax impact analysis for both real estate investors and developers across Canada and the United States.

---

## Architecture

### Engine Hierarchy

```
E46: Tax Aggregation (foundational pool)
 ├─ E47: Personal Income Tax (applies marginal rates)
 ├─ E48: Depreciation & Recapture (capital cost allowance)
 ├─ E49: Mortgage Interest Deduction (amortization)
 ├─ E50: Operating Expense Classification (deductible vs. capitalized)
 ├─ E51: Developer Profit & Tax (active income, Canada/US)
 ├─ E52: GST/HST & Dev Charges (Canada-only)
 └─ E53: Passive Activity Loss & Harvesting (US-only)
```

### Test Coverage

- **125 tests** across all 8 engines
- **100% code coverage** (statements, branches, functions, lines) on every module
- All test suites currently passing on a clean `tsc` build

### Technology Stack

- **Language:** TypeScript (strict mode)
- **Testing:** Jest + ts-jest
- **Build:** Node.js v24+, npm 12+
- **Quality:** 100% test coverage, clean `tsc` build

---

## Installation

```bash
git clone https://github.com/wahjai604/investscape-tax-engine.git
cd investscape-tax-engine
npm install
npm test
npm run build
```

---

## Usage (License Key Required)

This library is **closed-source and requires a valid InvestScape subscription license key** to use in production.

### Tier-Based Access

Access is per-engine, not a flat "everything below this tier" cutoff — several engines are restricted regardless of tier because of who they're for (developers vs. investors) or where they apply (Canada vs. US), not just subscription level:

| Engine | Minimum Tier | Notes |
|--------|-------------|-------|
| E46 Tax Aggregation | S1 | |
| E47 Personal Income Tax | S1 | |
| E48 Depreciation & Recapture | S1 | |
| E49 Mortgage Interest Deduction | S1 | |
| E50 Operating Expense Deduction | S1 Pro+ | Pro: read-only; Team/Enterprise: full |
| E51 Developer Profit & Tax | S3 Enterprise only | Developers only, not investors |
| E52 GST/HST & Dev Charges | S3 Enterprise only | Canada-only, developers only |
| E53 Passive Activity Loss & Harvesting | S2 Team+ | Team: read-only; Enterprise: full |

Confirm current pricing and tier boundaries with the licensing team before publishing externally — engine-to-tier mapping is source-of-truth in each engine's own build spec, not duplicated here as a price sheet.

### API Example (with valid license key)

```typescript
import { taxAggregation, personalIncomeTax } from "investscape-tax-engine";

// E46: build the rental income pool for a Canadian investor
const aggregation = taxAggregation({
  properties: [
    {
      address: "123 Main St, Vancouver, BC",
      rentalIncome: 36000,
      rentalExpenses: 9000,
      mortgageInterestPaid: 14000,
      mortgagePrincipal: 6000,
      depreciation: 9000,
    },
  ],
  jurisdiction: "CA",
  province: "BC",
  filingStatus: "single",
  otherIncome: 80000,
  year: 2026,
});

// E47: apply marginal tax rates to the resulting taxable income
const taxResult = personalIncomeTax({
  totalIncome: aggregation.totalIncome,
  jurisdiction: "CA",
  province: "BC",
  filingStatus: "single",
  year: 2026,
});

console.log(`Marginal tax rate: ${taxResult.marginalTaxRate}`);
```

---

## Architecture & Design

### Multi-Jurisdiction Support

All 8 engines operate on `jurisdiction: "CA" | "US"`. Coverage of *sub-jurisdictions* (provinces/states) varies by engine, deliberately:

- **E47 Personal Income Tax** looks up real progressive bracket tables per province/state and **throws a clear error for any province or state without verified rate data**, rather than guessing. Currently verified: **BC and ON** (Canada); **AZ and CA**, plus 8 states with no state income tax at all (AK, FL, NV, SD, TN, TX, WA, WY). The remaining provinces/states will be added as their bracket data is verified.
- **E52 GST/HST rates** cover **all 10 Canadian provinces** — this is a fixed federal/provincial rate table, not a per-region lookup gap. Its *development-charge default* lookup (used only when a caller doesn't supply `devChargeRatePerUnit` directly) is narrower — verified for several major municipalities and most provinces, with Saskatchewan requiring an explicit rate since no verified default exists for it yet.
- **E48, E49, E50, E51, E53** don't do province/state-specific rate lookups at all — they take `jurisdiction: "CA" | "US"` and, where relevant, a rate/threshold as direct input, so they aren't gated by this bracket-verification process.

This library does **not** perform currency conversion. All dollar amounts are expected to already be in the correct native currency for the jurisdiction (CAD for `"CA"`, USD for `"US"`); there is no FX-rate lookup anywhere in this codebase.

### Compliance References

- **Canada:** CRA Folio S4-F2-C1 (property income, repair vs. improvement), Income Tax Act
- **US:** IRS Pub 527 (rental property), IRC §469 (passive activity loss), §1250 (unrecaptured gain)

These are the citations embedded in each engine's rule tables and outputs (see `ruleCitation` fields in E50, for example) — they document which authority a given calculation is based on, not a guarantee of full compliance. See `DISCLAIMER.md`.

---

## Development

### Running Tests

```bash
npm test                          # Run all tests
npm test -- operatingExpense      # Run one engine's suite (matches by filename)
npm test -- --coverage            # Generate coverage report
npm run build                     # TypeScript compilation
```

### File Structure

```
investscape-tax-engine/
├── src/tax/
│   ├── taxAggregation.ts         (E46)
│   ├── personalIncomeTax.ts      (E47)
│   ├── depreciation.ts           (E48)
│   ├── mortgageInterest.ts       (E49)
│   ├── operatingExpense.ts       (E50)
│   ├── developerProfit.ts        (E51)
│   ├── gstHstDevCharges.ts       (E52)
│   ├── passiveActivityLoss.ts    (E53)
│   ├── taxTypes.ts               (shared types)
│   ├── brackets/                 (E47 tax bracket tables)
│   ├── taxRates/                 (E52 GST/HST rates)
│   ├── devCharges/               (E52 dev charge tables)
│   ├── expenseRules/             (E50 classification rules)
│   └── index.ts                  (exports)
├── tests/tax/
│   ├── *.test.ts                 (test suites)
│   └── fixtures/                 (test data)
├── coverage/                     (coverage reports)
├── dist/                         (compiled output)
├── README.md                     (this file)
├── LICENSE.md                    (license terms)
├── DISCLAIMER.md                 (legal disclaimers)
└── package.json
```

---

## Legal

**This is proprietary, closed-source software.** See `LICENSE.md` and `DISCLAIMER.md` for full terms.

- ⚠️ **Not for Commercial Use** without a valid InvestScape subscription license
- ⚠️ **No Tax or Financial Advice** — use outputs for informational purposes only
- ⚠️ **All Trademarks Protected** — "InvestScape," "Lighthouse Research Ltd." and associated logos are registered trademarks
- ⚠️ **IP Protected** — All formulas, algorithms, and business logic are trade secrets

---

## Contact & Support

- **Licensing:** licensing@investscape.com
- **Support:** support@investscape.com
- **Website:** https://investscape.com

---

## Version

- **Current:** Phase C complete (E46–E53, 125 tests, 100% coverage)
- **Status:** Pre-launch; verify with the product team before treating this as production-ready for external users
- **Last Updated:** August 8, 2026

---

**© 2026 Lighthouse Research Ltd. DBA InvestScape. All rights reserved.**
