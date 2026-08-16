import {
  calculateCrossBorderWithholding,
  calculateUKPropertyTax,
  calculateAustraliaPropertyTax,
  CrossBorderWithholdingRequest,
  UKPropertyTaxRequest,
  AustraliaPropertyTaxRequest,
} from "../../src/phase2-scaffolds-international";

describe("Phase 2 international contracts — interfaces only, not implemented", () => {
  it("CrossBorderWithholdingRequest shape typechecks (compile-time proof the contract exists)", () => {
    const request: CrossBorderWithholdingRequest = {
      investorHomeCountry: "Canada",
      propertyCountry: "US",
      transactionType: "rental_income",
      grossAmount: 10000,
    };
    expect(request.grossAmount).toBe(10000);
  });

  it("calculateCrossBorderWithholding throws rather than fabricating a withholding amount", () => {
    expect(() =>
      calculateCrossBorderWithholding({
        investorHomeCountry: "Canada",
        propertyCountry: "US",
        transactionType: "rental_income",
        grossAmount: 10000,
      })
    ).toThrow(/Phase 2 not implemented/);
  });

  it("UKPropertyTaxRequest shape typechecks", () => {
    const request: UKPropertyTaxRequest = {
      country: "England",
      purchasePrice: 500000,
      isBuyToLet: true,
      annualMortgageInterest: 12000,
      landlordMarginalTaxRate: 0.4,
    };
    expect(request.country).toBe("England");
  });

  it("calculateUKPropertyTax throws with the market-decision-pending message", () => {
    expect(() =>
      calculateUKPropertyTax({
        country: "England",
        purchasePrice: 500000,
        isBuyToLet: true,
        annualMortgageInterest: 12000,
        landlordMarginalTaxRate: 0.4,
      })
    ).toThrow(/market decision pending/);
  });

  it("AustraliaPropertyTaxRequest shape typechecks", () => {
    const request: AustraliaPropertyTaxRequest = {
      purchaseDate: "2027-03-01",
      state: "NSW",
      isEstablishedHome: false,
      purchasePrice: 800000,
    };
    expect(request.state).toBe("NSW");
  });

  it("calculateAustraliaPropertyTax throws with the market-decision-pending message", () => {
    expect(() =>
      calculateAustraliaPropertyTax({
        purchaseDate: "2027-03-01",
        state: "NSW",
        isEstablishedHome: false,
        purchasePrice: 800000,
      })
    ).toThrow(/market decision pending/);
  });
});
