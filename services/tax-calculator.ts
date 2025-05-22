import type {
  TaxCalculationParams,
  TaxScenario,
  TaxImpactResult,
  TaxCalculationResult,
  DeductionCalculation,
  CreditCalculation,
  TaxYearData,
} from "../types/tax-calculator"
import type { FilingStatus } from "../types/transcript"

export class TaxCalculator {
  private taxData: TaxYearData[]

  constructor() {
    this.taxData = this.initializeTaxData()
  }

  /**
   * Calculate comprehensive tax impact of income/deduction changes
   */
  async calculateTaxImpact(params: TaxCalculationParams): Promise<TaxImpactResult> {
    const taxYear = params.taxYear
    const filingStatus = params.filingStatus
    const currentTaxData = this.getTaxDataForYear(taxYear)

    // Calculate original tax liability
    const originalTax = this.calculateTotalTax(
      {
        ...params.originalScenario,
        taxYear,
        filingStatus,
      },
      currentTaxData,
    )

    // Calculate revised tax liability with changes
    const revisedTax = this.calculateTotalTax(
      {
        ...params.originalScenario,
        ...params.changes,
        taxYear,
        filingStatus,
      },
      currentTaxData,
    )

    const impact = originalTax.totalTax - revisedTax.totalTax

    return {
      taxImpact: impact,
      refundChange: impact, // Positive = more refund/less owed
      marginalRate: this.calculateMarginalRate(params.originalScenario.adjustedGrossIncome, filingStatus, taxYear),
      effectiveRate: originalTax.totalTax / params.originalScenario.adjustedGrossIncome,
      breakdown: {
        originalTax: originalTax,
        revisedTax: revisedTax,
        incomeTaxChange: originalTax.incomeTax - revisedTax.incomeTax,
        selfEmploymentTaxChange: originalTax.selfEmploymentTax - revisedTax.selfEmploymentTax,
        alternativeMinimumTaxChange: originalTax.alternativeMinimumTax - revisedTax.alternativeMinimumTax,
      },
    }
  }

  /**
   * Calculate total tax liability for a given scenario
   */
  private calculateTotalTax(scenario: TaxScenario, taxData: TaxYearData): TaxCalculationResult {
    const agi = scenario.adjustedGrossIncome
    const deductions = this.calculateDeductions(scenario, taxData)
    const taxableIncome = Math.max(0, agi - deductions.totalDeductions)

    // Calculate regular income tax
    const incomeTax = this.calculateIncomeTax(taxableIncome, scenario.filingStatus, taxData)

    // Calculate self-employment tax
    const selfEmploymentTax = this.calculateSelfEmploymentTax(
      scenario.selfEmploymentIncome || 0,
      scenario.filingStatus,
      taxData,
    )

    // Calculate Alternative Minimum Tax
    const amt = this.calculateAlternativeMinimumTax(scenario, taxData)

    // Calculate credits
    const credits = this.calculateTaxCredits(scenario, taxData)

    // Net tax before withholding
    const netTax = Math.max(0, incomeTax + selfEmploymentTax + amt - credits.totalCredits)

    return {
      adjustedGrossIncome: agi,
      taxableIncome,
      deductions,
      incomeTax,
      selfEmploymentTax,
      alternativeMinimumTax: amt,
      credits,
      totalTax: netTax,
      effectiveRate: netTax / agi,
    }
  }

  /**
   * Calculate income tax using progressive brackets
   */
  private calculateIncomeTax(taxableIncome: number, filingStatus: FilingStatus, taxData: TaxYearData): number {
    const brackets = taxData.taxBrackets[filingStatus]
    let tax = 0
    let remainingIncome = taxableIncome

    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i]
      if (remainingIncome <= 0) break

      const bracketWidth = bracket.max - bracket.min
      const taxableInBracket = Math.min(remainingIncome, bracketWidth)

      tax += taxableInBracket * bracket.rate
      remainingIncome -= taxableInBracket
    }

    return tax
  }

  /**
   * Calculate self-employment tax (Social Security + Medicare)
   */
  private calculateSelfEmploymentTax(
    selfEmploymentIncome: number,
    filingStatus: FilingStatus,
    taxData: TaxYearData,
  ): number {
    if (selfEmploymentIncome <= 0) return 0

    // Net earnings from self-employment (92.35% of SE income)
    const netEarnings = selfEmploymentIncome * 0.9235

    // Social Security tax (6.2% each for employer and employee = 12.4%)
    const socialSecurityWageBase = taxData.socialSecurityWageBase
    const socialSecurityTax = Math.min(netEarnings, socialSecurityWageBase) * 0.124

    // Medicare tax (1.45% each for employer and employee = 2.9%)
    const medicareTax = netEarnings * 0.029

    // Additional Medicare tax (0.9% on income over threshold)
    const additionalMedicareThreshold = taxData.additionalMedicareThreshold[filingStatus]
    const additionalMedicareTax = Math.max(0, netEarnings - additionalMedicareThreshold) * 0.009

    return socialSecurityTax + medicareTax + additionalMedicareTax
  }

  /**
   * Calculate Alternative Minimum Tax
   */
  private calculateAlternativeMinimumTax(scenario: TaxScenario, taxData: TaxYearData): number {
    const amtIncome = this.calculateAMTIncome(scenario)
    const exemption = this.calculateAMTExemption(amtIncome, scenario.filingStatus, taxData)
    const amtTaxableIncome = Math.max(0, amtIncome - exemption)

    let amtTax = 0
    const amtRates = taxData.amtRates[scenario.filingStatus]

    let remainingIncome = amtTaxableIncome
    for (const rate of amtRates) {
      if (remainingIncome <= 0) break

      if (remainingIncome <= rate.threshold) {
        amtTax += remainingIncome * rate.rate
        break
      } else {
        amtTax += rate.threshold * rate.rate
        remainingIncome -= rate.threshold
      }
    }

    // AMT is the excess over regular tax
    const regularTax = this.calculateIncomeTax(
      scenario.adjustedGrossIncome - this.calculateDeductions(scenario, taxData).totalDeductions,
      scenario.filingStatus,
      taxData,
    )

    return Math.max(0, amtTax - regularTax)
  }

  /**
   * Calculate AMT income (adding back certain deductions)
   */
  private calculateAMTIncome(scenario: TaxScenario): number {
    // Start with AGI
    let amtIncome = scenario.adjustedGrossIncome

    // Add back certain deductions that aren't allowed for AMT
    if (scenario.itemizedDeductions) {
      // Add back state and local taxes
      amtIncome += scenario.itemizedDeductions.stateLocalTax || 0

      // Add back miscellaneous deductions
      amtIncome += scenario.itemizedDeductions.miscellaneousDeductions || 0
    }

    return amtIncome
  }

  /**
   * Calculate AMT exemption with phase-out
   */
  private calculateAMTExemption(amtIncome: number, filingStatus: FilingStatus, taxData: TaxYearData): number {
    const baseExemption = taxData.amtExemptions[filingStatus]
    const phaseout = taxData.amtExemptionPhaseout[filingStatus]

    if (amtIncome <= phaseout.threshold) {
      return baseExemption
    }

    const excessIncome = amtIncome - phaseout.threshold
    const reduction = excessIncome * phaseout.rate

    return Math.max(0, baseExemption - reduction)
  }

  /**
   * Calculate deductions (standard or itemized)
   */
  private calculateDeductions(scenario: TaxScenario, taxData: TaxYearData): DeductionCalculation {
    const standardDeduction = taxData.standardDeductions[scenario.filingStatus]

    let itemizedDeductions = 0
    const breakdown = {
      stateLocalTax: 0,
      mortgageInterest: 0,
      charitableContributions: 0,
      medicalExpenses: 0,
      miscellaneousDeductions: 0,
    }

    if (scenario.itemizedDeductions) {
      // State and local tax deduction (capped)
      const saltDeductionCap = taxData.saltDeductionCap
      breakdown.stateLocalTax = Math.min(scenario.itemizedDeductions.stateLocalTax || 0, saltDeductionCap)

      // Mortgage interest deduction
      breakdown.mortgageInterest = scenario.itemizedDeductions.mortgageInterest || 0

      // Charitable contributions (with AGI limitations)
      const charitableLimit = scenario.adjustedGrossIncome * taxData.charitableContributionLimit
      breakdown.charitableContributions = Math.min(
        scenario.itemizedDeductions.charitableContributions || 0,
        charitableLimit,
      )

      // Medical expenses (excess over threshold % of AGI)
      const medicalThreshold = scenario.adjustedGrossIncome * taxData.medicalExpenseThreshold
      breakdown.medicalExpenses = Math.max(0, (scenario.itemizedDeductions.medicalExpenses || 0) - medicalThreshold)

      // Miscellaneous deductions
      breakdown.miscellaneousDeductions = scenario.itemizedDeductions.miscellaneousDeductions || 0

      itemizedDeductions =
        breakdown.stateLocalTax +
        breakdown.mortgageInterest +
        breakdown.charitableContributions +
        breakdown.medicalExpenses +
        breakdown.miscellaneousDeductions
    }

    const useItemized = itemizedDeductions > standardDeduction

    return {
      standardDeduction,
      itemizedDeductions,
      totalDeductions: useItemized ? itemizedDeductions : standardDeduction,
      usingItemized: useItemized,
      breakdown: useItemized ? breakdown : undefined,
    }
  }

  /**
   * Calculate tax credits
   */
  private calculateTaxCredits(scenario: TaxScenario, taxData: TaxYearData): CreditCalculation {
    let totalCredits = 0
    const credits: Record<string, number> = {}

    // Child Tax Credit
    if (scenario.dependents && scenario.dependents.length > 0) {
      const eligibleChildren = scenario.dependents.filter((dep) => {
        const age = this.calculateAge(dep.dateOfBirth, new Date(`${scenario.taxYear}-12-31`))
        return age < 17
      }).length

      const childTaxCredit = this.calculateChildTaxCredit(
        eligibleChildren,
        scenario.adjustedGrossIncome,
        scenario.filingStatus,
        taxData,
      )

      credits.childTaxCredit = childTaxCredit
      totalCredits += childTaxCredit
    }

    // Earned Income Tax Credit
    if (scenario.earnedIncome !== undefined || scenario.adjustedGrossIncome > 0) {
      const eitc = this.calculateEarnedIncomeTaxCredit(
        scenario.earnedIncome || scenario.adjustedGrossIncome,
        scenario.adjustedGrossIncome,
        scenario.dependents?.filter((d) => d.qualifyingChild).length || 0,
        scenario.filingStatus,
        taxData,
      )

      credits.earnedIncomeTaxCredit = eitc
      totalCredits += eitc
    }

    // American Opportunity Tax Credit (education)
    if (scenario.educationExpenses && scenario.educationExpenses > 0) {
      const aotc = this.calculateAmericanOpportunityCredit(
        scenario.educationExpenses,
        scenario.adjustedGrossIncome,
        scenario.filingStatus,
        taxData,
      )

      credits.americanOpportunityCredit = aotc
      totalCredits += aotc
    }

    return {
      totalCredits,
      breakdown: credits,
    }
  }

  /**
   * Calculate Child Tax Credit with phase-out
   */
  private calculateChildTaxCredit(
    eligibleChildren: number,
    agi: number,
    filingStatus: FilingStatus,
    taxData: TaxYearData,
  ): number {
    if (eligibleChildren === 0) return 0

    const maxCredit = taxData.childTaxCredit.maxCredit * eligibleChildren
    const phaseOutThreshold = taxData.childTaxCredit.phaseOutThreshold[filingStatus]
    const phaseOutRate = taxData.childTaxCredit.phaseOutRate

    if (agi <= phaseOutThreshold) {
      return maxCredit
    }

    const excessIncome = agi - phaseOutThreshold
    const reduction = Math.ceil(excessIncome / 1000) * phaseOutRate * eligibleChildren

    return Math.max(0, maxCredit - reduction)
  }

  /**
   * Calculate Earned Income Tax Credit
   */
  private calculateEarnedIncomeTaxCredit(
    earnedIncome: number,
    agi: number,
    qualifyingChildren: number,
    filingStatus: FilingStatus,
    taxData: TaxYearData,
  ): number {
    const eitcTable = taxData.earnedIncomeTaxCredit
    const childrenCategory = Math.min(qualifyingChildren, 3) // Max 3 children for EITC

    if (!eitcTable[childrenCategory]) return 0

    // Only certain filing statuses qualify for EITC
    if (filingStatus === "married_separate") return 0

    // Use married_joint for qualifying_widow
    const statusKey = filingStatus === "qualifying_widow" ? "married_joint" : filingStatus

    // Some filing statuses may not have specific EITC data
    if (!eitcTable[childrenCategory][statusKey]) return 0

    const creditData = eitcTable[childrenCategory][statusKey]
    const incomeToUse = Math.min(earnedIncome, agi)

    // Phase-in range
    if (incomeToUse <= creditData.phaseInLimit) {
      return incomeToUse * creditData.phaseInRate
    }

    // Plateau range
    if (incomeToUse <= creditData.phaseOutStart) {
      return creditData.maxCredit
    }

    // Phase-out range
    if (incomeToUse <= creditData.phaseOutEnd) {
      const excessIncome = incomeToUse - creditData.phaseOutStart
      return Math.max(0, creditData.maxCredit - excessIncome * creditData.phaseOutRate)
    }

    return 0 // Income too high
  }

  /**
   * Calculate American Opportunity Tax Credit
   */
  private calculateAmericanOpportunityCredit(
    educationExpenses: number,
    agi: number,
    filingStatus: FilingStatus,
    taxData: TaxYearData,
  ): number {
    const aotcData = taxData.educationCredits.aotc
    const maxCredit = aotcData.maxCredit
    const maxQualifiedExpenses = aotcData.maxQualifiedExpenses

    // Calculate base credit
    const qualifiedExpenses = Math.min(educationExpenses, maxQualifiedExpenses)
    let credit = Math.min(qualifiedExpenses * 1.0, maxCredit) // 100% of first $2,000
    if (qualifiedExpenses > 2000) {
      credit += Math.min((qualifiedExpenses - 2000) * 0.25, 500) // 25% of next $2,000
    }

    // Phase-out based on AGI
    const phaseOutStart = aotcData.phaseOutStart[filingStatus]
    const phaseOutEnd = aotcData.phaseOutEnd[filingStatus]

    if (agi >= phaseOutEnd) return 0
    if (agi <= phaseOutStart) return credit

    const phaseOutRatio = (phaseOutEnd - agi) / (phaseOutEnd - phaseOutStart)
    return credit * phaseOutRatio
  }

  /**
   * Calculate marginal tax rate at specific income level
   */
  private calculateMarginalRate(income: number, filingStatus: FilingStatus, taxYear: number): number {
    const taxData = this.getTaxDataForYear(taxYear)
    const brackets = taxData.taxBrackets[filingStatus]

    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate
      }
    }

    return brackets[brackets.length - 1].rate // Highest bracket
  }

  /**
   * Calculate age as of a specific date
   */
  private calculateAge(birthDate: Date, asOfDate: Date): number {
    const ageInMilliseconds = asOfDate.getTime() - birthDate.getTime()
    return Math.floor(ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000))
  }

  /**
   * Get tax data for a specific year
   */
  private getTaxDataForYear(year: number): TaxYearData {
    const data = this.taxData.find((d) => d.year === year)
    if (!data) {
      throw new Error(`Tax data not available for year ${year}`)
    }
    return data
  }

  /**
   * Initialize comprehensive tax data for multiple years
   */
  private initializeTaxData(): TaxYearData[] {
    return [
      // 2023 Tax Data
      {
        year: 2023,
        taxBrackets: {
          single: [
            { min: 0, max: 11000, rate: 0.1 },
            { min: 11000, max: 44725, rate: 0.12 },
            { min: 44725, max: 95375, rate: 0.22 },
            { min: 95375, max: 182100, rate: 0.24 },
            { min: 182100, max: 231250, rate: 0.32 },
            { min: 231250, max: 578125, rate: 0.35 },
            { min: 578125, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          married_joint: [
            { min: 0, max: 22000, rate: 0.1 },
            { min: 22000, max: 89450, rate: 0.12 },
            { min: 89450, max: 190750, rate: 0.22 },
            { min: 190750, max: 364200, rate: 0.24 },
            { min: 364200, max: 462500, rate: 0.32 },
            { min: 462500, max: 693750, rate: 0.35 },
            { min: 693750, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          married_separate: [
            { min: 0, max: 11000, rate: 0.1 },
            { min: 11000, max: 44725, rate: 0.12 },
            { min: 44725, max: 95375, rate: 0.22 },
            { min: 95375, max: 182100, rate: 0.24 },
            { min: 182100, max: 231250, rate: 0.32 },
            { min: 231250, max: 346875, rate: 0.35 },
            { min: 346875, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          head_of_household: [
            { min: 0, max: 15700, rate: 0.1 },
            { min: 15700, max: 59850, rate: 0.12 },
            { min: 59850, max: 95350, rate: 0.22 },
            { min: 95350, max: 182100, rate: 0.24 },
            { min: 182100, max: 231250, rate: 0.32 },
            { min: 231250, max: 578100, rate: 0.35 },
            { min: 578100, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          qualifying_widow: [
            { min: 0, max: 22000, rate: 0.1 },
            { min: 22000, max: 89450, rate: 0.12 },
            { min: 89450, max: 190750, rate: 0.22 },
            { min: 190750, max: 364200, rate: 0.24 },
            { min: 364200, max: 462500, rate: 0.32 },
            { min: 462500, max: 693750, rate: 0.35 },
            { min: 693750, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
        },
        standardDeductions: {
          single: 13850,
          married_joint: 27700,
          married_separate: 13850,
          head_of_household: 20800,
          qualifying_widow: 27700,
        },
        socialSecurityWageBase: 160200,
        additionalMedicareThreshold: {
          single: 200000,
          married_joint: 250000,
          married_separate: 125000,
          head_of_household: 200000,
          qualifying_widow: 250000,
        },
        childTaxCredit: {
          maxCredit: 2000,
          refundableAmount: 1600, // Additional Child Tax Credit (ACTC) limit
          phaseOutThreshold: {
            single: 200000,
            married_joint: 400000,
            married_separate: 200000,
            head_of_household: 200000,
            qualifying_widow: 400000,
          },
          phaseOutRate: 50, // $50 per $1,000 of AGI over threshold
        },
        amtExemptions: {
          single: 81300,
          married_joint: 126500,
          married_separate: 63250,
          head_of_household: 81300,
          qualifying_widow: 126500,
        },
        amtExemptionPhaseout: {
          single: {
            threshold: 578150,
            rate: 0.25, // 25% phase-out rate
          },
          married_joint: {
            threshold: 1156300,
            rate: 0.25,
          },
          married_separate: {
            threshold: 578150,
            rate: 0.25,
          },
          head_of_household: {
            threshold: 578150,
            rate: 0.25,
          },
          qualifying_widow: {
            threshold: 1156300,
            rate: 0.25,
          },
        },
        amtRates: {
          single: [
            { threshold: 220700, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          married_joint: [
            { threshold: 220700, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          married_separate: [
            { threshold: 110350, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          head_of_household: [
            { threshold: 220700, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          qualifying_widow: [
            { threshold: 220700, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
        },
        earnedIncomeTaxCredit: {
          0: {
            // No children
            single: {
              phaseInLimit: 7430,
              phaseInRate: 0.0765,
              maxCredit: 568,
              phaseOutStart: 9800,
              phaseOutEnd: 17640,
              phaseOutRate: 0.0765,
            },
            married_joint: {
              phaseInLimit: 7430,
              phaseInRate: 0.0765,
              maxCredit: 568,
              phaseOutStart: 15570,
              phaseOutEnd: 23410,
              phaseOutRate: 0.0765,
            },
            head_of_household: {
              phaseInLimit: 7430,
              phaseInRate: 0.0765,
              maxCredit: 568,
              phaseOutStart: 9800,
              phaseOutEnd: 17640,
              phaseOutRate: 0.0765,
            },
            qualifying_widow: {
              phaseInLimit: 7430,
              phaseInRate: 0.0765,
              maxCredit: 568,
              phaseOutStart: 15570,
              phaseOutEnd: 23410,
              phaseOutRate: 0.0765,
            },
          },
          1: {
            // One child
            single: {
              phaseInLimit: 11750,
              phaseInRate: 0.34,
              maxCredit: 3995,
              phaseOutStart: 21560,
              phaseOutEnd: 46560,
              phaseOutRate: 0.1598,
            },
            married_joint: {
              phaseInLimit: 11750,
              phaseInRate: 0.34,
              maxCredit: 3995,
              phaseOutStart: 28120,
              phaseOutEnd: 53120,
              phaseOutRate: 0.1598,
            },
            head_of_household: {
              phaseInLimit: 11750,
              phaseInRate: 0.34,
              maxCredit: 3995,
              phaseOutStart: 21560,
              phaseOutEnd: 46560,
              phaseOutRate: 0.1598,
            },
            qualifying_widow: {
              phaseInLimit: 11750,
              phaseInRate: 0.34,
              maxCredit: 3995,
              phaseOutStart: 28120,
              phaseOutEnd: 53120,
              phaseOutRate: 0.1598,
            },
          },
          2: {
            // Two children
            single: {
              phaseInLimit: 16510,
              phaseInRate: 0.4,
              maxCredit: 6604,
              phaseOutStart: 21560,
              phaseOutEnd: 49622,
              phaseOutRate: 0.2106,
            },
            married_joint: {
              phaseInLimit: 16510,
              phaseInRate: 0.4,
              maxCredit: 6604,
              phaseOutStart: 25950,
              phaseOutEnd: 55442,
              phaseOutRate: 0.2106,
            },
            head_of_household: {
              phaseInLimit: 16510,
              phaseInRate: 0.4,
              maxCredit: 6604,
              phaseOutStart: 21560,
              phaseOutEnd: 49622,
              phaseOutRate: 0.2106,
            },
            qualifying_widow: {
              phaseInLimit: 16510,
              phaseInRate: 0.4,
              maxCredit: 6604,
              phaseOutStart: 25950,
              phaseOutEnd: 55442,
              phaseOutRate: 0.2106,
            },
          },
          3: {
            // Three or more children
            single: {
              phaseInLimit: 16510,
              phaseInRate: 0.45,
              maxCredit: 7430,
              phaseOutStart: 21560,
              phaseOutEnd: 56838,
              phaseOutRate: 0.2106,
            },
            married_joint: {
              phaseInLimit: 16510,
              phaseInRate: 0.45,
              maxCredit: 7430,
              phaseOutStart: 25950,
              phaseOutEnd: 63398,
              phaseOutRate: 0.2106,
            },
            head_of_household: {
              phaseInLimit: 16510,
              phaseInRate: 0.45,
              maxCredit: 7430,
              phaseOutStart: 21560,
              phaseOutEnd: 56838,
              phaseOutRate: 0.2106,
            },
            qualifying_widow: {
              phaseInLimit: 16510,
              phaseInRate: 0.45,
              maxCredit: 7430,
              phaseOutStart: 25950,
              phaseOutEnd: 63398,
              phaseOutRate: 0.2106,
            },
          },
        },
        educationCredits: {
          aotc: {
            maxCredit: 2500,
            refundableAmount: 1000,
            phaseOutStart: {
              single: 80000,
              married_joint: 160000,
              married_separate: 80000,
              head_of_household: 80000,
              qualifying_widow: 160000,
            },
            phaseOutEnd: {
              single: 90000,
              married_joint: 180000,
              married_separate: 90000,
              head_of_household: 90000,
              qualifying_widow: 180000,
            },
            maxQualifiedExpenses: 4000,
          },
          llc: {
            maxCredit: 2000,
            phaseOutStart: {
              single: 80000,
              married_joint: 160000,
              married_separate: 80000,
              head_of_household: 80000,
              qualifying_widow: 160000,
            },
            phaseOutEnd: {
              single: 90000,
              married_joint: 180000,
              married_separate: 90000,
              head_of_household: 90000,
              qualifying_widow: 180000,
            },
            maxQualifiedExpenses: 10000,
          },
        },
        saltDeductionCap: 10000,
        medicalExpenseThreshold: 0.075, // 7.5% of AGI
        charitableContributionLimit: 0.6, // 60% of AGI for cash contributions
        qualifiedBusinessIncomeDeduction: {
          rate: 0.2, // 20% of QBI
          thresholds: {
            single: 170050,
            married_joint: 340100,
            married_separate: 170050,
            head_of_household: 170050,
            qualifying_widow: 340100,
          },
          phaseOutRange: 50000,
        },
      },
      // 2022 Tax Data
      {
        year: 2022,
        taxBrackets: {
          single: [
            { min: 0, max: 10275, rate: 0.1 },
            { min: 10275, max: 41775, rate: 0.12 },
            { min: 41775, max: 89075, rate: 0.22 },
            { min: 89075, max: 170050, rate: 0.24 },
            { min: 170050, max: 215950, rate: 0.32 },
            { min: 215950, max: 539900, rate: 0.35 },
            { min: 539900, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          married_joint: [
            { min: 0, max: 20550, rate: 0.1 },
            { min: 20550, max: 83550, rate: 0.12 },
            { min: 83550, max: 178150, rate: 0.22 },
            { min: 178150, max: 340100, rate: 0.24 },
            { min: 340100, max: 431900, rate: 0.32 },
            { min: 431900, max: 647850, rate: 0.35 },
            { min: 647850, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          married_separate: [
            { min: 0, max: 10275, rate: 0.1 },
            { min: 10275, max: 41775, rate: 0.12 },
            { min: 41775, max: 89075, rate: 0.22 },
            { min: 89075, max: 170050, rate: 0.24 },
            { min: 170050, max: 215950, rate: 0.32 },
            { min: 215950, max: 323925, rate: 0.35 },
            { min: 323925, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          head_of_household: [
            { min: 0, max: 14650, rate: 0.1 },
            { min: 14650, max: 55900, rate: 0.12 },
            { min: 55900, max: 89050, rate: 0.22 },
            { min: 89050, max: 170050, rate: 0.24 },
            { min: 170050, max: 215950, rate: 0.32 },
            { min: 215950, max: 539900, rate: 0.35 },
            { min: 539900, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
          qualifying_widow: [
            { min: 0, max: 20550, rate: 0.1 },
            { min: 20550, max: 83550, rate: 0.12 },
            { min: 83550, max: 178150, rate: 0.22 },
            { min: 178150, max: 340100, rate: 0.24 },
            { min: 340100, max: 431900, rate: 0.32 },
            { min: 431900, max: 647850, rate: 0.35 },
            { min: 647850, max: Number.POSITIVE_INFINITY, rate: 0.37 },
          ],
        },
        standardDeductions: {
          single: 12950,
          married_joint: 25900,
          married_separate: 12950,
          head_of_household: 19400,
          qualifying_widow: 25900,
        },
        socialSecurityWageBase: 147000,
        additionalMedicareThreshold: {
          single: 200000,
          married_joint: 250000,
          married_separate: 125000,
          head_of_household: 200000,
          qualifying_widow: 250000,
        },
        childTaxCredit: {
          maxCredit: 2000,
          refundableAmount: 1500, // Additional Child Tax Credit (ACTC) limit
          phaseOutThreshold: {
            single: 200000,
            married_joint: 400000,
            married_separate: 200000,
            head_of_household: 200000,
            qualifying_widow: 400000,
          },
          phaseOutRate: 50, // $50 per $1,000 of AGI over threshold
        },
        amtExemptions: {
          single: 75900,
          married_joint: 118100,
          married_separate: 59050,
          head_of_household: 75900,
          qualifying_widow: 118100,
        },
        amtExemptionPhaseout: {
          single: {
            threshold: 539900,
            rate: 0.25, // 25% phase-out rate
          },
          married_joint: {
            threshold: 1079800,
            rate: 0.25,
          },
          married_separate: {
            threshold: 539900,
            rate: 0.25,
          },
          head_of_household: {
            threshold: 539900,
            rate: 0.25,
          },
          qualifying_widow: {
            threshold: 1079800,
            rate: 0.25,
          },
        },
        amtRates: {
          single: [
            { threshold: 206100, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          married_joint: [
            { threshold: 206100, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          married_separate: [
            { threshold: 103050, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          head_of_household: [
            { threshold: 206100, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
          qualifying_widow: [
            { threshold: 206100, rate: 0.26 },
            { threshold: Number.POSITIVE_INFINITY, rate: 0.28 },
          ],
        },
        earnedIncomeTaxCredit: {
          0: {
            // No children
            single: {
              phaseInLimit: 7320,
              phaseInRate: 0.0765,
              maxCredit: 560,
              phaseOutStart: 9160,
              phaseOutEnd: 16480,
              phaseOutRate: 0.0765,
            },
            married_joint: {
              phaseInLimit: 7320,
              phaseInRate: 0.0765,
              maxCredit: 560,
              phaseOutStart: 15290,
              phaseOutEnd: 22610,
              phaseOutRate: 0.0765,
            },
            head_of_household: {
              phaseInLimit: 7320,
              phaseInRate: 0.0765,
              maxCredit: 560,
              phaseOutStart: 9160,
              phaseOutEnd: 16480,
              phaseOutRate: 0.0765,
            },
            qualifying_widow: {
              phaseInLimit: 7320,
              phaseInRate: 0.0765,
              maxCredit: 560,
              phaseOutStart: 15290,
              phaseOutEnd: 22610,
              phaseOutRate: 0.0765,
            },
          },
          1: {
            // One child
            single: {
              phaseInLimit: 10980,
              phaseInRate: 0.34,
              maxCredit: 3733,
              phaseOutStart: 20130,
              phaseOutEnd: 43492,
              phaseOutRate: 0.1598,
            },
            married_joint: {
              phaseInLimit: 10980,
              phaseInRate: 0.34,
              maxCredit: 3733,
              phaseOutStart: 25950,
              phaseOutEnd: 49312,
              phaseOutRate: 0.1598,
            },
            head_of_household: {
              phaseInLimit: 10980,
              phaseInRate: 0.34,
              maxCredit: 3733,
              phaseOutStart: 20130,
              phaseOutEnd: 43492,
              phaseOutRate: 0.1598,
            },
            qualifying_widow: {
              phaseInLimit: 10980,
              phaseInRate: 0.34,
              maxCredit: 3733,
              phaseOutStart: 25950,
              phaseOutEnd: 49312,
              phaseOutRate: 0.1598,
            },
          },
          2: {
            // Two children
            single: {
              phaseInLimit: 15410,
              phaseInRate: 0.4,
              maxCredit: 6164,
              phaseOutStart: 20130,
              phaseOutEnd: 49622,
              phaseOutRate: 0.2106,
            },
            married_joint: {
              phaseInLimit: 15410,
              phaseInRate: 0.4,
              maxCredit: 6164,
              phaseOutStart: 25950,
              phaseOutEnd: 55442,
              phaseOutRate: 0.2106,
            },
            head_of_household: {
              phaseInLimit: 15410,
              phaseInRate: 0.4,
              maxCredit: 6164,
              phaseOutStart: 20130,
              phaseOutEnd: 49622,
              phaseOutRate: 0.2106,
            },
            qualifying_widow: {
              phaseInLimit: 15410,
              phaseInRate: 0.4,
              maxCredit: 6164,
              phaseOutStart: 25950,
              phaseOutEnd: 55442,
              phaseOutRate: 0.2106,
            },
          },
          3: {
            // Three or more children
            single: {
              phaseInLimit: 15410,
              phaseInRate: 0.45,
              maxCredit: 6935,
              phaseOutStart: 20130,
              phaseOutEnd: 53057,
              phaseOutRate: 0.2106,
            },
            married_joint: {
              phaseInLimit: 15410,
              phaseInRate: 0.45,
              maxCredit: 6935,
              phaseOutStart: 25950,
              phaseOutEnd: 58877,
              phaseOutRate: 0.2106,
            },
            head_of_household: {
              phaseInLimit: 15410,
              phaseInRate: 0.45,
              maxCredit: 6935,
              phaseOutStart: 20130,
              phaseOutEnd: 53057,
              phaseOutRate: 0.2106,
            },
            qualifying_widow: {
              phaseInLimit: 15410,
              phaseInRate: 0.45,
              maxCredit: 6935,
              phaseOutStart: 25950,
              phaseOutEnd: 58877,
              phaseOutRate: 0.2106,
            },
          },
        },
        educationCredits: {
          aotc: {
            maxCredit: 2500,
            refundableAmount: 1000,
            phaseOutStart: {
              single: 80000,
              married_joint: 160000,
              married_separate: 80000,
              head_of_household: 80000,
              qualifying_widow: 160000,
            },
            phaseOutEnd: {
              single: 90000,
              married_joint: 180000,
              married_separate: 90000,
              head_of_household: 90000,
              qualifying_widow: 180000,
            },
            maxQualifiedExpenses: 4000,
          },
          llc: {
            maxCredit: 2000,
            phaseOutStart: {
              single: 80000,
              married_joint: 160000,
              married_separate: 80000,
              head_of_household: 80000,
              qualifying_widow: 160000,
            },
            phaseOutEnd: {
              single: 90000,
              married_joint: 180000,
              married_separate: 90000,
              head_of_household: 90000,
              qualifying_widow: 180000,
            },
            maxQualifiedExpenses: 10000,
          },
        },
        saltDeductionCap: 10000,
        medicalExpenseThreshold: 0.075, // 7.5% of AGI
        charitableContributionLimit: 0.6, // 60% of AGI for cash contributions
        qualifiedBusinessIncomeDeduction: {
          rate: 0.2, // 20% of QBI
          thresholds: {
            single: 170050,
            married_joint: 340100,
            married_separate: 170050,
            head_of_household: 170050,
            qualifying_widow: 340100,
          },
          phaseOutRange: 50000,
        },
      },
    ]
  }
}
