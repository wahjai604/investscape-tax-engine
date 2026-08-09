# Legal Disclaimers

**InvestScape Tax Engine (E46–E53)**

© 2026 Lighthouse Research Ltd. DBA InvestScape. All rights reserved.

---

## ⚠️ NOT TAX OR FINANCIAL ADVICE

**The InvestScape Tax Engine is for informational purposes only.** It is NOT:

- A substitute for professional tax advice
- A substitute for professional financial advice
- Tax planning advice
- Investment advice
- Legal advice

**This Software does not:**

- Prepare tax returns
- Create tax filing documents
- Replace certified accountants, tax professionals, or lawyers
- Guarantee tax accuracy or compliance

---

## Consult a Tax Professional

**You must consult with a qualified tax professional (CPA, tax attorney, or tax accountant) before:**

1. Making investment decisions based on tax calculations
2. Filing taxes
3. Planning capital gains or losses
4. Relying on output for business decisions
5. Using outputs in any legal or regulatory context

---

## Limitations & Assumptions

### Calculation Limitations

The Software makes the following assumptions:

1. **Input data is accurate** — Garbage in, garbage out. Verify all property costs, income, and loan terms.
2. **No changes to tax law** — Tax rates, brackets, and rules reflect the 2026 figures built into this version; future law changes are not incorporated automatically.
3. **No state-specific nuances** — Some states and provinces have unique rules not captured in the general model (see "Jurisdictional Coverage" below for exactly which are and aren't implemented).
4. **No entity-structure analysis** — The Software does not optimize for LLC, S-Corp, C-Corp, or partnership structures.
5. **No comprehensive tax planning** — The Software calculates tax on given scenarios; it does not automatically suggest tax-minimization strategies (E53's harvesting analysis is the one exception, and it is explicitly informational — see below).
6. **No currency conversion** — All amounts are expected to already be in the correct native currency for the jurisdiction (CAD for Canada, USD for the US). The Software does not fetch exchange rates or convert between currencies.

### Jurisdictional Coverage

This library deliberately **throws a clear error rather than silently guessing** when it's asked to calculate something for a province, state, or municipality it doesn't have verified rate data for. That means coverage is real and narrower than "all provinces / all states" — treat the table below, not marketing copy, as the source of truth on what's actually implemented.

| Engine | What varies by sub-jurisdiction | Verified coverage |
|--------|----------------------------------|--------------------|
| **E47 Personal Income Tax** | Provincial/state tax brackets | **Canada:** BC, ON only. **US:** AZ, CA, plus 8 states with no state income tax (AK, FL, NV, SD, TN, TX, WA, WY). Any other province/state throws rather than guessing. |
| **E52 GST/HST & Dev Charges** | GST/HST rate | **All 10 Canadian provinces** — this is a fixed rate table, not a lookup gap. |
| **E52 GST/HST & Dev Charges** | Development-charge *default* (only used if you don't supply `devChargeRatePerUnit` yourself) | Several major municipalities (Toronto, Vancouver, Calgary, Edmonton, Montreal, Winnipeg) plus a province-level fallback for most provinces. Saskatchewan has no verified default and will throw unless you pass a rate explicitly. |
| **E46, E48, E49, E50, E51, E53** | N/A — these engines don't do province/state-specific rate lookups | Operate uniformly across `jurisdiction: "CA" \| "US"`; province/state fields (where present) are contextual only. |

**If you operate in a jurisdiction not covered above for E47 or E52's dev-charge defaults, the Software will throw a clear error. Do not work around that error by guessing a substitute rate without professional verification.**

---

## Tax Rule Accuracy

### Canada

The Software implements:
- **CRA Folio S4-F2-C1** (Property Income) — used for E50's repair-vs-improvement classification
- **CCA declining-balance** (Class 1 @ 4%, half-year rule) — E48
- **Federal + BC/ON tax brackets** (2026 rates) — E47; see jurisdictional coverage above for other provinces
- **GST/HST rates** (5%–14.975% depending on province) — E52

However:
- Tax law changes frequently; verify rules before relying on outputs.
- Provinces outside BC/ON have no bracket data loaded yet (E47 will throw, not guess).
- Anti-avoidance rules (GAAR) are not modeled.

### US

The Software implements:
- **IRS Pub 527** (Rental Property Tax Guide) — used throughout E50
- **IRC §469** (Passive Activity Loss limits) — E53
- **MACRS depreciation** (27.5yr residential, 39yr commercial) — E48
- **Federal tax brackets** (2026 rates), plus AZ/CA state brackets and the 8 no-income-tax states — E47; see jurisdictional coverage above for other states

However:
- State-level variations (tax-loss limitations, surcharges) beyond AZ/CA are not modeled.
- Alternative Minimum Tax (AMT) is not calculated.
- Qualified Business Income (QBI) deduction is not optimized.
- Net Investment Income Tax (3.8%) is not applied.

---

## Passive Activity Loss (PAL) Disclaimer

**PAL is one of the most complex tax rules.** The Software (E53) implements basic PAL logic, but:

1. **Material participation tests** (IRC §469(c)(7)(A)–(G)) are complex; the Software accepts a boolean flag (`materially_participates`) rather than running the underlying multi-factor tests itself.
2. **Real estate professional status** requires specific hour/income tests; the Software accepts this as a boolean (`real_estate_professional`) rather than evaluating it.
3. **Suspended loss calculations** assume simple chronological carryforward tracking; multi-property and entity structures may require different treatment.
4. **Harvesting suggestions** are informational only; consult a tax professional before executing any harvesting strategy.

---

## Tax Harvest & Loss Harvesting

**Tax harvesting is NOT automatic.** E53 calculates the arithmetic of using suspended losses against a proposed sale, but:

1. **Wash-sale rules** and other timing restrictions are not enforced.
2. **Market conditions** and sale timing are the user's responsibility.
3. **State-specific rules** (e.g., loss limitations) may override the federal-level numbers shown.
4. **Audit risk** — Aggressive loss harvesting can draw IRS scrutiny; this Software does not assess that risk.

**Do NOT rely on harvesting suggestions without professional advice.**

---

## Depreciation Recapture

**The Software (E48) calculates depreciation recapture, but:**

1. **§1250 recapture** (US) assumes the 25% federal cap; state recapture rates are not applied.
2. **Canada CCA recapture** is treated as fully ordinary income taxed at the investor's marginal rate; no special capital-gains treatment is modeled.
3. **FIRPTA** (foreign investor withholding rules) is not modeled.
4. **Installment sale rules** (§453) are not modeled for deferred gain recognition.

---

## Accuracy Not Guaranteed

**While the Software is tested (100% code coverage, 125 tests as of this writing), it is not guaranteed to be accurate for:**

1. Edge cases (unusual property types, unusual financing)
2. Multi-property portfolios with complex interdependencies
3. Entities with multiple owners or partnerships
4. International investors or properties
5. Properties with unusual cost structures (development, conversion, etc.)
6. Any province, state, or municipality outside the verified list in "Jurisdictional Coverage" above

**Verify all outputs with a qualified tax professional before using for any financial decision.**

---

## Liability Waiver

**Lighthouse Research Ltd. is NOT liable for:**

1. Incorrect tax calculations
2. Missed deductions
3. Overpayment of taxes
4. Audit liability
5. Penalties or interest incurred due to reliance on the Software
6. Business decisions made based on Software outputs
7. Any damages arising from use of the Software

---

## Your Responsibility

**By using the Software, you acknowledge that:**

1. You have read and understood these disclaimers.
2. You will consult a tax professional before taking any action based on Software outputs.
3. You are solely responsible for the accuracy of your input data.
4. You will not rely on the Software as a substitute for professional advice.
5. Lighthouse Research Ltd. is not responsible for consequences arising from use of the Software.

---

## Updates & Changes

Lighthouse Research Ltd. reserves the right to:

1. Update tax rates and brackets at any time (subject to subscription terms)
2. Change the Software's functionality
3. Discontinue the Software with 30 days' notice to subscribers
4. Update these disclaimers without notice

---

## Contact

For questions about these disclaimers or the Software's accuracy:

- **Email:** support@investscape.com
- **Website:** https://investscape.com

---

**Last Updated:** August 8, 2026

**© 2026 Lighthouse Research Ltd. DBA InvestScape. All rights reserved.**
