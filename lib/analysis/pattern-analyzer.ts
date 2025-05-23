import type { ParsedTranscriptData } from "./pdf-parser"

export interface PatternAnalysisResult {
  patterns: DetectedPattern[]
  riskLevel: "low" | "medium" | "high"
  recommendations: string[]
  totalPotentialRecovery: number
  confidenceScore: number
}

export interface DetectedPattern {
  type: PatternType
  description: string
  yearsAffected: number[]
  severity: "low" | "medium" | "high"
  potentialRecovery: number
  evidence: PatternEvidence[]
  recommendation: string
}

export type PatternType =
  | "recurring_underreporting"
  | "missing_deductions"
  | "penalty_pattern"
  | "withholding_discrepancy"
  | "estimated_tax_issues"
  | "business_income_pattern"
  | "investment_income_pattern"
  | "charitable_deduction_pattern"

export interface PatternEvidence {
  year: number
  description: string
  amount: number
  source: string
}

export interface MultiYearData {
  transcripts: Map<number, ParsedTranscriptData>
  taxReturns?: Map<number, any> // Would contain tax return data if available
}

export class PatternAnalyzer {
  static analyzeMultiYearPatterns(data: MultiYearData): PatternAnalysisResult {
    const patterns: DetectedPattern[] = []

    // Analyze different pattern types
    patterns.push(...this.analyzeIncomePatterns(data))
    patterns.push(...this.analyzeDeductionPatterns(data))
    patterns.push(...this.analyzePenaltyPatterns(data))
    patterns.push(...this.analyzeWithholdingPatterns(data))
    patterns.push(...this.analyzeEstimatedTaxPatterns(data))

    const totalPotentialRecovery = patterns.reduce((sum, pattern) => sum + pattern.potentialRecovery, 0)
    const riskLevel = this.calculateRiskLevel(patterns)
    const recommendations = this.generateRecommendations(patterns)
    const confidenceScore = this.calculateConfidenceScore(patterns, data)

    return {
      patterns,
      riskLevel,
      recommendations,
      totalPotentialRecovery,
      confidenceScore,
    }
  }

  private static analyzeIncomePatterns(data: MultiYearData): DetectedPattern[] {
    const patterns: DetectedPattern[] = []
    const years = Array.from(data.transcripts.keys()).sort()

    // Check for recurring underreporting
    const underreportingPattern = this.detectUnderreporting(data, years)
    if (underreportingPattern) {
      patterns.push(underreportingPattern)
    }

    // Check for business income patterns
    const businessIncomePattern = this.detectBusinessIncomeIssues(data, years)
    if (businessIncomePattern) {
      patterns.push(businessIncomePattern)
    }

    // Check for investment income patterns
    const investmentIncomePattern = this.detectInvestmentIncomeIssues(data, years)
    if (investmentIncomePattern) {
      patterns.push(investmentIncomePattern)
    }

    return patterns
  }

  private static detectUnderreporting(data: MultiYearData, years: number[]): DetectedPattern | null {
    const underreportingYears: number[] = []
    const evidence: PatternEvidence[] = []
    let totalUnderreported = 0

    for (const year of years) {
      const transcript = data.transcripts.get(year)
      if (!transcript) continue

      // Look for unreported 1099 income
      const unreportedIncome = transcript.incomeItems.filter((item) => !item.reported)

      if (unreportedIncome.length > 0) {
        underreportingYears.push(year)

        for (const income of unreportedIncome) {
          totalUnderreported += income.amount
          evidence.push({
            year,
            description: `Unreported ${income.type.toUpperCase()} from ${income.payer}`,
            amount: income.amount,
            source: "transcript_analysis",
          })
        }
      }
    }

    if (underreportingYears.length >= 2) {
      const potentialRecovery = this.estimateRecoveryFromUnderreporting(totalUnderreported)

      return {
        type: "recurring_underreporting",
        description: `Consistent pattern of unreported income across ${underreportingYears.length} years`,
        yearsAffected: underreportingYears,
        severity: underreportingYears.length >= 3 ? "high" : "medium",
        potentialRecovery,
        evidence,
        recommendation: "File amended returns strategically, starting with years closest to statute expiration",
      }
    }

    return null
  }

  private static detectBusinessIncomeIssues(data: MultiYearData, years: number[]): DetectedPattern | null {
    const businessYears: number[] = []
    const evidence: PatternEvidence[] = []
    let totalIssues = 0

    for (const year of years) {
      const transcript = data.transcripts.get(year)
      if (!transcript) continue

      // Look for 1099-NEC or Schedule C issues
      const businessIncome = transcript.incomeItems.filter(
        (item) => item.type === "1099-nec" || item.type === "schedule-c",
      )

      if (businessIncome.length > 0) {
        businessYears.push(year)

        for (const income of businessIncome) {
          if (!income.reported) {
            totalIssues += income.amount
            evidence.push({
              year,
              description: `Unreported business income: ${income.type.toUpperCase()}`,
              amount: income.amount,
              source: "business_analysis",
            })
          }
        }
      }
    }

    if (businessYears.length >= 2 && totalIssues > 0) {
      const potentialRecovery = this.estimateBusinessIncomeRecovery(totalIssues)

      return {
        type: "business_income_pattern",
        description: `Business income reporting issues across ${businessYears.length} years`,
        yearsAffected: businessYears,
        severity: totalIssues > 50000 ? "high" : "medium",
        potentialRecovery,
        evidence,
        recommendation: "Review business income reporting and consider amended returns with proper business deductions",
      }
    }

    return null
  }

  private static detectInvestmentIncomeIssues(data: MultiYearData, years: number[]): DetectedPattern | null {
    const investmentYears: number[] = []
    const evidence: PatternEvidence[] = []
    let totalIssues = 0

    for (const year of years) {
      const transcript = data.transcripts.get(year)
      if (!transcript) continue

      // Look for 1099-INT, 1099-DIV issues
      const investmentIncome = transcript.incomeItems.filter(
        (item) => item.type === "1099-int" || item.type === "1099-div",
      )

      if (investmentIncome.length > 0) {
        investmentYears.push(year)

        for (const income of investmentIncome) {
          if (!income.reported) {
            totalIssues += income.amount
            evidence.push({
              year,
              description: `Unreported investment income: ${income.type.toUpperCase()}`,
              amount: income.amount,
              source: "investment_analysis",
            })
          }
        }
      }
    }

    if (investmentYears.length >= 2 && totalIssues > 0) {
      const potentialRecovery = this.estimateInvestmentIncomeRecovery(totalIssues)

      return {
        type: "investment_income_pattern",
        description: `Investment income reporting issues across ${investmentYears.length} years`,
        yearsAffected: investmentYears,
        severity: totalIssues > 10000 ? "medium" : "low",
        potentialRecovery,
        evidence,
        recommendation: "Review investment income reporting and consider tax-loss harvesting opportunities",
      }
    }

    return null
  }

  private static analyzeDeductionPatterns(data: MultiYearData): DetectedPattern[] {
    const patterns: DetectedPattern[] = []
    const years = Array.from(data.transcripts.keys()).sort()

    // Analyze for missing deduction patterns
    const missingDeductions = this.detectMissingDeductions(data, years)
    if (missingDeductions) {
      patterns.push(missingDeductions)
    }

    return patterns
  }

  private static detectMissingDeductions(data: MultiYearData, years: number[]): DetectedPattern | null {
    // This would analyze for consistently missed deductions
    // Implementation would depend on having tax return data to compare against transcripts
    return null
  }

  private static analyzePenaltyPatterns(data: MultiYearData): DetectedPattern[] {
    const patterns: DetectedPattern[] = []
    const years = Array.from(data.transcripts.keys()).sort()

    const penaltyPattern = this.detectRecurringPenalties(data, years)
    if (penaltyPattern) {
      patterns.push(penaltyPattern)
    }

    return patterns
  }

  private static detectRecurringPenalties(data: MultiYearData, years: number[]): DetectedPattern | null {
    const penaltyYears: number[] = []
    const evidence: PatternEvidence[] = []
    let totalPenalties = 0

    for (const year of years) {
      const transcript = data.transcripts.get(year)
      if (!transcript) continue

      const abatementEligiblePenalties = transcript.penalties.filter((p) => p.abatementEligible)

      if (abatementEligiblePenalties.length > 0) {
        penaltyYears.push(year)

        for (const penalty of abatementEligiblePenalties) {
          totalPenalties += penalty.amount
          evidence.push({
            year,
            description: `${penalty.type} penalty eligible for abatement`,
            amount: penalty.amount,
            source: "penalty_analysis",
          })
        }
      }
    }

    if (penaltyYears.length > 0) {
      return {
        type: "penalty_pattern",
        description: `Penalties eligible for abatement across ${penaltyYears.length} years`,
        yearsAffected: penaltyYears,
        severity: totalPenalties > 5000 ? "high" : "medium",
        potentialRecovery: totalPenalties,
        evidence,
        recommendation: "Request penalty abatement for eligible penalties, especially first-time occurrences",
      }
    }

    return null
  }

  private static analyzeWithholdingPatterns(data: MultiYearData): DetectedPattern[] {
    // Implementation for withholding analysis
    return []
  }

  private static analyzeEstimatedTaxPatterns(data: MultiYearData): DetectedPattern[] {
    // Implementation for estimated tax analysis
    return []
  }

  private static calculateRiskLevel(patterns: DetectedPattern[]): "low" | "medium" | "high" {
    const highSeverityCount = patterns.filter((p) => p.severity === "high").length
    const mediumSeverityCount = patterns.filter((p) => p.severity === "medium").length

    if (highSeverityCount >= 2) return "high"
    if (highSeverityCount >= 1 || mediumSeverityCount >= 3) return "medium"
    return "low"
  }

  private static generateRecommendations(patterns: DetectedPattern[]): string[] {
    const recommendations = new Set<string>()

    for (const pattern of patterns) {
      recommendations.add(pattern.recommendation)
    }

    // Add general recommendations based on patterns
    if (patterns.some((p) => p.type === "recurring_underreporting")) {
      recommendations.add("Implement better record-keeping procedures to prevent future underreporting")
    }

    if (patterns.some((p) => p.type === "penalty_pattern")) {
      recommendations.add("Consider setting up estimated tax payments to avoid future penalties")
    }

    return Array.from(recommendations)
  }

  private static calculateConfidenceScore(patterns: DetectedPattern[], data: MultiYearData): number {
    let totalEvidence = 0
    let weightedScore = 0

    for (const pattern of patterns) {
      const evidenceCount = pattern.evidence.length
      const yearSpan = pattern.yearsAffected.length
      const severityWeight = pattern.severity === "high" ? 3 : pattern.severity === "medium" ? 2 : 1

      const patternScore = (evidenceCount * yearSpan * severityWeight) / 10
      weightedScore += Math.min(patternScore, 1) // Cap at 1.0 per pattern
      totalEvidence += evidenceCount
    }

    // Base confidence on amount of evidence and data quality
    const dataQuality = data.transcripts.size >= 3 ? 1.0 : data.transcripts.size / 3
    const evidenceQuality = Math.min(totalEvidence / 10, 1.0)

    return Math.min(weightedScore * dataQuality * evidenceQuality, 1.0)
  }

  private static estimateRecoveryFromUnderreporting(amount: number): number {
    // Simplified recovery estimation - would be more sophisticated in practice
    const estimatedTaxRate = 0.22 // Assume 22% marginal rate
    return amount * estimatedTaxRate
  }

  private static estimateBusinessIncomeRecovery(amount: number): number {
    // Business income recovery considering self-employment tax
    const incomeTaxRate = 0.22
    const selfEmploymentTaxRate = 0.1413 // 14.13% SE tax rate
    return amount * (incomeTaxRate + selfEmploymentTaxRate)
  }

  private static estimateInvestmentIncomeRecovery(amount: number): number {
    // Investment income typically taxed at lower rates
    const capitalGainsRate = 0.15 // Assume 15% capital gains rate
    return amount * capitalGainsRate
  }
}
