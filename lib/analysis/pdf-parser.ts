import pdf from "pdf-parse"
import type { TranscriptMetadata } from "@/lib/types"

export interface ParsedTranscriptData {
  rawText: string
  metadata: TranscriptMetadata
  sections: TranscriptSection[]
  taxYear: number
  taxpayerInfo: TaxpayerInfo
  incomeItems: IncomeItem[]
  deductions: DeductionItem[]
  credits: CreditItem[]
  payments: PaymentItem[]
  penalties: PenaltyItem[]
  transactionCodes: TransactionCode[]
}

export interface TranscriptSection {
  type: "header" | "income" | "deductions" | "credits" | "payments" | "penalties" | "transactions"
  content: string
  lineNumbers: number[]
}

export interface TaxpayerInfo {
  name: string
  ssn: string
  address: string
  filingStatus: string
  dependents: number
}

export interface IncomeItem {
  type: "wages" | "1099-int" | "1099-div" | "1099-misc" | "1099-nec" | "schedule-c" | "other"
  payer: string
  amount: number
  reported: boolean
  source: string
}

export interface DeductionItem {
  type: "standard" | "itemized" | "business" | "other"
  description: string
  amount: number
  substantiated: boolean
}

export interface CreditItem {
  type: "child" | "education" | "earned-income" | "other"
  description: string
  amount: number
  qualified: boolean
}

export interface PaymentItem {
  type: "withholding" | "estimated" | "refund" | "other"
  amount: number
  date: string
  source: string
}

export interface PenaltyItem {
  type: "late-filing" | "late-payment" | "estimated-tax" | "accuracy" | "other"
  amount: number
  reason: string
  abatementEligible: boolean
}

export interface TransactionCode {
  code: string
  date: string
  amount: number
  description: string
  category: "assessment" | "payment" | "refund" | "penalty" | "interest" | "other"
}

export class PDFTranscriptParser {
  private static readonly TRANSCRIPT_PATTERNS = {
    // IRS transcript identification patterns
    WAGE_INCOME: /WAGE AND INCOME TRANSCRIPT/i,
    RECORD_ACCOUNT: /RECORD OF ACCOUNT TRANSCRIPT/i,
    ACCOUNT_TRANSCRIPT: /ACCOUNT TRANSCRIPT/i,

    // Tax year extraction
    TAX_YEAR: /(?:TAX YEAR|FOR YEAR)\s+(\d{4})/i,

    // Taxpayer information
    TAXPAYER_NAME: /NAME:\s*([A-Z\s,]+)/i,
    SSN: /SSN:\s*(\d{3}-\d{2}-\d{4}|\*{3}-\*{2}-\d{4})/i,
    ADDRESS: /ADDRESS:\s*(.+?)(?=\n[A-Z]+:|$)/s,
    FILING_STATUS: /FILING STATUS:\s*(\d+)/,

    // Income patterns
    INCOME_LINE: /(\d{2})\s+([A-Z0-9\-\s]+)\s+(\d+\.\d{2})/g,
    FORM_1099: /1099-?(INT|DIV|MISC|NEC|R)\s+(.+?)\s+(\d+\.\d{2})/gi,

    // Transaction codes
    TRANSACTION_CODE: /(\d{3})\s+(\d{2}\/\d{2}\/\d{4})\s+([+-]?\d+\.\d{2})/g,

    // Penalty patterns
    PENALTY_CODE: /(160|161|162|163|164|165|166|167|168|169)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+\.\d{2})/g,
  }

  static async parseTranscript(pdfBuffer: Buffer): Promise<ParsedTranscriptData> {
    try {
      const pdfData = await pdf(pdfBuffer)
      const rawText = pdfData.text

      const metadata = this.extractMetadata(rawText)
      const sections = this.extractSections(rawText)
      const taxpayerInfo = this.extractTaxpayerInfo(rawText)
      const incomeItems = this.extractIncomeItems(rawText)
      const deductions = this.extractDeductions(rawText)
      const credits = this.extractCredits(rawText)
      const payments = this.extractPayments(rawText)
      const penalties = this.extractPenalties(rawText)
      const transactionCodes = this.extractTransactionCodes(rawText)

      return {
        rawText,
        metadata,
        sections,
        taxYear: metadata.taxYear || new Date().getFullYear() - 1,
        taxpayerInfo,
        incomeItems,
        deductions,
        credits,
        payments,
        penalties,
        transactionCodes,
      }
    } catch (error) {
      throw new Error(`Failed to parse PDF transcript: ${error.message}`)
    }
  }

  private static extractMetadata(text: string): TranscriptMetadata {
    const metadata: TranscriptMetadata = {}

    // Determine transcript type
    if (this.TRANSCRIPT_PATTERNS.WAGE_INCOME.test(text)) {
      metadata.transcriptType = "wage_income"
    } else if (this.TRANSCRIPT_PATTERNS.RECORD_ACCOUNT.test(text)) {
      metadata.transcriptType = "record_account"
    } else if (this.TRANSCRIPT_PATTERNS.ACCOUNT_TRANSCRIPT.test(text)) {
      metadata.transcriptType = "account_transcript"
    }

    // Extract tax year
    const taxYearMatch = text.match(this.TRANSCRIPT_PATTERNS.TAX_YEAR)
    if (taxYearMatch) {
      metadata.taxYear = Number.parseInt(taxYearMatch[1])
    }

    // Extract SSN (last 4 digits)
    const ssnMatch = text.match(this.TRANSCRIPT_PATTERNS.SSN)
    if (ssnMatch) {
      metadata.lastFourSSN = ssnMatch[1].slice(-4)
    }

    // Extract taxpayer name
    const nameMatch = text.match(this.TRANSCRIPT_PATTERNS.TAXPAYER_NAME)
    if (nameMatch) {
      metadata.taxpayerName = nameMatch[1].trim()
    }

    return metadata
  }

  private static extractSections(text: string): TranscriptSection[] {
    const sections: TranscriptSection[] = []
    const lines = text.split("\n")

    let currentSection: TranscriptSection | null = null

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Identify section headers
      if (line.includes("INCOME")) {
        if (currentSection) sections.push(currentSection)
        currentSection = { type: "income", content: "", lineNumbers: [] }
      } else if (line.includes("DEDUCTION")) {
        if (currentSection) sections.push(currentSection)
        currentSection = { type: "deductions", content: "", lineNumbers: [] }
      } else if (line.includes("CREDIT")) {
        if (currentSection) sections.push(currentSection)
        currentSection = { type: "credits", content: "", lineNumbers: [] }
      } else if (line.includes("PAYMENT") || line.includes("WITHHOLDING")) {
        if (currentSection) sections.push(currentSection)
        currentSection = { type: "payments", content: "", lineNumbers: [] }
      } else if (line.includes("PENALTY")) {
        if (currentSection) sections.push(currentSection)
        currentSection = { type: "penalties", content: "", lineNumbers: [] }
      } else if (line.includes("TRANSACTION")) {
        if (currentSection) sections.push(currentSection)
        currentSection = { type: "transactions", content: "", lineNumbers: [] }
      }

      if (currentSection) {
        currentSection.content += line + "\n"
        currentSection.lineNumbers.push(lineNumber)
      }
    })

    if (currentSection) sections.push(currentSection)

    return sections
  }

  private static extractTaxpayerInfo(text: string): TaxpayerInfo {
    const nameMatch = text.match(this.TRANSCRIPT_PATTERNS.TAXPAYER_NAME)
    const ssnMatch = text.match(this.TRANSCRIPT_PATTERNS.SSN)
    const addressMatch = text.match(this.TRANSCRIPT_PATTERNS.ADDRESS)
    const filingStatusMatch = text.match(this.TRANSCRIPT_PATTERNS.FILING_STATUS)

    return {
      name: nameMatch ? nameMatch[1].trim() : "",
      ssn: ssnMatch ? ssnMatch[1] : "",
      address: addressMatch ? addressMatch[1].trim() : "",
      filingStatus: filingStatusMatch ? this.getFilingStatusDescription(filingStatusMatch[1]) : "",
      dependents: 0, // Would need additional parsing logic
    }
  }

  private static extractIncomeItems(text: string): IncomeItem[] {
    const incomeItems: IncomeItem[] = []

    // Extract 1099 forms
    const form1099Matches = Array.from(text.matchAll(this.TRANSCRIPT_PATTERNS.FORM_1099))
    form1099Matches.forEach((match) => {
      const formType = match[1].toLowerCase()
      const payer = match[2].trim()
      const amount = Number.parseFloat(match[3])

      incomeItems.push({
        type: `1099-${formType}` as any,
        payer,
        amount,
        reported: true, // Would need cross-reference with return
        source: "transcript",
      })
    })

    return incomeItems
  }

  private static extractDeductions(text: string): DeductionItem[] {
    // Implementation for extracting deduction information
    return []
  }

  private static extractCredits(text: string): CreditItem[] {
    // Implementation for extracting credit information
    return []
  }

  private static extractPayments(text: string): PaymentItem[] {
    // Implementation for extracting payment information
    return []
  }

  private static extractPenalties(text: string): PenaltyItem[] {
    const penalties: PenaltyItem[] = []

    const penaltyMatches = Array.from(text.matchAll(this.TRANSCRIPT_PATTERNS.PENALTY_CODE))
    penaltyMatches.forEach((match) => {
      const code = match[1]
      const date = match[2]
      const amount = Number.parseFloat(match[3])

      penalties.push({
        type: this.getPenaltyType(code),
        amount,
        reason: this.getPenaltyDescription(code),
        abatementEligible: this.isPenaltyAbatementEligible(code),
      })
    })

    return penalties
  }

  private static extractTransactionCodes(text: string): TransactionCode[] {
    const transactions: TransactionCode[] = []

    const transactionMatches = Array.from(text.matchAll(this.TRANSCRIPT_PATTERNS.TRANSACTION_CODE))
    transactionMatches.forEach((match) => {
      const code = match[1]
      const date = match[2]
      const amount = Number.parseFloat(match[3])

      transactions.push({
        code,
        date,
        amount,
        description: this.getTransactionDescription(code),
        category: this.getTransactionCategory(code),
      })
    })

    return transactions
  }

  private static getFilingStatusDescription(code: string): string {
    const statuses: Record<string, string> = {
      "1": "Single",
      "2": "Married Filing Jointly",
      "3": "Married Filing Separately",
      "4": "Head of Household",
      "5": "Qualifying Widow(er)",
    }
    return statuses[code] || "Unknown"
  }

  private static getPenaltyType(code: string): PenaltyItem["type"] {
    const penaltyTypes: Record<string, PenaltyItem["type"]> = {
      "160": "late-filing",
      "161": "late-payment",
      "162": "estimated-tax",
      "163": "accuracy",
    }
    return penaltyTypes[code] || "other"
  }

  private static getPenaltyDescription(code: string): string {
    const descriptions: Record<string, string> = {
      "160": "Failure to File Penalty",
      "161": "Failure to Pay Penalty",
      "162": "Estimated Tax Penalty",
      "163": "Accuracy-Related Penalty",
    }
    return descriptions[code] || `Penalty Code ${code}`
  }

  private static isPenaltyAbatementEligible(code: string): boolean {
    // First-time penalty abatement eligible codes
    const abatementEligible = ["160", "161", "162"]
    return abatementEligible.includes(code)
  }

  private static getTransactionDescription(code: string): string {
    const descriptions: Record<string, string> = {
      "150": "Tax Return Filed",
      "290": "Additional Tax Assessment",
      "300": "Additional Tax Assessment",
      "420": "Compliance Assessment",
      "570": "Additional Account Action Pending",
      "610": "Account Transferred Out",
      "700": "Overpayment Transferred In",
      "740": "Refund Issued",
      "766": "Credit to Account",
      "768": "Earned Income Credit",
      "806": "W-2 or 1099 Withholding",
      "826": "Estimated Tax Payment",
    }
    return descriptions[code] || `Transaction Code ${code}`
  }

  private static getTransactionCategory(code: string): TransactionCode["category"] {
    const categories: Record<string, TransactionCode["category"]> = {
      "150": "assessment",
      "290": "assessment",
      "300": "assessment",
      "420": "assessment",
      "740": "refund",
      "766": "payment",
      "768": "refund",
      "806": "payment",
      "826": "payment",
    }
    return categories[code] || "other"
  }
}
