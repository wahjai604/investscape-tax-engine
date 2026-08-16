import { costSegregation } from "../../src/E69-cost-segregation";
import {
  longTermRentalBenchmark,
  shortTermRentalBenchmark,
  commercialWithoutOverride,
  commercialWithCustomOverride,
  missingCustomOverride,
} from "./fixtures/costSegregation.fixtures";

describe("E69: Cost Segregation", () => {
  describe("Property-use benchmark defaults diverge", () => {
    it("should apply the long-term-rental median (17.6%) and NOT the short-term-rental median", () => {
      const result = costSegregation(longTermRentalBenchmark);
      expect(result.benchmarkRangeUsed.median).toBe(0.176);
      expect(result.fiveYearReclassified).toBe(103600);
      expect(result.fifteenYearReclassified).toBe(72400);
      expect(result.remainingStraightLine).toBe(824000);
    });

    it("should apply the meaningfully higher short-term-rental median (30.4%) for the same basis", () => {
      const result = costSegregation(shortTermRentalBenchmark);
      expect(result.benchmarkRangeUsed.median).toBe(0.304);
      expect(result.fiveYearReclassified).toBe(178900);
      expect(result.fifteenYearReclassified).toBe(125100);
      expect(result.remainingStraightLine).toBe(696000);
    });

    it("should produce different reclassified dollar amounts for STR vs LTR on identical basis — not sharing one constant", () => {
      const ltr = costSegregation(longTermRentalBenchmark);
      const str = costSegregation(shortTermRentalBenchmark);
      expect(str.fiveYearReclassified).not.toBe(ltr.fiveYearReclassified);
      expect(str.fifteenYearReclassified).not.toBe(ltr.fifteenYearReclassified);
      expect(str.fiveYearReclassified).toBeGreaterThan(ltr.fiveYearReclassified);
    });
  });

  describe("First-year accelerated depreciation", () => {
    it("should apply the MACRS half-year first-year rates to each reclassified category", () => {
      const result = costSegregation(longTermRentalBenchmark);
      expect(result.firstYearAcceleratedDepreciation).toBe(24340); // 103600*0.20 + 72400*0.05
    });
  });

  describe("Commercial property — no verified benchmark", () => {
    it("should throw rather than guess a commercial benchmark default", () => {
      expect(() => costSegregation(commercialWithoutOverride)).toThrow(
        /no verified commercial cost-segregation benchmark/i
      );
    });

    it("should compute correctly for commercial when a real custom study is supplied", () => {
      const result = costSegregation(commercialWithCustomOverride);
      expect(result.usedCustomOverride).toBe(true);
      expect(result.fiveYearReclassified).toBe(120000);
      expect(result.fifteenYearReclassified).toBe(90000);
      expect(result.benchmarkRangeUsed).toEqual({ low: 0.21, high: 0.21, median: 0.21 });
    });
  });

  describe("Custom override takes priority over benchmark", () => {
    it("should require both custom percentages when useBenchmarkDefault is false", () => {
      expect(() => costSegregation(missingCustomOverride)).toThrow(
        /customFiveYearPercent and customFifteenYearPercent are required/i
      );
    });

    it("should not expose a false-precision single number — benchmark range includes low/high, not just the median", () => {
      const result = costSegregation(longTermRentalBenchmark);
      expect(result.benchmarkRangeUsed.low).toBeLessThan(result.benchmarkRangeUsed.median);
      expect(result.benchmarkRangeUsed.high).toBeGreaterThan(result.benchmarkRangeUsed.median);
    });
  });

  describe("Metadata", () => {
    it("should include the advisory disclaimer, jurisdiction, and echo inputs", () => {
      const result = costSegregation(longTermRentalBenchmark);
      expect(result.jurisdiction).toBe("US");
      expect(result.disclaimer.length).toBeGreaterThan(0);
      expect(result.inputs).toEqual(longTermRentalBenchmark);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
