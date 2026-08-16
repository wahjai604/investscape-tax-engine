# US Tax Strategies Engine (E68–E70) — Sourced Numbers

**As of August 2026.** Opportunity Zone rules already changed materially once this year (OBBBA replaced the original 2017 TCJA regime with a permanent framework); several figures below may change again with future legislation or updated IRS guidance. Re-verify before treating any number here as current.

This document exists because `src/utils/constants.ts` intentionally holds no comments explaining *why* a value is what it is — that context lives here, one entry per constant, so a future editor changing a number knows what they're changing and why.

---

## E68: Section 1031 Like-Kind Exchange

| Constant | Value | Source & rationale |
|---|---|---|
| `SECTION_1031_IDENTIFICATION_DEADLINE_DAYS` | 45 | IRC §1031(a)(3)(A). Calendar days from the relinquished property's closing date. **Not extended** for weekends, holidays, or any other reason — a hard statutory deadline. |
| `SECTION_1031_EXCHANGE_DEADLINE_DAYS` | 180 | IRC §1031(a)(3)(B). Calendar days from the same closing date, running **concurrently** with the 45-day identification window (not sequentially — the exchange does not get 180 days *after* day 45). Capped by the taxpayer's tax-return due date (including extensions) when that date is earlier. |

**Boot model — a documented simplification.** This engine treats "reinvest all net equity" and "replace at least as much debt" as two **independent** requirements: an unreinvested-equity shortfall and an under-replaced-debt shortfall are summed directly (`bootAmount = equityShortfall + debtShortfall`). Real IRS practice (Treas. Reg. §1.1031(b)-1) allows additional cash contributed into the replacement property to offset a debt-relief (mortgage) boot dollar-for-dollar — this engine does not model that offset. In practice this means the engine can report boot in a scenario where a real 1031 exchange, structured with extra cash specifically to cover a debt reduction, would owe less or none. This is a conservative simplification, not an error in the two components' individual math; a qualified intermediary should be consulted for the actual offset calculation on any real exchange with a debt shortfall.

**Recognized-gain characterization order** (depreciation recapture first, then capital gain) follows Treas. Reg. §1.1031(b)-1's ordering rule and IRC §1250/§1245 recapture treatment.

---

## E69: Cost Segregation

| Constant | Value | Source & rationale |
|---|---|---|
| `COST_SEG_LTR_BENCHMARK_MEDIAN` | 17.6% | Median % of building cost basis reclassified into accelerated (5/7/15-year) categories, unfurnished long-term-rental single-family, per 2026 cost segregation industry benchmark data. |
| `COST_SEG_STR_BENCHMARK_MEDIAN` | 30.4% | Same benchmark, short-term rental — meaningfully higher because STR properties carry proportionally more 5-year personal property (furniture, appliances, short-life fixtures) relative to the building shell. Deliberately a **separate** constant from the LTR median, not a shared default, because the two property types have structurally different componentization. |
| `COST_SEG_FIVE_YEAR_SHARE_AVERAGE` / `_LOW` / `_HIGH` | 16.3% (5%–33%) | Average share of building cost basis allocated to the 5-year MACRS category across published cost segregation studies, generic across property types (not itself split by LTR/STR). |
| `COST_SEG_FIFTEEN_YEAR_SHARE_AVERAGE` / `_LOW` / `_HIGH` | 11.4% (0%–68%) | Same, for the 15-year category (land improvements — paving, landscaping, fencing). |
| `MACRS_FIVE_YEAR_FIRST_YEAR_RATE` | 20.0% | IRS Pub 946, MACRS half-year convention, 200% declining balance, 5-year property, year 1. Stable published government table, not expected to change with tax legislation the way OZ rules do. |
| `MACRS_FIFTEEN_YEAR_FIRST_YEAR_RATE` | 5.0% | IRS Pub 946, MACRS half-year convention, 150% declining balance, 15-year property, year 1. |

**How the property-use median and the category shares combine.** The source data publishes two *different* statistics that don't reconcile to each other by construction: a property-use-specific **total** reclassification median (17.6% / 30.4%), and a generic **per-category** share average (16.3% five-year, 11.4% fifteen-year — these sum to 27.7%, which is neither headline number). This engine treats the property-use median as the total percentage of basis to reclassify, and splits it between the 5-year and 15-year buckets **proportionally**, using the 16.3:11.4 ratio from the category-share data:

```
fiveYearPercent = totalMedian × (16.3 / (16.3 + 11.4))
fifteenYearPercent = totalMedian × (11.4 / (16.3 + 11.4))
```

This is a deliberate interpolation to make two genuinely-sourced but non-additive statistics usable together, not a third independently-sourced number. `benchmarkRangeUsed.low`/`.high` in the result are the sum of the two categories' published low/high bounds (5% + 0% = 5% low; 33% + 68% capped at 100% high) — a real range drawn from the source data, not the property-use median's own (unpublished) variance.

**Commercial property has no verified benchmark.** The source data covers only long-term and short-term residential rental. Rather than guess a commercial default, `costSegregation()` throws when `propertyUse === "commercial"` and `useBenchmarkDefault` is true, consistent with this repo's existing convention (see E47's bracket-lookup behavior in `DISCLAIMER.md`) that a wrong number is worse than a clear error. Commercial cost segregation requires `customFiveYearPercent`/`customFifteenYearPercent` from a real study.

**7-year property is not separately tracked.** A real cost segregation study may also allocate basis to 7-year MACRS property; this engine's result type only exposes `fiveYearReclassified` and `fifteenYearReclassified`, so any 7-year amount in a real study should be folded into whichever bucket is the closer match, or the engine should be extended with a `sevenYearReclassified` field if this becomes a frequent need.

---

## E70: Opportunity Zones

| Constant | Value | Source & rationale |
|---|---|---|
| `OZ_LEGACY_DEADLINE` | 2026-12-31 | OZ 1.0 (original 2017 TCJA regime). A **fixed calendar date**, not relative to the investment date — every legacy OZ investor's deferred gain becomes recognized on this date regardless of when they invested. |
| `OZ_ROLLING_DEFERRAL_YEARS` | 5 | OZ 2.0 (permanent regime, post-2026 OBBBA legislation). Deferred gain is recognized 5 years after the **investment date**, a rolling window rather than a fixed calendar deadline. |
| `OZ_STANDARD_STEPUP` | 10% | Standard basis step-up under the permanent regime. |
| `OZ_RURAL_STEPUP` | 30% | Enhanced basis step-up for investments in a newly-created "Qualified Rural Opportunity Zone" — a permanent-regime-only category. |
| `OZ_STANDARD_IMPROVEMENT_THRESHOLD` | 100% | Standard substantial-improvement requirement: qualifying basis must be doubled (100% of the pre-improvement basis added in improvements) within the statutory period. |
| `OZ_RURAL_IMPROVEMENT_THRESHOLD` | 50% | Reduced substantial-improvement threshold for Qualified Rural Opportunity Zones under the permanent regime — recognizing that rural rehabilitation costs are harder to justify at the standard 100% bar. |

**Regime is always an explicit input, never inferred.** `opportunityZones()` reads `input.regime` and nothing else to decide which deadline rule applies — it never branches on the current date. This is deliberate: a real investment made under the legacy regime keeps its original 2026-12-31 deadline forever, even after the permanent regime exists and even when this engine is called years later. Inferring regime from "is today after the legislation's effective date" would silently recalculate historical investments under the wrong rule.

**`basisStepUpPercent` reflects entitlement design, not current substantiation.** The field always reports the statutory rate for the QOZ category chosen (`isRuralQOZ`), whether or not the substantial-improvement threshold has actually been met yet. Whether that rate is currently earned is reported separately via `meetsSubstantialImprovementThreshold` and, when not met, a typed entry in `issues[]` — so a rural QOZ claiming the 30% step-up without having completed 50% of the required improvement work surfaces as a visible issue rather than silently passing or silently downgrading to a different number.

---

## Verification checklist for a future editor

Before relying on any figure in this document or `constants.ts` for a real filing:

- [ ] Re-check `OZ_LEGACY_DEADLINE` and the permanent-regime rules against current IRS/Treasury guidance — this is the area most likely to have moved since August 2026.
- [ ] Re-check the cost segregation benchmark medians (17.6% / 30.4%) against the current-year edition of the source industry study; these are national averages that drift year to year.
- [ ] MACRS first-year rates (`MACRS_FIVE_YEAR_FIRST_YEAR_RATE`, `MACRS_FIFTEEN_YEAR_FIRST_YEAR_RATE`) are stable IRS Pub 946 table values and are the least likely to have changed.
- [ ] The 1031 boot simplification (no cash-offsets-debt-boot modeling) should be flagged to any user with a debt shortfall on a real exchange — point them to a qualified intermediary rather than trusting `bootAmount` as final.
