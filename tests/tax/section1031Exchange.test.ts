import { section1031Exchange } from "../../src/E68-section-1031-exchange";
import {
  weekendHolidayDeadline,
  taxFilingDeadlineCapsExchangeWindow,
  equityShortfallBootOnly,
  debtShortfallBootOnly,
  fullDeferralNoBoot,
} from "./fixtures/section1031Exchange.fixtures";

describe("E68: Section 1031 Like-Kind Exchange", () => {
  describe("Deadlines", () => {
    it("should not shift the 45-day identification deadline when it lands on a weekend", () => {
      const result = section1031Exchange(weekendHolidayDeadline);
      expect(result.identificationDeadline).toBe("2026-02-21"); // a Saturday
    });

    it("should compute the 180-day exchange deadline concurrently from closing, not sequentially from day 45", () => {
      const result = section1031Exchange(weekendHolidayDeadline);
      expect(result.exchangeDeadline).toBe("2026-07-06");
      // If it were (wrongly) computed as identification + 180 days instead of closing + 180 days, it would land here instead.
      expect(result.exchangeDeadline).not.toBe("2026-08-20");
    });

    it("should cap the exchange deadline at the tax-return due date when it falls earlier than the 180-day mark", () => {
      const result = section1031Exchange(taxFilingDeadlineCapsExchangeWindow);
      expect(result.exchangeDeadline).toBe("2026-04-15");
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining("tax-return due date")])
      );
    });

    it("should leave the identification deadline unaffected by the tax-return due date cap", () => {
      const result = section1031Exchange(taxFilingDeadlineCapsExchangeWindow);
      expect(result.identificationDeadline).toBe("2026-02-21");
    });
  });

  describe("Boot — independent triggers", () => {
    it("should compute boot from an equity shortfall alone when debt is fully replaced", () => {
      const result = section1031Exchange(equityShortfallBootOnly);
      expect(result.debtShortfall).toBe(0);
      expect(result.equityShortfall).toBe(100000);
      expect(result.bootAmount).toBe(100000);
    });

    it("should compute boot from a debt shortfall alone when net equity is fully reinvested", () => {
      const result = section1031Exchange(debtShortfallBootOnly);
      expect(result.equityShortfall).toBe(0);
      expect(result.debtShortfall).toBe(200000);
      expect(result.bootAmount).toBe(200000);
    });

    it("should produce zero boot when both net equity and debt requirements are fully met", () => {
      const result = section1031Exchange(fullDeferralNoBoot);
      expect(result.equityShortfall).toBe(0);
      expect(result.debtShortfall).toBe(0);
      expect(result.bootAmount).toBe(0);
      expect(result.issues).toEqual([]);
    });

    it("should flag a value shortfall when the replacement property is priced below the relinquished sale price", () => {
      const result = section1031Exchange(equityShortfallBootOnly);
      expect(result.issues).toEqual(
        expect.arrayContaining([expect.stringContaining("below the relinquished sale price")])
      );
    });
  });

  describe("Depreciation recapture deferred separately from capital gain", () => {
    it("should defer depreciation recapture as its own field when there is no boot", () => {
      const result = section1031Exchange(fullDeferralNoBoot);
      expect(result.realizedGain).toBe(250000); // 500000 - 250000 basis
      expect(result.recognizedGain).toBe(0);
      expect(result.deferredDepreciationRecapture).toBe(80000);
      expect(result.deferredCapitalGain).toBe(170000); // 250000 - 80000
      expect(result.deferredCapitalGain + result.deferredDepreciationRecapture).toBe(
        result.realizedGain
      );
    });

    it("should recognize boot as depreciation recapture first, then capital gain, when boot exceeds accumulated depreciation", () => {
      const result = section1031Exchange(equityShortfallBootOnly);
      expect(result.bootAmount).toBe(100000);
      expect(result.recognizedGain).toBe(100000);
      expect(result.recognizedDepreciationRecapture).toBe(80000);
      expect(result.recognizedCapitalGain).toBe(20000);
      expect(result.deferredDepreciationRecapture).toBe(0);
      expect(result.deferredCapitalGain).toBe(150000);
      expect(
        result.recognizedGain + result.deferredDepreciationRecapture + result.deferredCapitalGain
      ).toBe(result.realizedGain);
    });
  });

  describe("Metadata", () => {
    it("should include the advisory disclaimer, jurisdiction, and echo inputs", () => {
      const result = section1031Exchange(fullDeferralNoBoot);
      expect(result.jurisdiction).toBe("US");
      expect(result.disclaimer.length).toBeGreaterThan(0);
      expect(result.inputs).toEqual(fullDeferralNoBoot);
      expect(result.calculatedAt).toBe(new Date(result.calculatedAt).toISOString());
    });
  });
});
