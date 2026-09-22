# Cross-Border Withholding Engine (E83) — Sourced Numbers

**As of August 2026.** All four rates below are current statutory/regulatory defaults verified against IRS guidance, CRA guidance, and the underlying statutes at the time this document was written. Withholding tax law is not immune to future legislative or treaty change — re-verify before treating any figure here as current for a real filing.

This document exists because `src/utils/constants.ts` intentionally holds no comments explaining *why* a value is what it is — that context lives here, one entry per constant, so a future editor changing a number knows what they're changing and why. See `docs/US-TAX-STRATEGIES-SOURCES.md` for the equivalent document covering E68-E70.

---

## Scope

E83 (`calculateCrossBorderWithholding`) is scoped to **Canada <-> US only**, matching every other jurisdiction this codebase supports (`"CA" | "US"` throughout E46-E53, E68-E70). It covers the four directional cases that combination of two countries and two transaction types produces:

| Investor home | Property country | Transaction | Regime |
|---|---|---|---|
| Canada | US | `sale_proceeds` | FIRPTA (IRC §1445) |
| Canada | US | `rental_income` | FDAP / §871(d) election |
| US | Canada | `sale_proceeds` | Section 116 (ITA §116) |
| US | Canada | `rental_income` | Part XIII / Section 216 election |

Same-country inputs (`investorHomeCountry === propertyCountry`) return a zero-rate result with an explanatory `issues` entry rather than throwing — a caller shouldn't have to pre-filter domestic transactions before calling this engine.

---

## FIRPTA (Foreign Investment in Real Property Tax Act) — US property, non-resident seller

| Constant | Value | Source & rationale |
|---|---|---|
| `FIRPTA_STANDARD_WITHHOLDING_RATE` | 15% | IRC §1445(a). The rate was 10% for dispositions before February 17, 2016; the current rate has been 15% since then. Applied to the **amount realized (gross sales price)**, not the gain — the buyer/transferee is the withholding agent and remits via Form 8288/8288-A within 20 days of transfer. |
| `FIRPTA_RESIDENCE_EXEMPTION_THRESHOLD` | $300,000 | IRC §1445(b)(5). At or below this amount realized, withholding is **0%** if the buyer intends to use the property as a residence (the 50%-use test: the buyer or a family member must use the property for at least 50% of the days it is used during each of the first two 12-month periods after transfer). |
| `FIRPTA_REDUCED_WITHHOLDING_RATE` | 10% | IRC §1445(c)(4). Applies when the amount realized is strictly above $300,000 and up to (and including) $1,000,000, with the same buyer residence-intent test as the exemption. |
| `FIRPTA_REDUCED_RATE_UPPER_THRESHOLD` | $1,000,000 | IRC §1445(c)(4). Above this amount, the standard 15% rate applies regardless of the buyer's residence intent. |

**The residence test is about the buyer, not the seller/investor.** `buyerIntendsUseAsResidence` is a fact about the transaction's buyer — a seller's own residency status is irrelevant to which FIRPTA tier applies; it's what triggers FIRPTA in the first place (FIRPTA only applies because the *seller* is a foreign person). This engine takes `buyerIntendsUseAsResidence` as a caller-supplied boolean rather than evaluating the 50%-use test itself, mirroring how E53's PAL engine takes `real_estate_professional` as a boolean rather than running the underlying multi-factor test (see `DISCLAIMER.md`).

**Form 8288-B (`useNetBasisElectionOrCertificate` on a sale) — a documented simplification.** In practice, a transferor (or transferee) can apply to the IRS for a withholding certificate on Form 8288-B, and the IRS approves withholding at an amount matching the seller's actual anticipated tax liability — not simply the statutory rate applied to the estimated gain. This engine approximates the certificate-basis withholding as `applicableRate × estimatedGainOrNetIncome`, which is **not** the IRS's own computation (which can account for basis, depreciation recapture character, and the seller's specific tax situation in more detail). The engine surfaces this as an `issues` entry whenever the certificate path is used, and the actual approved 8288-A amount should always be used over this engine's estimate once issued.

---

## Section 116 (Income Tax Act) — Canadian property, non-resident seller

| Constant | Value | Source & rationale |
|---|---|---|
| `SECTION_116_WITHHOLDING_RATE` | 25% | Income Tax Act (Canada) §116, per CRA Information Circular IC72-17R6 ("Procedures Concerning the Disposition of Taxable Canadian Property by Non-Residents of Canada"). Applied to **gross proceeds** by the purchaser, absent a clearance certificate, regardless of the vendor's actual gain or loss. |

**Real Section 116 clearance-certificate mechanics differ from a simple rate-on-gain calculation.** In practice, the non-resident vendor applies to CRA (Form T2062/T2062A) before or shortly after closing, remits (or secures) Canadian tax on the actual computed capital gain, and CRA issues a certificate specifying the amount the purchaser need not withhold — CRA's stated processing target is 6-8 weeks, so real transactions apply 30-45+ days before a fixed closing date. This engine approximates the certificate-basis withholding as `SECTION_116_WITHHOLDING_RATE × estimatedGainOrNetIncome` when `useNetBasisElectionOrCertificate` is set, which is a simplification of the real remittance/certificate process, not a model of CRA's actual computation. Surfaced via `issues` whenever this path is used.

**"Excluded property" is not modeled.** Certain dispositions (e.g., property that is not "taxable Canadian property" under the treaty-modified definition) may fall outside Section 116 entirely. This engine does not evaluate excluded-property status — every Canadian-property sale by a US-resident investor is assumed to be a real Section 116 disposition. A caller with a genuinely excluded disposition should not rely on this engine's `SECTION_116` result.

---

## Part XIII (Income Tax Act) — Canadian rental income paid to a non-resident

| Constant | Value | Source & rationale |
|---|---|---|
| `PART_XIII_WITHHOLDING_RATE` | 25% | Income Tax Act (Canada) Part XIII. Applied to **gross rental income** by the payer/agent, absent a Section 216 election (or an approved NR6 to withhold on net rent during the year). |

**Section 216 election (`useNetBasisElectionOrCertificate` on rental income) — a documented simplification.** Subsection 216(1) lets a non-resident file a full Canadian return (Form T1159) and pay Part I tax on **net** rental income at graduated resident-style federal + provincial rates, instead of 25% of gross. This engine approximates that election as `investorMarginalTaxRate × estimatedGainOrNetIncome` — a single supplied marginal rate applied to a single supplied net-income figure — rather than modeling Canada's actual federal+provincial bracket schedule for a non-resident filer (which this engine's E47 personal-income-tax module only covers for BC/ON residents in any case, not non-resident Section 216 filers). The real T1159 result may differ, and any excess withheld during the year is refundable on filing. Surfaced via `issues` whenever this path is used.

**NR6 is not separately modeled.** A non-resident who files Form NR6 (and has it approved) can have their agent withhold 25% of *net* rent throughout the year, ahead of the year-end Section 216 return, as a cash-flow mechanism — this is an intermediate step between the gross default and the final Section 216 outcome. This engine only models the two endpoints (gross-25% default vs. elected-net-at-marginal-rate), not the NR6 intermediate withholding basis.

---

## FDAP / §871(d) — US rental income paid to a nonresident alien

| Constant | Value | Source & rationale |
|---|---|---|
| `US_FDAP_RENTAL_WITHHOLDING_RATE` | 30% | IRC §871(a) (FDAP income) via §1441 withholding. US-source rental income paid to a nonresident alien not effectively connected with a US trade or business is FDAP income, taxed at a flat 30% of **gross** rent with no expense deductions, absent a §871(d) election. |

**The Canada-US Tax Treaty does not reduce this rate for real property rental income.** Unlike dividend/interest withholding (which the treaty often reduces), Article VI of the Canada-US Tax Treaty preserves each country's right to tax real property income under its own domestic law — there is no treaty-reduced rate below 30% for US rental income paid to a Canadian resident. This engine therefore applies the full 30% statutory rate with no treaty adjustment, and does not need a separate treaty-rate constant.

**§871(d) election — the analogous simplification to Section 216.** A nonresident alien can elect (by attaching a statement to Form 1040-NR) to treat net rental income as effectively connected income, taxed at graduated US rates with full expense deductions, instead of 30% of gross. This engine approximates that election the same way as the Canadian side: `investorMarginalTaxRate × estimatedGainOrNetIncome`, rather than modeling the actual US federal (and any applicable state) bracket schedule for a nonresident-alien filer. Surfaced via `issues` whenever this path is used.

---

## `foreignTaxCreditEligible` / `fullyOffsetsDoubleTaxation` — the honest gap

**`foreignTaxCreditEligible` is a principle-level flag, not a computed credit.** It is `true` for all four cross-border regimes above (`false` only for the same-country no-op case) because FIRPTA, Section 116, Part XIII, and §871(d)/FDAP withholding are all genuine foreign **income** taxes, and both countries' domestic foreign-tax-credit provisions (IRC §901 for the US; Income Tax Act §126 for Canada) — reinforced by the Canada-US Tax Treaty's double-taxation relief provisions (Article XXIV) — generally treat this class of withholding as creditable in the investor's home country.

**`fullyOffsetsDoubleTaxation` is deliberately always `false`.** Whether a foreign tax credit *actually* eliminates double taxation on a given transaction depends on:

1. The investor's home-country tax liability on the **same** income (which this engine does not compute — that requires running the actual sale/rental income through the investor's full home-country return, including any applicable engines from E46-E53/E68-E70, at the investor's actual marginal rate and full facts).
2. **Treaty sourcing and characterization rules** (Canada-US Tax Treaty Article XXIV and related provisions) that determine which country's tax is "first" and how the credit is limited.
3. **Domestic FTC limitation mechanics** — the US limits foreign tax credits by income category via Form 1116 (the credit generally cannot exceed the US tax otherwise due on the same foreign-source income); Canada applies its own federal-plus-provincial FTC limitation under ITA §126. Excess foreign tax paid beyond either limit may not be creditable in the year (though carryback/carryforward may apply).

None of this is modeled. Per this codebase's existing "throw/disclose rather than fabricate" convention (see E68's boot-model disclosure and E70's substantial-improvement-threshold disclosure), `fullyOffsetsDoubleTaxation: false` combined with a specific `issues[]` entry is the honest result — a hardcoded `true` would silently promise complete double-tax relief that depends on facts this engine never sees.

---

## Verification checklist for a future editor

- [ ] Re-check the FIRPTA thresholds (`$300,000` / `$1,000,000`) and rates (15% / 10% / 0%) against current IRS guidance — these are statutory dollar amounts, not inflation-indexed, but Congress can amend IRC §1445 directly.
- [ ] Re-check `SECTION_116_WITHHOLDING_RATE` and `PART_XIII_WITHHOLDING_RATE` against current CRA guidance (IC72-17R6 and the CRA non-resident withholding pages) — both are long-standing 25% statutory rates but CRA administrative practice around clearance-certificate processing times drifts.
- [ ] Re-check `US_FDAP_RENTAL_WITHHOLDING_RATE` and the treaty-non-reduction claim against the current Canada-US Tax Treaty text if a treaty protocol is ever renegotiated.
- [ ] The Form 8288-B / Section 116 clearance-certificate / Section 216 / §871(d) "election-basis" approximations (`rate × estimatedGainOrNetIncome` or `investorMarginalTaxRate × estimatedGainOrNetIncome`) are all documented simplifications, not the issuing agency's actual computation — flag this to any user relying on the certificate/election path for a real filing, and point them to a cross-border tax professional for the actual approved/computed amount.
- [ ] `fullyOffsetsDoubleTaxation` is intentionally never `true` in this version of the engine — if a future version adds real home-country tax and FTC-limitation modeling, this checklist item (and the corresponding `issues` entry) should be revisited rather than just flipping the flag.
