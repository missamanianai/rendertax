export interface AnalysisResult {
  sessionId: string
  taxYear: number
  analysisType: "discrepancy" | "event" | "miscellaneous"
  findings: Finding[]
  totalPotentialRefund: number
  confidence: ConfidenceLevel
  processingTime: number
  warnings: Warning[]
}

export interface Finding {
  id: string
  type: FindingType
  severity: "high" | "medium" | "low"
  title: string
  description: string
  potentialRefund: number
  actionRequired: string
  supportingData: any
  confidence: ConfidenceLevel
  statute: StatuteInformation
}

export type FindingType =
  | "income_discrepancy"
  | "withholding_discrepancy"
  | "deduction_discrepancy"
  | "credit_discrepancy"
  | "penalty_abatement"
  | "undeliverable_refund"
  | "refund_freeze"
  | "audit_response"
  | "missing_return"
  | "substitute_return"

export type ConfidenceLevel = "high" | "medium" | "low"

export interface StatuteInformation {
  deadline: Date
  daysRemaining: number
  statuteType: "refund" | "assessment" | "collection"
}

export interface Warning {
  type: string
  message: string
  severity: "high" | "medium" | "low"
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: string
  message: string
  severity: "critical" | "high" | "medium"
}

export interface ValidationWarning {
  type: string
  message: string
  severity: "high" | "medium" | "low"
}

export interface TaxBracket {
  min: number
  max: number
  rate: number
}
