import type { WageAndIncomeTranscript, RecordOfAccountTranscript } from "../types/transcript"
import type { ValidationResult, ValidationError, ValidationWarning } from "../types/analysis"

export class ValidationEngine {
  /**
   * Validate analysis input data
   */
  validateAnalysisInput(
    wageIncome: WageAndIncomeTranscript,
    recordOfAccount: RecordOfAccountTranscript,
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // SSN consistency check
    if (wageIncome.taxpayerSSN !== recordOfAccount.taxpayerSSN) {
      errors.push({
        type: "ssn_mismatch",
        message: "SSN mismatch between transcripts",
        severity: "critical",
      })
    }

    // Tax year consistency
    if (wageIncome.taxYear !== recordOfAccount.taxYear) {
      errors.push({
        type: "tax_year_mismatch",
        message: "Tax year mismatch between transcripts",
        severity: "critical",
      })
    }

    // Name similarity check
    const nameSimilarity = this.calculateNameSimilarity(wageIncome.taxpayerName, recordOfAccount.taxpayerName)

    if (nameSimilarity < 0.8) {
      warnings.push({
        type: "name_mismatch",
        message: "Names differ between transcripts",
        severity: "medium",
      })
    }

    // Check for missing critical data
    if (!recordOfAccount.returnData.adjustedGrossIncome) {
      warnings.push({
        type: "missing_agi",
        message: "Adjusted Gross Income is missing from transcript",
        severity: "medium",
      })
    }

    if (wageIncome.incomeItems.length === 0) {
      warnings.push({
        type: "no_income_items",
        message: "No income items found in Wage & Income transcript",
        severity: "high",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Calculate similarity between two names
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Simple Levenshtein distance calculation
    const a = name1.toLowerCase().replace(/[^a-z]/g, "")
    const b = name2.toLowerCase().replace(/[^a-z]/g, "")

    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null))

    for (let i = 0; i <= a.length; i += 1) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= b.length; j += 1) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost, // substitution
        )
      }
    }

    const distance = matrix[b.length][a.length]
    return 1 - distance / Math.max(a.length, b.length)
  }
}
