/**
 * @license Closed-Source License Keys (InvestScape)
 * @copyright 2026 Lighthouse Research Ltd. DBA InvestScape
 *
 * This module is part of the InvestScape formula engine library.
 * Use is restricted to licensed InvestScape subscribers (S2+).
 * Unauthorized copying, distribution, or use is prohibited.
 *
 * Licensing: https://investscape.com/licensing
 * Contact: licensing@investscape.com
 */

import {
  OZ_LEGACY_DEADLINE,
  OZ_RURAL_IMPROVEMENT_THRESHOLD,
  OZ_RURAL_STEPUP,
  OZ_ROLLING_DEFERRAL_YEARS,
  OZ_STANDARD_IMPROVEMENT_THRESHOLD,
  OZ_STANDARD_STEPUP,
} from "./utils/constants";
import { addYearsISO } from "./utils/dateMath";
import type { OpportunityZoneInput, OpportunityZoneResult } from "./taxTypes";

const DISCLAIMER =
  "Opportunity Zone rules changed materially in 2026 (OBBBA) and may change again; regime is taken as an explicit input and is never inferred from today's date. This calculation is advisory only — consult a qualified tax professional and confirm current QOZ designations before relying on it for filing.";

/**
 * E70: Opportunity Zones Engine (US only).
 *
 * Implements both regimes explicitly, selected by the caller via
 * `input.regime` — never inferred from the current date, so a real
 * investment made under the legacy regime keeps its original fixed deadline
 * even after the permanent regime exists and even when this engine runs
 * years later. `basisStepUpPercent` reflects the statutory rate the QOZ
 * category (rural vs. standard) is designed for; whether that rate is
 * currently substantiated is reported separately via
 * `meetsSubstantialImprovementThreshold` and `issues`, so a rural QOZ
 * claiming the 30% step-up without meeting the reduced 50% improvement
 * threshold surfaces as a typed issue rather than a silent pass.
 */
export function opportunityZones(input: OpportunityZoneInput): OpportunityZoneResult {
  const { regime, investmentDate, isRuralQOZ, substantialImprovementCompletedPercent } = input;

  const deferralRecognitionDate =
    regime === "legacy_2017"
      ? OZ_LEGACY_DEADLINE
      : addYearsISO(investmentDate, OZ_ROLLING_DEFERRAL_YEARS);

  const basisStepUpPercent = isRuralQOZ ? OZ_RURAL_STEPUP : OZ_STANDARD_STEPUP;
  const applicableImprovementThreshold = isRuralQOZ
    ? OZ_RURAL_IMPROVEMENT_THRESHOLD
    : OZ_STANDARD_IMPROVEMENT_THRESHOLD;
  const meetsSubstantialImprovementThreshold =
    substantialImprovementCompletedPercent >= applicableImprovementThreshold;

  const issues: string[] = [];
  if (!meetsSubstantialImprovementThreshold) {
    const category = isRuralQOZ ? "rural QOZ" : "standard QOZ";
    issues.push(
      `Substantial improvement is ${(substantialImprovementCompletedPercent * 100).toFixed(1)}% complete, below the ${(applicableImprovementThreshold * 100).toFixed(0)}% threshold required for a ${category}; the ${(basisStepUpPercent * 100).toFixed(0)}% basis step-up is not yet substantiated.`
    );
  }

  return {
    deferralRecognitionDate,
    basisStepUpPercent,
    meetsSubstantialImprovementThreshold,
    applicableImprovementThreshold,
    jurisdiction: "US",
    calculatedAt: new Date().toISOString(),
    inputs: input,
    issues,
    disclaimer: DISCLAIMER,
  };
}
