import type { ParsedTranscriptData } from "./pdf-parser"
import type { PatternAnalysisResult, DetectedPattern } from "./pattern-analyzer"

export interface MLAnalysisResult {
  anomalies: TaxAnomaly[]
  predictions: RefundPrediction[]
  riskAssessment: RiskAssessment
  recommendations: MLRecommendation[]
  confidenceScore: number
}

export interface TaxAnomaly {
  type: AnomalyType
  description: string
  severity: number // 0-1 scale
  likelihood: number // 0-1 scale
  potentialImpact: number
  evidence: string[]
}

export type AnomalyType =
  | "income_outlier"
  | "deduction_anomaly"
  | "timing_irregularity"
  | "amount_inconsistency"
  | "pattern_deviation"

export interface RefundPrediction {
  type: "refund_opportunity" | "penalty_abatement" | "credit_eligibility"
  description: string
  estimatedAmount: number
  probability: number
  timeframe: string
  requirements: string[]
}

export interface RiskAssessment {
  auditRisk: number // 0-1 scale
  penaltyRisk: number
  complianceScore: number
  factors: RiskFactor[]
}

export interface RiskFactor {
  factor: string
  impact: number
  description: string
}

export interface MLRecommendation {
  priority: "high" | "medium" | "low"
  action: string
  reasoning: string
  expectedOutcome: string
  timeline: string
}

export class MLAnalyzer {
  private static readonly ANOMALY_THRESHOLDS = {
    INCOME_VARIANCE: 0.3, // 30% variance threshold
    DEDUCTION_RATIO: 0.25, // 25% of income threshold
    TIMING_DEVIATION: 30, // 30 days
    AMOUNT_OUTLIER: 2.0, // 2 standard deviations
  }

  private static readonly AUDIT_RISK_FACTORS = {
    HIGH_INCOME: { threshold: 200000, weight: 0.15 },
    BUSINESS_INCOME: { threshold: 25000, weight: 0.1 },
    LARGE_DEDUCTIONS: { threshold: 0.3, weight: 0.12 }, // 30% of income
    CASH_TRANSACTIONS: { threshold: 10000, weight: 0.08 },
    AMENDED_RETURNS: { weight: 0.05 },
    PRIOR_AUDIT: { weight: 0.2 },
  }

  static async analyzeWithML(
    transcriptData: ParsedTranscriptData[],
    patternAnalysis: PatternAnalysisResult,
  ): Promise<MLAnalysisResult> {
    const anomalies = await this.detectAnomalies(transcriptData)
    const predictions = await this.generatePredictions(transcriptData, patternAnalysis)
    const riskAssessment = this.assessRisk(transcriptData, anomalies)
    const recommendations = this.generateMLRecommendations(anomalies, predictions, riskAssessment)
    const confidenceScore = this.calculateMLConfidence(transcriptData, anomalies, predictions)

    return {
      anomalies,
      predictions,
      riskAssessment,
      recommendations,
      confidenceScore,
    }
  }

  private static async detectAnomalies(transcriptData: ParsedTranscriptData[]): Promise<TaxAnomaly[]> {
    const anomalies: TaxAnomaly[] = []

    // Income outlier detection
    const incomeAnomalies = this.detectIncomeOutliers(transcriptData)
    anomalies.push(...incomeAnomalies)

    // Deduction anomaly detection
    const deductionAnomalies = this.detectDeductionAnomalies(transcriptData)
    anomalies.push(...deductionAnomalies)

    // Timing irregularity detection
    const timingAnomalies = this.detectTimingIrregularities(transcriptData)
    anomalies.push(...timingAnomalies)

    // Amount inconsistency detection
    const amountAnomalies = this.detectAmountInconsistencies(transcriptData)
    anomalies.push(...amountAnomalies)

    return anomalies
  }

  private static detectIncomeOutliers(transcriptData: ParsedTranscriptData[]): TaxAnomaly[] {
    const anomalies: TaxAnomaly[] = []

    if (transcriptData.length < 2) return anomalies

    // Calculate income statistics
    const incomes = transcriptData.map((data) => data.incomeItems.reduce((sum, item) => sum + item.amount, 0))

    const mean = incomes.reduce((sum, income) => sum + income, 0) / incomes.length
    const variance = incomes.reduce((sum, income) => sum + Math.pow(income - mean, 2), 0) / incomes.length
    const stdDev = Math.sqrt(variance)

    transcriptData.forEach((data, index) => {
      const totalIncome = incomes[index]
      const zScore = Math.abs((totalIncome - mean) / stdDev)

      if (zScore > this.ANOMALY_THRESHOLDS.AMOUNT_OUTLIER) {
        anomalies.push({
          type: "income_outlier",
          description: `Income for ${data.taxYear} significantly deviates from historical pattern`,
          severity: Math.min(zScore / 3, 1), // Normalize to 0-1
          likelihood: 0.8,
          potentialImpact: Math.abs(totalIncome - mean),
          evidence: [
            `Income: $${totalIncome.toLocaleString()}`,
            `Historical average: $${mean.toLocaleString()}`,
            `Standard deviations from mean: ${zScore.toFixed(2)}`,
          ],
        })
      }
    })

    return anomalies
  }

  private static detectDeductionAnomalies(transcriptData: ParsedTranscriptData[]): TaxAnomaly[] {
    const anomalies: TaxAnomaly[] = []

    transcriptData.forEach((data) => {
      const totalIncome = data.incomeItems.reduce((sum, item) => sum + item.amount, 0)
      const totalDeductions = data.deductions.reduce((sum, item) => sum + item.amount, 0)
      const deductionRatio = totalDeductions / totalIncome

      if (deductionRatio > this.ANOMALY_THRESHOLDS.DEDUCTION_RATIO) {
        anomalies.push({
          type: "deduction_anomaly",
          description: `Unusually high deduction ratio for ${data.taxYear}`,
          severity: Math.min(deductionRatio / 0.5, 1),
          likelihood: 0.7,
          potentialImpact: totalDeductions * 0.22, // Assume 22% tax rate
          evidence: [
            `Total deductions: $${totalDeductions.toLocaleString()}`,
            `Deduction ratio: ${(deductionRatio * 100).toFixed(1)}%`,
            `Income: $${totalIncome.toLocaleString()}`,
          ],
        })
      }
    })

    return anomalies
  }

  private static detectTimingIrregularities(transcriptData: ParsedTranscriptData[]): TaxAnomaly[] {
    const anomalies: TaxAnomaly[] = []

    transcriptData.forEach((data) => {
      // Analyze payment timing patterns
      const payments = data.payments.filter((p) => p.type === "estimated")

      if (payments.length > 0) {
        const paymentDates = payments.map((p) => new Date(p.date))
        const expectedDates = [
          new Date(data.taxYear, 3, 15), // April 15
          new Date(data.taxYear, 5, 15), // June 15
          new Date(data.taxYear, 8, 15), // September 15
          new Date(data.taxYear + 1, 0, 15), // January 15
        ]

        paymentDates.forEach((paymentDate, index) => {
          if (index < expectedDates.length) {
            const daysDifference = Math.abs(
              (paymentDate.getTime() - expectedDates[index].getTime()) / (1000 * 60 * 60 * 24),
            )

            if (daysDifference > this.ANOMALY_THRESHOLDS.TIMING_DEVIATION) {
              anomalies.push({
                type: "timing_irregularity",
                description: `Estimated tax payment timing irregularity for ${data.taxYear}`,
                severity: Math.min(daysDifference / 90, 1),
                likelihood: 0.6,
                potentialImpact: 0, // Timing issues don't directly impact refunds
                evidence: [
                  `Payment date: ${paymentDate.toDateString()}`,
                  `Expected date: ${expectedDates[index].toDateString()}`,
                  `Days difference: ${daysDifference.toFixed(0)}`,
                ],
              })
            }
          }
        })
      }
    })

    return anomalies
  }

  private static detectAmountInconsistencies(transcriptData: ParsedTranscriptData[]): TaxAnomaly[] {
    const anomalies: TaxAnomaly[] = []

    transcriptData.forEach((data) => {
      // Check for round number bias (amounts ending in 00)
      const roundAmounts = data.incomeItems.filter((item) => item.amount % 100 === 0)
      const roundRatio = roundAmounts.length / data.incomeItems.length

      if (roundRatio > 0.5 && data.incomeItems.length > 3) {
        anomalies.push({
          type: "amount_inconsistency",
          description: `Unusually high proportion of round amounts for ${data.taxYear}`,
          severity: roundRatio,
          likelihood: 0.5,
          potentialImpact: 0,
          evidence: [
            `Round amounts: ${roundAmounts.length} of ${data.incomeItems.length}`,
            `Round ratio: ${(roundRatio * 100).toFixed(1)}%`,
            "May indicate estimated or fabricated amounts",
          ],
        })
      }
    })

    return anomalies
  }

  private static async generatePredictions(
    transcriptData: ParsedTranscriptData[],
    patternAnalysis: PatternAnalysisResult,
  ): Promise<RefundPrediction[]> {
    const predictions: RefundPrediction[] = []

    // Predict refund opportunities based on patterns
    for (const pattern of patternAnalysis.patterns) {
      if (pattern.potentialRecovery > 0) {
        predictions.push({
          type: "refund_opportunity",
          description: `Potential refund from ${pattern.type.replace(/_/g, " ")}`,
          estimatedAmount: pattern.potentialRecovery,
          probability: this.calculateProbability(pattern),
          timeframe: this.estimateTimeframe(pattern),
          requirements: this.getRequirements(pattern),
        })
      }
    }

    // Predict penalty abatement opportunities
    const penaltyPredictions = this.predictPenaltyAbatement(transcriptData)
    predictions.push(...penaltyPredictions)

    // Predict credit eligibility
    const creditPredictions = this.predictCreditEligibility(transcriptData)
    predictions.push(...creditPredictions)

    return predictions
  }

  private static predictPenaltyAbatement(transcriptData: ParsedTranscriptData[]): RefundPrediction[] {
    const predictions: RefundPrediction[] = []

    transcriptData.forEach((data) => {
      const abatementEligiblePenalties = data.penalties.filter((p) => p.abatementEligible)

      if (abatementEligiblePenalties.length > 0) {
        const totalPenalties = abatementEligiblePenalties.reduce((sum, p) => sum + p.amount, 0)

        predictions.push({
          type: "penalty_abatement",
          description: `First-time penalty abatement for ${data.taxYear}`,
          estimatedAmount: totalPenalties,
          probability: 0.85, // High success rate for first-time abatement
          timeframe: "60-90 days",
          requirements: [
            "No penalties in prior 3 years",
            "Current on all filing and payment requirements",
            "Submit written request with explanation",
          ],
        })
      }
    })

    return predictions
  }

  private static predictCreditEligibility(transcriptData: ParsedTranscriptData[]): RefundPrediction[] {
    const predictions: RefundPrediction[] = []

    transcriptData.forEach((data) => {
      // Check for potential education credits
      const educationIncome = data.incomeItems.filter(
        (item) => item.payer.toLowerCase().includes("university") || item.payer.toLowerCase().includes("college"),
      )

      if (educationIncome.length > 0) {
        predictions.push({
          type: "credit_eligibility",
          description: `Potential education credit for ${data.taxYear}`,
          estimatedAmount: 2500, // Maximum American Opportunity Credit
          probability: 0.7,
          timeframe: "Next filing season",
          requirements: ["Qualified education expenses", "Income limits apply", "Form 1098-T required"],
        })
      }

      // Check for potential child tax credit
      if (data.taxpayerInfo.dependents > 0) {
        const potentialCredit = Math.min(data.taxpayerInfo.dependents * 2000, 6000)

        predictions.push({
          type: "credit_eligibility",
          description: `Potential child tax credit optimization for ${data.taxYear}`,
          estimatedAmount: potentialCredit,
          probability: 0.6,
          timeframe: "Current year",
          requirements: [
            "Qualifying children under 17",
            "Income phase-out limits apply",
            "Proper documentation required",
          ],
        })
      }
    })

    return predictions
  }

  private static assessRisk(transcriptData: ParsedTranscriptData[], anomalies: TaxAnomaly[]): RiskAssessment {
    let auditRisk = 0
    let penaltyRisk = 0
    const factors: RiskFactor[] = []

    // Calculate audit risk based on various factors
    transcriptData.forEach((data) => {
      const totalIncome = data.incomeItems.reduce((sum, item) => sum + item.amount, 0)

      // High income factor
      if (totalIncome > this.AUDIT_RISK_FACTORS.HIGH_INCOME.threshold) {
        const factor = this.AUDIT_RISK_FACTORS.HIGH_INCOME.weight
        auditRisk += factor
        factors.push({
          factor: "High Income",
          impact: factor,
          description: `Income of $${totalIncome.toLocaleString()} increases audit risk`,
        })
      }

      // Business income factor
      const businessIncome = data.incomeItems
        .filter((item) => item.type === "1099-nec" || item.type === "schedule-c")
        .reduce((sum, item) => sum + item.amount, 0)

      if (businessIncome > this.AUDIT_RISK_FACTORS.BUSINESS_INCOME.threshold) {
        const factor = this.AUDIT_RISK_FACTORS.BUSINESS_INCOME.weight
        auditRisk += factor
        factors.push({
          factor: "Business Income",
          impact: factor,
          description: `Business income of $${businessIncome.toLocaleString()} increases audit risk`,
        })
      }

      // Large deductions factor
      const totalDeductions = data.deductions.reduce((sum, item) => sum + item.amount, 0)
      const deductionRatio = totalDeductions / totalIncome

      if (deductionRatio > this.AUDIT_RISK_FACTORS.LARGE_DEDUCTIONS.threshold) {
        const factor = this.AUDIT_RISK_FACTORS.LARGE_DEDUCTIONS.weight
        auditRisk += factor
        factors.push({
          factor: "Large Deductions",
          impact: factor,
          description: `Deduction ratio of ${(deductionRatio * 100).toFixed(1)}% increases audit risk`,
        })
      }
    })

    // Penalty risk based on anomalies and patterns
    anomalies.forEach((anomaly) => {
      penaltyRisk += anomaly.severity * 0.1
    })

    // Calculate compliance score
    const complianceScore = Math.max(0, 1 - (auditRisk + penaltyRisk))

    return {
      auditRisk: Math.min(auditRisk, 1),
      penaltyRisk: Math.min(penaltyRisk, 1),
      complianceScore,
      factors,
    }
  }

  private static generateMLRecommendations(
    anomalies: TaxAnomaly[],
    predictions: RefundPrediction[],
    riskAssessment: RiskAssessment,
  ): MLRecommendation[] {
    const recommendations: MLRecommendation[] = []

    // High-priority recommendations based on risk
    if (riskAssessment.auditRisk > 0.7) {
      recommendations.push({
        priority: "high",
        action: "Implement comprehensive documentation and record-keeping procedures",
        reasoning: "High audit risk detected based on income and deduction patterns",
        expectedOutcome: "Reduced audit risk and improved compliance",
        timeline: "Immediate",
      })
    }

    // Recommendations based on predictions
    const highValuePredictions = predictions.filter((p) => p.estimatedAmount > 5000)
    if (highValuePredictions.length > 0) {
      recommendations.push({
        priority: "high",
        action: "Pursue high-value refund opportunities immediately",
        reasoning: `${highValuePredictions.length} opportunities with total potential of $${highValuePredictions.reduce((sum, p) => sum + p.estimatedAmount, 0).toLocaleString()}`,
        expectedOutcome: "Significant tax savings and refunds",
        timeline: "30-90 days",
      })
    }

    // Recommendations based on anomalies
    const highSeverityAnomalies = anomalies.filter((a) => a.severity > 0.7)
    if (highSeverityAnomalies.length > 0) {
      recommendations.push({
        priority: "medium",
        action: "Address identified anomalies and inconsistencies",
        reasoning: `${highSeverityAnomalies.length} high-severity anomalies detected`,
        expectedOutcome: "Improved data quality and reduced compliance risk",
        timeline: "60 days",
      })
    }

    // Proactive recommendations
    if (riskAssessment.complianceScore < 0.8) {
      recommendations.push({
        priority: "medium",
        action: "Implement proactive tax planning strategies",
        reasoning: "Compliance score indicates room for improvement",
        expectedOutcome: "Better tax outcomes and reduced future issues",
        timeline: "Next tax year",
      })
    }

    return recommendations
  }

  private static calculateMLConfidence(
    transcriptData: ParsedTranscriptData[],
    anomalies: TaxAnomaly[],
    predictions: RefundPrediction[],
  ): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence based on data quality
    const dataQuality = Math.min(transcriptData.length / 3, 1) // More years = higher confidence
    confidence += dataQuality * 0.2

    // Increase confidence based on evidence strength
    const totalEvidence = anomalies.reduce((sum, a) => sum + a.evidence.length, 0)
    const evidenceScore = Math.min(totalEvidence / 20, 1)
    confidence += evidenceScore * 0.2

    // Adjust based on prediction consistency
    const avgProbability = predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length
    confidence += (avgProbability || 0) * 0.1

    return Math.min(confidence, 1)
  }

  private static calculateProbability(pattern: DetectedPattern): number {
    const severityWeight = pattern.severity === "high" ? 0.9 : pattern.severity === "medium" ? 0.7 : 0.5
    const evidenceWeight = Math.min(pattern.evidence.length / 5, 1)
    const yearWeight = Math.min(pattern.yearsAffected.length / 3, 1)

    return severityWeight * evidenceWeight * yearWeight
  }

  private static estimateTimeframe(pattern: DetectedPattern): string {
    switch (pattern.type) {
      case "penalty_pattern":
        return "30-60 days"
      case "recurring_underreporting":
        return "90-180 days"
      case "missing_deductions":
        return "60-120 days"
      default:
        return "60-90 days"
    }
  }

  private static getRequirements(pattern: DetectedPattern): string[] {
    const baseRequirements = ["Gather supporting documentation", "Review applicable tax law"]

    switch (pattern.type) {
      case "recurring_underreporting":
        return [...baseRequirements, "File amended returns (Form 1040X)", "Pay any additional tax owed"]
      case "penalty_pattern":
        return [...baseRequirements, "Submit penalty abatement request", "Demonstrate reasonable cause"]
      case "missing_deductions":
        return [...baseRequirements, "Substantiate deduction claims", "File amended returns if beneficial"]
      default:
        return baseRequirements
    }
  }
}
