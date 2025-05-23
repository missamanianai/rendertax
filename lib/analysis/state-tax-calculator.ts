import type { TaxBracket } from "./tax-bracket" // Assuming TaxBracket is defined in another file

export interface StateTaxInfo {
  state: string
  hasIncomeTax: boolean
  taxType: "flat" | "progressive" | "none"
  flatRate?: number
  brackets?: TaxBracket[]
  standardDeduction?: number
  personalExemption?: number
}

export class StateTaxCalculator {
  private static readonly STATE_TAX_INFO: Record<string, StateTaxInfo> = {
    // No income tax states
    AK: { state: "Alaska", hasIncomeTax: false, taxType: "none" },
    FL: { state: "Florida", hasIncomeTax: false, taxType: "none" },
    NV: { state: "Nevada", hasIncomeTax: false, taxType: "none" },
    NH: { state: "New Hampshire", hasIncomeTax: false, taxType: "none" },
    SD: { state: "South Dakota", hasIncomeTax: false, taxType: "none" },
    TN: { state: "Tennessee", hasIncomeTax: false, taxType: "none" },
    TX: { state: "Texas", hasIncomeTax: false, taxType: "none" },
    WA: { state: "Washington", hasIncomeTax: false, taxType: "none" },
    WY: { state: "Wyoming", hasIncomeTax: false, taxType: "none" },

    // Flat tax states
    CO: {
      state: "Colorado",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.044,
      standardDeduction: 12000,
    },
    IL: {
      state: "Illinois",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.0495,
      standardDeduction: 2425,
    },
    IN: {
      state: "Indiana",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.032,
      standardDeduction: 1000,
    },
    KY: {
      state: "Kentucky",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.05,
      standardDeduction: 2770,
    },
    MA: {
      state: "Massachusetts",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.05,
      standardDeduction: 4400,
    },
    MI: {
      state: "Michigan",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.0425,
      standardDeduction: 4900,
    },
    NC: {
      state: "North Carolina",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.045,
      standardDeduction: 12750,
    },
    PA: {
      state: "Pennsylvania",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.0307,
      standardDeduction: 0,
    },
    UT: {
      state: "Utah",
      hasIncomeTax: true,
      taxType: "flat",
      flatRate: 0.0485,
      standardDeduction: 12000,
    },

    // Progressive tax states (California example)
    CA: {
      state: "California",
      hasIncomeTax: true,
      taxType: "progressive",
      standardDeduction: 5202,
      brackets: [
        { min: 0, max: 10099, rate: 0.01 },
        { min: 10099, max: 23942, rate: 0.02 },
        { min: 23942, max: 37788, rate: 0.04 },
        { min: 37788, max: 52455, rate: 0.06 },
        { min: 52455, max: 66295, rate: 0.08 },
        { min: 66295, max: 338639, rate: 0.093 },
        { min: 338639, max: 406364, rate: 0.103 },
        { min: 406364, max: 677278, rate: 0.113 },
        { min: 677278, max: Number.POSITIVE_INFINITY, rate: 0.123 },
      ],
    },

    // New York example
    NY: {
      state: "New York",
      hasIncomeTax: true,
      taxType: "progressive",
      standardDeduction: 8000,
      brackets: [
        { min: 0, max: 8500, rate: 0.04 },
        { min: 8500, max: 11700, rate: 0.045 },
        { min: 11700, max: 13900, rate: 0.0525 },
        { min: 13900, max: 80650, rate: 0.055 },
        { min: 80650, max: 215400, rate: 0.06 },
        { min: 215400, max: 1077550, rate: 0.0685 },
        { min: 1077550, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Number.POSITIVE_INFINITY, rate: 0.109 },
      ],
    },
  }

  static calculateStateTax(income: number, state: string, filingStatus = "single"): number {
    const stateInfo = this.STATE_TAX_INFO[state.toUpperCase()]

    if (!stateInfo || !stateInfo.hasIncomeTax) {
      return 0
    }

    const standardDeduction = stateInfo.standardDeduction || 0
    const taxableIncome = Math.max(0, income - standardDeduction)

    if (stateInfo.taxType === "flat") {
      return taxableIncome * (stateInfo.flatRate || 0)
    }

    if (stateInfo.taxType === "progressive" && stateInfo.brackets) {
      let stateTax = 0

      for (const bracket of stateInfo.brackets) {
        if (taxableIncome <= bracket.min) break

        const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min
        stateTax += taxableInBracket * bracket.rate
      }

      return stateTax
    }

    return 0
  }

  static getStateInfo(state: string): StateTaxInfo | null {
    return this.STATE_TAX_INFO[state.toUpperCase()] || null
  }

  static getAllStates(): StateTaxInfo[] {
    return Object.values(this.STATE_TAX_INFO)
  }

  static getNoTaxStates(): string[] {
    return Object.entries(this.STATE_TAX_INFO)
      .filter(([_, info]) => !info.hasIncomeTax)
      .map(([code, _]) => code)
  }

  static getFlatTaxStates(): string[] {
    return Object.entries(this.STATE_TAX_INFO)
      .filter(([_, info]) => info.taxType === "flat")
      .map(([code, _]) => code)
  }

  static getProgressiveTaxStates(): string[] {
    return Object.entries(this.STATE_TAX_INFO)
      .filter(([_, info]) => info.taxType === "progressive")
      .map(([code, _]) => code)
  }
}
