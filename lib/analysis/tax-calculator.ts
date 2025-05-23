export interface TaxBracket {
  min: number
  max: number
  rate: number
}

export interface TaxCalculationResult {
  taxableIncome: number
  federalTax: number
  stateTax: number
  totalTax: number
  effectiveRate: number
  marginalRate: number
  breakdown: TaxBreakdown[]
}

export interface TaxBreakdown {
  bracket: TaxBracket
  taxableAmount: number
  taxOwed: number
}

export interface StandardDeduction {
  single: number
  marriedFilingJointly: number
  marriedFilingSeparately: number
  headOfHousehold: number
}

export class TaxCalculator {
  private static readonly TAX_BRACKETS_2023: Record<string, TaxBracket[]> = {
    single: [
      { min: 0, max: 11000, rate: 0.1 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 22000, rate: 0.1 },
      { min: 22000, max: 89450, rate: 0.12 },
      { min: 89450, max: 190750, rate: 0.22 },
      { min: 190750, max: 364200, rate: 0.24 },
      { min: 364200, max: 462500, rate: 0.32 },
      { min: 462500, max: 693750, rate: 0.35 },
      { min: 693750, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    marriedFilingSeparately: [
      { min: 0, max: 11000, rate: 0.1 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182100, rate: 0.24 },
      { min: 182100, max: 231250, rate: 0.32 },
      { min: 231250, max: 346875, rate: 0.35 },
      { min: 346875, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    headOfHousehold: [
      { min: 0, max: 15700, rate: 0.1 },
      { min: 15700, max: 59850, rate: 0.12 },
      { min: 59850, max: 95350, rate: 0.22 },
      { min: 95350, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578100, rate: 0.35 },
      { min: 578100, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
  }

  private static readonly TAX_BRACKETS_2022: Record<string, TaxBracket[]> = {
    single: [
      { min: 0, max: 10275, rate: 0.1 },
      { min: 10275, max: 41775, rate: 0.12 },
      { min: 41775, max: 89450, rate: 0.22 },
      { min: 89450, max: 190750, rate: 0.24 },
      { min: 190750, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 20550, rate: 0.1 },
      { min: 20550, max: 83550, rate: 0.12 },
      { min: 83550, max: 178850, rate: 0.22 },
      { min: 178850, max: 340100, rate: 0.24 },
      { min: 340100, max: 431900, rate: 0.32 },
      { min: 431900, max: 647850, rate: 0.35 },
      { min: 647850, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    marriedFilingSeparately: [
      { min: 0, max: 10275, rate: 0.1 },
      { min: 10275, max: 41775, rate: 0.12 },
      { min: 41775, max: 89425, rate: 0.22 },
      { min: 89425, max: 170050, rate: 0.24 },
      { min: 170050, max: 215950, rate: 0.32 },
      { min: 215950, max: 323925, rate: 0.35 },
      { min: 323925, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    headOfHousehold: [
      { min: 0, max: 14650, rate: 0.1 },
      { min: 14650, max: 55900, rate: 0.12 },
      { min: 55900, max: 89450, rate: 0.22 },
      { min: 89450, max: 190750, rate: 0.24 },
      { min: 190750, max: 243700, rate: 0.32 },
      { min: 243700, max: 609350, rate: 0.35 },
      { min: 609350, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
  }

  private static readonly TAX_BRACKETS_2021: Record<string, TaxBracket[]> = {
    single: [
      { min: 0, max: 9950, rate: 0.1 },
      { min: 9950, max: 40525, rate: 0.12 },
      { min: 40525, max: 86375, rate: 0.22 },
      { min: 86375, max: 164925, rate: 0.24 },
      { min: 164925, max: 209425, rate: 0.32 },
      { min: 209425, max: 523600, rate: 0.35 },
      { min: 523600, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    marriedFilingJointly: [
      { min: 0, max: 19900, rate: 0.1 },
      { min: 19900, max: 81050, rate: 0.12 },
      { min: 81050, max: 172750, rate: 0.22 },
      { min: 172750, max: 329850, rate: 0.24 },
      { min: 329850, max: 418850, rate: 0.32 },
      { min: 418850, max: 628300, rate: 0.35 },
      { min: 628300, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    marriedFilingSeparately: [
      { min: 0, max: 9950, rate: 0.1 },
      { min: 9950, max: 40525, rate: 0.12 },
      { min: 40525, max: 86375, rate: 0.22 },
      { min: 86375, max: 164925, rate: 0.24 },
      { min: 164925, max: 209425, rate: 0.32 },
      { min: 209425, max: 314150, rate: 0.35 },
      { min: 314150, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
    headOfHousehold: [
      { min: 0, max: 14200, rate: 0.1 },
      { min: 14200, max: 54200, rate: 0.12 },
      { min: 54200, max: 86350, rate: 0.22 },
      { min: 86350, max: 164900, rate: 0.24 },
      { min: 164900, max: 209400, rate: 0.32 },
      { min: 209400, max: 523600, rate: 0.35 },
      { min: 523600, max: Number.POSITIVE_INFINITY, rate: 0.37 },
    ],
  }

  private static readonly STANDARD_DEDUCTIONS: Record<number, StandardDeduction> = {
    2023: {
      single: 13850,
      marriedFilingJointly: 27700,
      marriedFilingSeparately: 13850,
      headOfHousehold: 20800,
    },
    2022: {
      single: 12950,
      marriedFilingJointly: 25900,
      marriedFilingSeparately: 12950,
      headOfHousehold: 19400,
    },
    2021: {
      single: 12550,
      marriedFilingJointly: 25100,
      marriedFilingSeparately: 12550,
      headOfHousehold: 18800,
    },
  }

  static calculateFederalTax(
    income: number,
    filingStatus: string,
    taxYear: number,
    deductions?: number,
  ): TaxCalculationResult {
    const brackets = this.getTaxBrackets(taxYear, filingStatus)
    const standardDeduction = this.getStandardDeduction(taxYear, filingStatus)
    const totalDeductions = deductions || standardDeduction

    const taxableIncome = Math.max(0, income - totalDeductions)

    let federalTax = 0
    const breakdown: TaxBreakdown[] = []

    for (const bracket of brackets) {
      if (taxableIncome <= bracket.min) break

      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min
      const taxOwed = taxableInBracket * bracket.rate

      federalTax += taxOwed
      breakdown.push({
        bracket,
        taxableAmount: taxableInBracket,
        taxOwed,
      })
    }

    const effectiveRate = income > 0 ? federalTax / income : 0
    const marginalRate = this.getMarginalRate(taxableIncome, brackets)

    return {
      taxableIncome,
      federalTax,
      stateTax: 0, // Will be calculated separately
      totalTax: federalTax,
      effectiveRate,
      marginalRate,
      breakdown,
    }
  }

  private static getTaxBrackets(taxYear: number, filingStatus: string): TaxBracket[] {
    const normalizedStatus = filingStatus.toLowerCase().replace(/\s+/g, "")

    switch (taxYear) {
      case 2023:
        return this.TAX_BRACKETS_2023[normalizedStatus] || this.TAX_BRACKETS_2023.single
      case 2022:
        return this.TAX_BRACKETS_2022[normalizedStatus] || this.TAX_BRACKETS_2022.single
      case 2021:
        return this.TAX_BRACKETS_2021[normalizedStatus] || this.TAX_BRACKETS_2021.single
      default:
        // Default to most recent year
        return this.TAX_BRACKETS_2023[normalizedStatus] || this.TAX_BRACKETS_2023.single
    }
  }

  private static getStandardDeduction(taxYear: number, filingStatus: string): number {
    const deductions = this.STANDARD_DEDUCTIONS[taxYear] || this.STANDARD_DEDUCTIONS[2023]
    const normalizedStatus = filingStatus.toLowerCase().replace(/\s+/g, "")

    switch (normalizedStatus) {
      case "marriedfilingjointly":
        return deductions.marriedFilingJointly
      case "marriedfilingseparately":
        return deductions.marriedFilingSeparately
      case "headofhousehold":
        return deductions.headOfHousehold
      default:
        return deductions.single
    }
  }

  private static getMarginalRate(taxableIncome: number, brackets: TaxBracket[]): number {
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
        return bracket.rate
      }
    }
    return brackets[brackets.length - 1].rate
  }

  static calculateEstimatedTaxPenalty(
    currentYearTax: number,
    priorYearTax: number,
    paymentsAndWithholding: number,
    agi: number,
  ): number {
    // Safe harbor rules
    const safeHarborAmount = agi > 150000 ? priorYearTax * 1.1 : priorYearTax
    const currentYearSafeHarbor = currentYearTax * 0.9

    const requiredPayment = Math.min(safeHarborAmount, currentYearSafeHarbor)

    if (paymentsAndWithholding >= requiredPayment) {
      return 0 // No penalty
    }

    const underpayment = requiredPayment - paymentsAndWithholding

    // Simplified penalty calculation (actual calculation is more complex)
    const penaltyRate = 0.08 // 8% annual rate (varies by quarter)
    return underpayment * penaltyRate
  }

  static calculateAccuracyPenalty(understatement: number, totalTax: number): number {
    const understatementThreshold = Math.max(5000, totalTax * 0.1)

    if (understatement < understatementThreshold) {
      return 0
    }

    // 20% accuracy-related penalty
    return understatement * 0.2
  }
}
