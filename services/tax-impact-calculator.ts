import type { FilingStatus } from "../types/transcript"
import type { TaxCalculationParams, TaxImpactResult } from "../types/tax-calculator"
import { TaxCalculator } from "./tax-calculator"

export class TaxImpactCalculator {
  private taxCalculator: TaxCalculator

  constructor() {
    this.taxCalculator = new TaxCalculator()
  }

  /**
   * Calculate tax impact for income discrepancy
   */
  async calculateIncomeDiscrepancyImpact(
    difference: number,
    agi: number,
    filingStatus: FilingStatus,
    taxYear: number,
    dependents = 0,
  ): Promise<TaxImpactResult> {
    // Create tax calculation parameters
    const params: TaxCalculationParams = {
      taxYear,
      filingStatus,
      originalScenario: {
        adjustedGrossIncome: agi,
        filingStatus,
        taxYear,
        dependents: this.createDependentsArray(dependents),
      },
      changes: {
        adjustedGrossIncome: agi - difference, // Reduce AGI by the discrepancy amount
      },
    }

    return this.taxCalculator.calculateTaxImpact(params)
  }

  /**
   * Calculate tax impact for withholding discrepancy
   * This is a direct impact (dollar for dollar) since withholding
   * doesn't affect tax liability, only the amount already paid
   */
  async calculateWithholdingDiscrepancyImpact(
    difference: number,
    agi: number,
    filingStatus: FilingStatus,
    taxYear: number,
  ): Promise<TaxImpactResult> {
    // For withholding, the impact is direct (dollar for dollar)
    // We'll create a simplified result
    return {
      taxImpact: difference, // Direct impact
      refundChange: difference, // Direct impact on refund
      marginalRate: 1.0, // 100% impact rate for withholding
      effectiveRate: 1.0,
      breakdown: {
        originalTax: {
          adjustedGrossIncome: agi,
          taxableIncome: 0,
          deductions: { standardDeduction: 0, itemizedDeductions: 0, totalDeductions: 0, usingItemized: false },
          incomeTax: 0,
          selfEmploymentTax: 0,
          alternativeMinimumTax: 0,
          credits: { totalCredits: 0, breakdown: {} },
          totalTax: 0,
          effectiveRate: 0,
        },
        revisedTax: {
          adjustedGrossIncome: agi,
          taxableIncome: 0,
          deductions: { standardDeduction: 0, itemizedDeductions: 0, totalDeductions: 0, usingItemized: false },
          incomeTax: 0,
          selfEmploymentTax: 0,
          alternativeMinimumTax: 0,
          credits: { totalCredits: 0, breakdown: {} },
          totalTax: 0,
          effectiveRate: 0,
        },
        incomeTaxChange: 0,
        selfEmploymentTaxChange: 0,
        alternativeMinimumTaxChange: 0,
      },
    }
  }

  /**
   * Calculate tax impact for self-employment income discrepancy
   */
  async calculateSelfEmploymentDiscrepancyImpact(
    difference: number,
    agi: number,
    selfEmploymentIncome: number,
    filingStatus: FilingStatus,
    taxYear: number,
  ): Promise<TaxImpactResult> {
    // Create tax calculation parameters
    const params: TaxCalculationParams = {
      taxYear,
      filingStatus,
      originalScenario: {
        adjustedGrossIncome: agi,
        selfEmploymentIncome,
        filingStatus,
        taxYear,
      },
      changes: {
        adjustedGrossIncome: agi - difference, // Reduce AGI by the discrepancy amount
        selfEmploymentIncome: selfEmploymentIncome - difference, // Reduce SE income by the discrepancy amount
      },
    }

    return this.taxCalculator.calculateTaxImpact(params)
  }

  /**
   * Calculate tax impact for deduction discrepancy
   */
  async calculateDeductionDiscrepancyImpact(
    difference: number,
    agi: number,
    filingStatus: FilingStatus,
    taxYear: number,
    deductionType: "medical" | "charitable" | "mortgage" | "salt" | "misc",
  ): Promise<TaxImpactResult> {
    // Create base itemized deductions
    const baseItemizedDeductions: Record<string, number> = {}

    // Set the specific deduction type
    switch (deductionType) {
      case "medical":
        baseItemizedDeductions.medicalExpenses = difference
        break
      case "charitable":
        baseItemizedDeductions.charitableContributions = difference
        break
      case "mortgage":
        baseItemizedDeductions.mortgageInterest = difference
        break
      case "salt":
        baseItemizedDeductions.stateLocalTax = difference
        break
      case "misc":
        baseItemizedDeductions.miscellaneousDeductions = difference
        break
    }

    // Create tax calculation parameters
    const params: TaxCalculationParams = {
      taxYear,
      filingStatus,
      originalScenario: {
        adjustedGrossIncome: agi,
        filingStatus,
        taxYear,
        itemizedDeductions: baseItemizedDeductions,
      },
      changes: {
        itemizedDeductions: {}, // No itemized deductions in the revised scenario
      },
    }

    return this.taxCalculator.calculateTaxImpact(params)
  }

  /**
   * Calculate tax impact for credit discrepancy
   */
  async calculateCreditDiscrepancyImpact(
    difference: number,
    agi: number,
    filingStatus: FilingStatus,
    taxYear: number,
    creditType: "child" | "education" | "eitc",
  ): Promise<TaxImpactResult> {
    // For credits, the impact is usually direct (dollar for dollar)
    // up to the tax liability (for non-refundable credits)
    // We'll create a simplified result
    return {
      taxImpact: difference, // Direct impact
      refundChange: difference, // Direct impact on refund
      marginalRate: 1.0, // 100% impact rate for credits
      effectiveRate: 1.0,
      breakdown: {
        originalTax: {
          adjustedGrossIncome: agi,
          taxableIncome: 0,
          deductions: { standardDeduction: 0, itemizedDeductions: 0, totalDeductions: 0, usingItemized: false },
          incomeTax: 0,
          selfEmploymentTax: 0,
          alternativeMinimumTax: 0,
          credits: { totalCredits: 0, breakdown: {} },
          totalTax: 0,
          effectiveRate: 0,
        },
        revisedTax: {
          adjustedGrossIncome: agi,
          taxableIncome: 0,
          deductions: { standardDeduction: 0, itemizedDeductions: 0, totalDeductions: 0, usingItemized: false },
          incomeTax: 0,
          selfEmploymentTax: 0,
          alternativeMinimumTax: 0,
          credits: { totalCredits: 0, breakdown: {} },
          totalTax: 0,
          effectiveRate: 0,
        },
        incomeTaxChange: 0,
        selfEmploymentTaxChange: 0,
        alternativeMinimumTaxChange: 0,
      },
    }
  }

  /**
   * Helper method to create an array of dependents
   */
  private createDependentsArray(count: number): {
    name: string
    dateOfBirth: Date
    relationship: string
    qualifyingChild: boolean
    qualifyingRelative: boolean
  }[] {
    const dependents = []
    const currentYear = new Date().getFullYear()

    for (let i = 0; i < count; i++) {
      // Create a child dependent who is 10 years old
      const birthYear = currentYear - 10 - i
      dependents.push({
        name: `Dependent ${i + 1}`,
        dateOfBirth: new Date(birthYear, 0, 1), // January 1st of birth year
        relationship: "Child",
        qualifyingChild: true,
        qualifyingRelative: false,
      })
    }

    return dependents
  }
}
