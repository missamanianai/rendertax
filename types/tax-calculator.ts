import type { FilingStatus } from "./transcript"

// Core tax calculation interfaces
export interface TaxCalculationParams {
  taxYear: number
  filingStatus: FilingStatus
  originalScenario: TaxScenario
  changes: Partial<TaxScenario>
}

export interface TaxScenario {
  adjustedGrossIncome: number
  earnedIncome?: number
  selfEmploymentIncome?: number
  educationExpenses?: number
  itemizedDeductions?: ItemizedDeductions
  dependents?: Dependent[]
  filingStatus: FilingStatus
  taxYear: number
}

export interface ItemizedDeductions {
  stateLocalTax?: number
  mortgageInterest?: number
  charitableContributions?: number
  medicalExpenses?: number
  miscellaneousDeductions?: number
}

export interface Dependent {
  name: string
  dateOfBirth: Date
  relationship: string
  qualifyingChild: boolean
  qualifyingRelative: boolean
}

export interface TaxImpactResult {
  taxImpact: number
  refundChange: number
  marginalRate: number
  effectiveRate: number
  breakdown: TaxBreakdown
}

export interface TaxBreakdown {
  originalTax: TaxCalculationResult
  revisedTax: TaxCalculationResult
  incomeTaxChange: number
  selfEmploymentTaxChange: number
  alternativeMinimumTaxChange: number
}

export interface TaxCalculationResult {
  adjustedGrossIncome: number
  taxableIncome: number
  deductions: DeductionCalculation
  incomeTax: number
  selfEmploymentTax: number
  alternativeMinimumTax: number
  credits: CreditCalculation
  totalTax: number
  effectiveRate: number
}

export interface DeductionCalculation {
  standardDeduction: number
  itemizedDeductions: number
  totalDeductions: number
  usingItemized: boolean
  breakdown?: {
    stateLocalTax: number
    mortgageInterest: number
    charitableContributions: number
    medicalExpenses: number
    miscellaneousDeductions: number
  }
}

export interface CreditCalculation {
  totalCredits: number
  breakdown: Record<string, number>
}

// Tax data structures
export interface TaxYearData {
  year: number
  taxBrackets: Record<FilingStatus, TaxBracket[]>
  standardDeductions: Record<FilingStatus, number>
  socialSecurityWageBase: number
  additionalMedicareThreshold: Record<FilingStatus, number>
  childTaxCredit: ChildTaxCreditData
  amtExemptions: Record<FilingStatus, number>
  amtExemptionPhaseout: Record<FilingStatus, AMTPhaseout>
  amtRates: Record<FilingStatus, AMTRate[]>
  earnedIncomeTaxCredit: EITCData
  educationCredits: EducationCreditData
  saltDeductionCap: number
  medicalExpenseThreshold: number
  charitableContributionLimit: number
  qualifiedBusinessIncomeDeduction: QBIDeductionData
}

export interface TaxBracket {
  min: number
  max: number
  rate: number
}

export interface ChildTaxCreditData {
  maxCredit: number
  refundableAmount: number
  phaseOutThreshold: Record<FilingStatus, number>
  phaseOutRate: number
}

export interface AMTPhaseout {
  threshold: number
  rate: number
}

export interface AMTRate {
  threshold: number
  rate: number
}

export interface EITCData {
  [children: number]: Record<FilingStatus, EITCBracket>
}

export interface EITCBracket {
  phaseInLimit: number
  phaseInRate: number
  maxCredit: number
  phaseOutStart: number
  phaseOutEnd: number
  phaseOutRate: number
}

export interface EducationCreditData {
  aotc: {
    maxCredit: number
    refundableAmount: number
    phaseOutStart: Record<FilingStatus, number>
    phaseOutEnd: Record<FilingStatus, number>
    maxQualifiedExpenses: number
  }
  llc: {
    maxCredit: number
    phaseOutStart: Record<FilingStatus, number>
    phaseOutEnd: Record<FilingStatus, number>
    maxQualifiedExpenses: number
  }
}

export interface QBIDeductionData {
  rate: number
  thresholds: Record<FilingStatus, number>
  phaseOutRange: number
}
