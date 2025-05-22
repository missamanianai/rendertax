import type { RecordOfAccountTranscript, TransactionCode } from "../types/transcript"
import type { Finding } from "../types/analysis"
import { generateId, formatCurrency } from "../utils/helpers"

export class EventAnalyzer {
  // Transaction codes that can lead to actionable findings
  private readonly ACTIONABLE_CODES: Record<
    string,
    {
      type: string
      description: string
      reversible: boolean
    }
  > = {
    // Penalties
    "160": { type: "penalty", description: "Penalty for Late Filing", reversible: true },
    "161": { type: "penalty", description: "Penalty for Late Payment", reversible: true },
    "166": { type: "penalty", description: "Estimated Tax Penalty", reversible: true },

    // Examinations/Audits
    "420": { type: "examination", description: "Examination of Return", reversible: true },
    "421": { type: "examination", description: "Examination Closed", reversible: false },
    "424": { type: "examination", description: "Underreported Income Review", reversible: true },

    // Refund Issues
    "740": { type: "refund", description: "Undeliverable Refund Check", reversible: true },
    "766": { type: "refund", description: "Credit to Account", reversible: false },
    "570": { type: "refund", description: "Additional Account Action Pending", reversible: true },
    "571": { type: "refund", description: "Resolved Additional Account Action", reversible: false },

    // Missing Returns
    "150": { type: "filing", description: "Return Filed", reversible: false },
    "976": { type: "filing", description: "No Return Filed", reversible: true },
    "560": { type: "filing", description: "Substitute Return Filed", reversible: true },

    // Collections
    "582": { type: "collection", description: "Lien Filed", reversible: true },
    "584": { type: "collection", description: "Lien Release", reversible: false },
  }

  /**
   * Analyze transcript events for actionable findings
   */
  async analyzeEvents(recordOfAccount: RecordOfAccountTranscript): Promise<Finding[]> {
    const findings: Finding[] = []

    for (const transaction of recordOfAccount.transactions) {
      const codeInfo = this.ACTIONABLE_CODES[transaction.code]

      if (codeInfo && codeInfo.reversible) {
        const finding = await this.analyzeTransaction(transaction, codeInfo, recordOfAccount)
        if (finding) findings.push(finding)
      }
    }

    return findings
  }

  /**
   * Analyze a specific transaction for actionable findings
   */
  private async analyzeTransaction(
    transaction: TransactionCode,
    codeInfo: any,
    recordOfAccount: RecordOfAccountTranscript,
  ): Promise<Finding | null> {
    switch (codeInfo.type) {
      case "penalty":
        return this.analyzePenalty(transaction, recordOfAccount)
      case "examination":
        return this.analyzeExamination(transaction, recordOfAccount)
      case "refund":
        return this.analyzeRefundIssue(transaction, recordOfAccount)
      case "filing":
        return this.analyzeFilingIssue(transaction, recordOfAccount)
      default:
        return null
    }
  }

  /**
   * Analyze penalty transactions
   */
  private analyzePenalty(transaction: TransactionCode, recordOfAccount: RecordOfAccountTranscript): Finding {
    const abatementPotential = this.assessPenaltyAbatementPotential(transaction, recordOfAccount)

    return {
      id: generateId(),
      type: "penalty_abatement",
      severity: transaction.amount > 1000 ? "high" : transaction.amount > 250 ? "medium" : "low",
      title: `${transaction.description} - Abatement Opportunity`,
      description: `Penalty of ${formatCurrency(transaction.amount)} may be eligible for abatement`,
      potentialRefund: abatementPotential.likelihood > 0.5 ? transaction.amount : 0,
      actionRequired: this.getPenaltyAbatementAction(transaction.code),
      supportingData: { transaction, abatementPotential },
      confidence: abatementPotential.likelihood > 0.7 ? "high" : "medium",
      statute: this.calculateStatuteDeadline(recordOfAccount.taxYear, "assessment"),
    }
  }

  /**
   * Analyze examination/audit transactions
   */
  private analyzeExamination(transaction: TransactionCode, recordOfAccount: RecordOfAccountTranscript): Finding | null {
    // Implementation would depend on specific business rules
    return null
  }

  /**
   * Analyze refund issue transactions
   */
  private analyzeRefundIssue(transaction: TransactionCode, recordOfAccount: RecordOfAccountTranscript): Finding | null {
    if (transaction.code === "740") {
      return this.analyzeUndeliverableRefund(transaction, recordOfAccount)
    }

    if (transaction.code === "570") {
      return this.analyzeRefundFreeze(transaction, recordOfAccount)
    }

    return null
  }

  /**
   * Analyze undeliverable refund transactions
   */
  private analyzeUndeliverableRefund(
    transaction: TransactionCode,
    recordOfAccount: RecordOfAccountTranscript,
  ): Finding {
    const refundAmount = this.findAssociatedRefund(transaction, recordOfAccount.transactions)

    return {
      id: generateId(),
      type: "undeliverable_refund",
      severity: "high",
      title: "Undeliverable Refund Check",
      description: `Refund check of ${formatCurrency(refundAmount)} was undeliverable and may still be claimable`,
      potentialRefund: refundAmount,
      actionRequired: "Contact IRS to update address and request refund reissuance",
      supportingData: { transaction, refundAmount },
      confidence: "high",
      statute: this.calculateStatuteDeadline(recordOfAccount.taxYear, "refund"),
    }
  }

  /**
   * Analyze refund freeze transactions
   */
  private analyzeRefundFreeze(transaction: TransactionCode, recordOfAccount: RecordOfAccountTranscript): Finding {
    return {
      id: generateId(),
      type: "refund_freeze",
      severity: "medium",
      title: "Refund Freeze",
      description: "Your refund has been frozen pending additional review",
      potentialRefund: recordOfAccount.returnData.refundAmount || 0,
      actionRequired: "Contact IRS to determine reason for freeze and provide requested information",
      supportingData: { transaction },
      confidence: "medium",
      statute: this.calculateStatuteDeadline(recordOfAccount.taxYear, "refund"),
    }
  }

  /**
   * Analyze filing issue transactions
   */
  private analyzeFilingIssue(transaction: TransactionCode, recordOfAccount: RecordOfAccountTranscript): Finding | null {
    if (transaction.code === "560") {
      return this.analyzeSubstituteReturn(transaction, recordOfAccount)
    }

    return null
  }

  /**
   * Analyze substitute return transactions
   */
  private analyzeSubstituteReturn(transaction: TransactionCode, recordOfAccount: RecordOfAccountTranscript): Finding {
    return {
      id: generateId(),
      type: "substitute_return",
      severity: "high",
      title: "Substitute Return Filed by IRS",
      description:
        "The IRS has filed a substitute return on your behalf, which may not include all deductions and credits",
      potentialRefund: this.estimateSubstituteReturnImpact(recordOfAccount),
      actionRequired: "File a proper tax return to replace the substitute return",
      supportingData: { transaction },
      confidence: "high",
      statute: this.calculateStatuteDeadline(recordOfAccount.taxYear, "assessment"),
    }
  }

  /**
   * Find associated refund for an undeliverable refund transaction
   */
  private findAssociatedRefund(undeliverableTransaction: TransactionCode, allTransactions: TransactionCode[]): number {
    // Look for refund transactions near the undeliverable date
    const refundCodes = ["846", "740"]

    for (const transaction of allTransactions) {
      if (refundCodes.includes(transaction.code)) {
        const daysDifference = Math.abs(
          (undeliverableTransaction.date.getTime() - transaction.date.getTime()) / (1000 * 60 * 60 * 24),
        )

        if (daysDifference <= 30) {
          // Within 30 days
          return Math.abs(transaction.amount)
        }
      }
    }

    return 0
  }

  /**
   * Assess penalty abatement potential
   */
  private assessPenaltyAbatementPotential(
    transaction: TransactionCode,
    recordOfAccount: RecordOfAccountTranscript,
  ): { likelihood: number; reasons: string[] } {
    const reasons: string[] = []
    let likelihood = 0.3 // Base likelihood

    // First-time filer bonus
    if (this.isFirstTimeFiler(recordOfAccount)) {
      likelihood += 0.3
      reasons.push("First-time filer")
    }

    // Reasonable cause indicators
    if (this.hasReasonableCauseIndicators(recordOfAccount)) {
      likelihood += 0.2
      reasons.push("Potential reasonable cause")
    }

    // Small penalty amount
    if (transaction.amount < 500) {
      likelihood += 0.1
      reasons.push("Small penalty amount")
    }

    return { likelihood: Math.min(likelihood, 1.0), reasons }
  }

  /**
   * Check if taxpayer is a first-time filer
   */
  private isFirstTimeFiler(recordOfAccount: RecordOfAccountTranscript): boolean {
    // This would be a more complex implementation in reality
    // For this example, we'll return a simple mock value
    return false
  }

  /**
   * Check for reasonable cause indicators
   */
  private hasReasonableCauseIndicators(recordOfAccount: RecordOfAccountTranscript): boolean {
    // This would be a more complex implementation in reality
    // For this example, we'll return a simple mock value
    return false
  }

  /**
   * Get penalty abatement action based on transaction code
   */
  private getPenaltyAbatementAction(code: string): string {
    switch (code) {
      case "160":
        return "Submit Form 843 for First-Time Penalty Abatement"
      case "161":
        return "Submit Form 843 for Reasonable Cause Penalty Abatement"
      case "166":
        return "Submit Form 843 for Estimated Tax Penalty Waiver"
      default:
        return "Submit Form 843 for Penalty Abatement"
    }
  }

  /**
   * Estimate financial impact of substitute return
   */
  private estimateSubstituteReturnImpact(recordOfAccount: RecordOfAccountTranscript): number {
    // This would be a more complex implementation in reality
    // For this example, we'll return a simple mock value
    return 1500
  }

  /**
   * Calculate statute of limitations deadline
   */
  private calculateStatuteDeadline(
    taxYear: number,
    statuteType: "refund" | "assessment" | "collection",
  ): { deadline: Date; daysRemaining: number; statuteType: string } {
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
