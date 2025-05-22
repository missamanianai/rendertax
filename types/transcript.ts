export interface WageAndIncomeTranscript {
  taxYear: number
  taxpayerSSN: string
  taxpayerName: string
  incomeItems: IncomeItem[]
  withholdings: WithholdingItem[]
  totalWages: number
  totalWithholding: number
  processedDate: Date
}

export interface IncomeItem {
  payerName: string
  payerEIN: string
  formType: "1099-MISC" | "1099-INT" | "1099-DIV" | "W-2" | "W-2G" | "1099-R" | "1099-NEC"
  box1?: number // Wages/Non-employee compensation
  box2?: number // Federal tax withheld
  box3?: number // Interest income
  box4?: number // Dividend income
  box5?: number // IRA distributions
  [key: string]: any // Additional boxes as needed
}

export interface WithholdingItem {
  payerName: string
  payerEIN: string
  amount: number
  formType: string
}

export interface RecordOfAccountTranscript {
  taxYear: number
  taxpayerSSN: string
  taxpayerName: string
  filingStatus: FilingStatus
  transactions: TransactionCode[]
  returnData: TaxReturnData
  accountBalance: number
  refundAmount?: number
  processedDate: Date
}

export interface TransactionCode {
  code: string
  date: Date
  description: string
  amount: number
  reference?: string
  cycleDate?: string
  blockingCode?: string
}

export interface TaxReturnData {
  adjustedGrossIncome: number
  totalTax: number
  totalPayments: number
  refundAmount: number
  taxableIncome: number
  standardDeduction: number
  itemizedDeduction?: number
  exemptions: number
  dependents: number
  filingStatus: FilingStatus
  wages?: number
  interestIncome?: number
  dividendIncome?: number
  businessIncome?: number
  capitalGains?: number
  retirementIncome?: number
  otherIncome?: number
}

export type FilingStatus = "single" | "married_joint" | "married_separate" | "head_of_household" | "qualifying_widow"

export type TranscriptType = "wage_income" | "record_account" | "account_transcript"

export interface ParsedTranscript {
  type: TranscriptType
  data: WageAndIncomeTranscript | RecordOfAccountTranscript
}
