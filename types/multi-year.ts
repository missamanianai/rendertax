export interface YearlyTaxData {
  year: number
  effectiveTaxRate: number
  totalIncome: number
  adjustedGrossIncome: number
  taxableIncome: number
  totalTax: number
  totalCredits: number
  totalDeductions: number
  totalWithholding: number
  refundOrDue: number
  selfEmploymentTax?: number
  capitalGains?: number
  qualifiedDividends?: number
  filingStatus: FilingStatus
}

export type FilingStatus = "single" | "married_joint" | "married_separate" | "head_of_household" | "qualifying_widow"

export interface TaxMetricChange {
  year: number
  value: number
  previousValue: number | null
  change: number | null
  percentChange: number | null
  trend: "up" | "down" | "stable" | "none"
}

export interface TaxTrend {
  metric: string
  data: TaxMetricChange[]
  averageValue: number
  minValue: number
  maxValue: number
  minYear: number
  maxYear: number
  overallTrend: "increasing" | "decreasing" | "stable" | "fluctuating"
  anomalies: TaxAnomaly[]
}

export interface TaxAnomaly {
  year: number
  metric: string
  value: number
  expectedValue: number
  deviation: number
  percentDeviation: number
  severity: "low" | "medium" | "high"
  potentialCauses: string[]
}

export interface MultiYearAnalysisResult {
  taxData: YearlyTaxData[]
  trends: {
    effectiveTaxRate: TaxTrend
    totalIncome: TaxTrend
    adjustedGrossIncome: TaxTrend
    taxableIncome: TaxTrend
    totalTax: TaxTrend
    totalCredits: TaxTrend
    totalDeductions: TaxTrend
    totalWithholding: TaxTrend
    refundOrDue: TaxTrend
  }
  anomalies: TaxAnomaly[]
  opportunities: TaxOpportunity[]
  riskAreas: TaxRiskArea[]
}

export interface TaxOpportunity {
  id: string
  title: string
  description: string
  years: number[]
  potentialSavings: number
  confidence: "low" | "medium" | "high"
  implementationComplexity: "low" | "medium" | "high"
  actionSteps: string[]
}

export interface TaxRiskArea {
  id: string
  title: string
  description: string
  years: number[]
  potentialImpact: number
  probability: "low" | "medium" | "high"
  severity: "low" | "medium" | "high"
  mitigationSteps: string[]
}
