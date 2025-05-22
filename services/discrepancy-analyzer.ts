import type { WageAndIncomeTranscript, RecordOfAccountTranscript, FilingStatus } from "../types/transcript"
import type { Finding, StatuteInformation } from "../types/analysis"
import { generateId, formatCurrency } from "../utils/helpers"
import { TaxImpactCalculator } from "./tax-impact-calculator"

export class DiscrepancyAnalyzer {
  private taxImpactCalculator: TaxImpactCalculator

  constructor() {
    this.taxImpactCalculator = new TaxImpactCalculator()
  }

  /**
   * Analyze transcripts for discrepancies
   */
  async analyzeDiscrepancies(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
    threshold = 10,
  ): Promise<Finding[]> {
    const findings: Finding[] = []

    // Income discrepancies
    findings.push(...(await this.analyzeIncomeDiscrepancies(wageIncome, recordOfAccount, threshold)))

    // Withholding discrepancies
    findings.push(...(await this.analyzeWithholdingDiscrepancies(wageIncome, recordOfAccount, threshold)))

    // Self-employment income discrepancies
    findings.push(...(await this.analyzeSelfEmploymentDiscrepancies(wageIncome, recordOfAccount, threshold)))

    // Deduction discrepancies
    findings.push(...(await this.analyzeDeductionDiscrepancies(wageIncome, recordOfAccount, threshold)))

    // Credit discrepancies
    findings.push(...(await this.analyzeCreditDiscrepancies(wageIncome, recordOfAccount, threshold)))

    return findings.filter((f) => f.potentialRefund > threshold)
  }

  /**
   * Analyze income discrepancies between wage & income and record of account
   */
  private async analyzeIncomeDiscrepancies(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
    threshold: number,
  ): Promise<Finding[]> {
    const findings: Finding[] = []

    // Calculate total reported income from W-2s and 1099s
    const reportedWages = wageIncome.incomeItems
      .filter((item) => item.formType === "W-2")
      .reduce((sum, item) => sum + (item.box1 || 0), 0)

    const reportedNonEmployeeComp = wageIncome.incomeItems
      .filter((item) => item.formType === "1099-NEC")
      .reduce((sum, item) => sum + (item.box1 || 0), 0)

    const reportedInterest = wageIncome.incomeItems
      .filter((item) => item.formType === "1099-INT")
      .reduce((sum, item) => sum + (item.box3 || 0), 0)

    const reportedDividends = wageIncome.incomeItems
      .filter((item) => item.formType === "1099-DIV")
      .reduce((sum, item) => sum + (item.box4 || 0), 0)

    // Compare with tax return data
    const wageDifference = reportedWages - (recordOfAccount.returnData.wages || 0)
    const interestDifference = reportedInterest - (recordOfAccount.returnData.interestIncome || 0)
    const dividendDifference = reportedDividends - (recordOfAccount.returnData.dividendIncome || 0)

    if (Math.abs(wageDifference) > threshold) {
      findings.push(
        await this.createIncomeDiscrepancyFinding(
          "wage_discrepancy",
          wageDifference,
          reportedWages,
          recordOfAccount.returnData.wages || 0,
          recordOfAccount.filingStatus,
          recordOfAccount.taxYear,
          recordOfAccount.returnData.adjustedGrossIncome,
          recordOfAccount.returnData.dependents,
        ),
      )
    }

    if (Math.abs(interestDifference) > threshold) {
      findings.push(
        await this.createIncomeDiscrepancyFinding(
          "interest_discrepancy",
          interestDifference,
          reportedInterest,
          recordOfAccount.returnData.interestIncome || 0,
          recordOfAccount.filingStatus,
          recordOfAccount.taxYear,
          recordOfAccount.returnData.adjustedGrossIncome,
          recordOfAccount.returnData.dependents,
        ),
      )
    }

    if (Math.abs(dividendDifference) > threshold) {
      findings.push(
        await this.createIncomeDiscrepancyFinding(
          "dividend_discrepancy",
          dividendDifference,
          reportedDividends,
          recordOfAccount.returnData.dividendIncome || 0,
          recordOfAccount.filingStatus,
          recordOfAccount.taxYear,
          recordOfAccount.returnData.adjustedGrossIncome,
          recordOfAccount.returnData.dependents,
        ),
      )
    }

    return findings
  }

  /**
   * Analyze withholding discrepancies
   */
  private async analyzeWithholdingDiscrepancies(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
    threshold: number,
  ): Promise<Finding[]> {
    const findings: Finding[] = []

    // Calculate total reported withholding
    const reportedWithholding = wageIncome.incomeItems.reduce((sum, item) => sum + (item.box2 || 0), 0)

    // Get withholding claimed on tax return
    const claimedWithholding = recordOfAccount.returnData.totalPayments || 0

    // Calculate difference
    const withholdingDifference = reportedWithholding - claimedWithholding

    if (Math.abs(withholdingDifference) > threshold) {
      findings.push(
        await this.createWithholdingDiscrepancyFinding(
          withholdingDifference,
          reportedWithholding,
          claimedWithholding,
          recordOfAccount.filingStatus,
          recordOfAccount.taxYear,
          recordOfAccount.returnData.adjustedGrossIncome,
        ),
      )
    }

    return findings
  }

  /**
   * Analyze self-employment income discrepancies
   */
  private async analyzeSelfEmploymentDiscrepancies(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
    threshold: number,
  ): Promise<Finding[]> {
    const findings: Finding[] = []

    // Calculate total reported self-employment income
    const reportedSEIncome = wageIncome.incomeItems
      .filter((item) => item.formType === "1099-NEC" || item.formType === "1099-MISC")
      .reduce((sum, item) => sum + (item.box1 || 0), 0)

    // Get self-employment income claimed on tax return
    const claimedSEIncome = recordOfAccount.returnData.businessIncome || 0

    // Calculate difference
    const seIncomeDifference = reportedSEIncome - claimedSEIncome

    if (Math.abs(seIncomeDifference) > threshold) {
      findings.push(
        await this.createSelfEmploymentDiscrepancyFinding(
          seIncomeDifference,
          reportedSEIncome,
          claimedSEIncome,
          recordOfAccount.filingStatus,
          recordOfAccount.taxYear,
          recordOfAccount.returnData.adjustedGrossIncome,
        ),
      )
    }

    return findings
  }

  /**
   * Analyze deduction discrepancies (simplified)
   */
  private async analyzeDeductionDiscrepancies(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
    threshold: number,
  ): Promise<Finding[]> {
    // This would be a more complex implementation in reality
    // For this example, we'll return an empty array
    return []
  }

  /**
   * Analyze credit discrepancies (simplified)
   */
  private async analyzeCreditDiscrepancies(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
    threshold: number,
  ): Promise<Finding[]> {
    // This would be a more complex implementation in reality
    // For this example, we'll return an empty array
    return []
  }

  /**
   * Create a finding for income discrepancies
   */
  private async createIncomeDiscrepancyFinding(
    type: string,
    difference: number,
    reported: number,
    filed: number,
    filingStatus: FilingStatus,
    taxYear: number,
    agi: number,
    dependents = 0,
  ): Promise<Finding> {
    const taxImpact = await this.taxImpactCalculator.calculateIncomeDiscrepancyImpact(
      difference,
      agi,
      filingStatus,
      taxYear,
      dependents,
    )

    const potentialRefund = difference < 0 ? Math.abs(taxImpact.taxImpact) : 0

    return {
      id: generateId(),
      type: "income_discrepancy",
      severity: Math.abs(taxImpact.taxImpact) > 500 ? "high" : Math.abs(taxImpact.taxImpact) > 100 ? "medium" : "low",
      title: `${type.replace("_", " ")} Income Discrepancy`,
      description: `Reported income (${formatCurrency(reported)}) differs from filed amount (${formatCurrency(
        filed,
      )}) by ${formatCurrency(Math.abs(difference))}`,
      potentialRefund,
      actionRequired: difference < 0 ? "File amended return (Form 1040X)" : "Verify accuracy of original return",
      supportingData: { reported, filed, difference, taxImpact },
      confidence: "high",
      statute: this.calculateStatuteDeadline(taxYear, "refund"),
    }
  }

  /**
   * Create a finding for withholding discrepancies
   */
  private async createWithholdingDiscrepancyFinding(
    difference: number,
    reported: number,
    claimed: number,
    filingStatus: FilingStatus,
    taxYear: number,
    agi: number,
  ): Promise<Finding> {
    const taxImpact = await this.taxImpactCalculator.calculateWithholdingDiscrepancyImpact(
      difference,
      agi,
      filingStatus,
      taxYear,
    )

    return {
      id: generateId(),
      type: "withholding_discrepancy",
      severity: Math.abs(difference) > 500 ? "high" : Math.abs(difference) > 100 ? "medium" : "low",
      title: "Withholding Discrepancy",
      description: `Reported withholding (${formatCurrency(reported)}) differs from claimed amount (${formatCurrency(
        claimed,
      )}) by ${formatCurrency(Math.abs(difference))}`,
      potentialRefund: difference > 0 ? difference : 0,
      actionRequired:
        difference > 0
          ? "File amended return (Form 1040X) to claim additional withholding"
          : "Verify withholding documentation",
      supportingData: { reported, claimed, difference, taxImpact },
      confidence: "high",
      statute: this.calculateStatuteDeadline(taxYear, "refund"),
    }
  }

  /**
   * Create a finding for self-employment income discrepancies
   */
  private async createSelfEmploymentDiscrepancyFinding(
    difference: number,
    reported: number,
    claimed: number,
    filingStatus: FilingStatus,
    taxYear: number,
    agi: number,
  ): Promise<Finding> {
    const taxImpact = await this.taxImpactCalculator.calculateSelfEmploymentDiscrepancyImpact(
      difference,
      agi,
      claimed,
      filingStatus,
      taxYear,
    )

    const potentialRefund = difference < 0 ? Math.abs(taxImpact.taxImpact) : 0

    return {
      id: generateId(),
      type: "income_discrepancy",
      severity: Math.abs(taxImpact.taxImpact) > 500 ? "high" : Math.abs(taxImpact.taxImpact) > 100 ? "medium" : "low",
      title: "Self-Employment Income Discrepancy",
      description: `Reported self-employment income (${formatCurrency(
        reported,
      )}) differs from filed amount (${formatCurrency(claimed)}) by ${formatCurrency(Math.abs(difference))}`,
      potentialRefund,
      actionRequired: difference < 0 ? "File amended return (Form 1040X)" : "Verify accuracy of original return",
      supportingData: { reported, claimed, difference, taxImpact },
      confidence: "high",
      statute: this.calculateStatuteDeadline(taxYear, "refund"),
    }
  }

  /**
   * Calculate statute of limitations deadline
   */
  private calculateStatuteDeadline(
    taxYear: number,
    statuteType: "refund" | "assessment" | "collection",
  ): StatuteInformation {
    const filingDeadline = new Date(taxYear + 1, 3, 15) // April 15th of following year
    let deadline: Date

    switch (statuteType) {
      case "refund":
        // 3 years from filing deadline
        deadline = new Date(filingDeadline)
        deadline.setFullYear(deadline.getFullYear() + 3)
        break
      case "assessment":
        // 3 years from filing deadline
        deadline = new Date(filingDeadline)
        deadline.setFullYear(deadline.getFullYear() + 3)
        break
      case "collection":
        // 10 years from assessment date
        deadline = new Date(filingDeadline)
        deadline.setFullYear(deadline.getFullYear() + 10)
        break
      default:
        deadline = new Date(filingDeadline)
        deadline.setFullYear(deadline.getFullYear() + 3)
    }

    const today = new Date()
    const daysRemaining = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      deadline,
      daysRemaining,
      statuteType,
    }
  }
}
