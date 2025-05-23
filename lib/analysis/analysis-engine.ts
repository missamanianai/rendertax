import { PDFTranscriptParser, type ParsedTranscriptData } from "./pdf-parser"
import { TaxCalculator, type TaxCalculationResult } from "./tax-calculator"
import { StateTaxCalculator } from "./state-tax-calculator"
import { PatternAnalyzer, type PatternAnalysisResult, type MultiYearData } from "./pattern-analyzer"
import { MLAnalyzer, type MLAnalysisResult } from "./ml-analyzer"

export interface ComprehensiveAnalysisResult {
  transcriptData: ParsedTranscriptData[]
  taxCalculations: Map<number, TaxCalculationResult>
  patternAnalysis: PatternAnalysisResult
  mlAnalysis: MLAnalysisResult
  summary: AnalysisSummary
  recommendations: PrioritizedRecommendation[]
  timeline: ActionTimeline[]
}

export interface AnalysisSummary {
  totalPotentialRefund: number
  totalPenaltyAbatement: number
  highestPriorityIssues: string[]
  riskLevel: "low" | "medium" | "high"
  confidenceScore: number
  yearsAnalyzed: number[]
  processingTime: number
}

export interface PrioritizedRecommendation {
  priority: number // 1-10 scale
  action: string
  description: string
  potentialValue: number
  timeframe: string
  requirements: string[]
  riskLevel: "low" | "medium" | "high"
  source: "pattern" | "ml" | "calculation" | "compliance"
}

export interface ActionTimeline {
  deadline: Date
  action: string
  importance: "critical" | "high" | "medium" | "low"
  description: string
  estimatedValue: number
}

export class AnalysisEngine {
  static async analyzeTranscripts(
    pdfBuffers: Buffer[],
    clientInfo?: {
      state?: string
      filingStatus?: string
      dependents?: number
    },
  ): Promise<ComprehensiveAnalysisResult> {
    const startTime = Date.now()

    try {
      // Step 1: Parse all PDF transcripts
      console.log("Parsing PDF transcripts...")
      const transcriptData: ParsedTranscriptData[] = []

      for (const buffer of pdfBuffers) {
        const parsed = await PDFTranscriptParser.parseTranscript(buffer)
        transcriptData.push(parsed)
      }

      // Sort by tax year
      transcriptData.sort((a, b) => a.taxYear - b.taxYear)

      // Step 2: Perform tax calculations for each year
      console.log("Calculating taxes...")
      const taxCalculations = new Map<number, TaxCalculationResult>()

      for (const data of transcriptData) {
        const totalIncome = data.incomeItems.reduce((sum, item) => sum + item.amount, 0)
        const filingStatus = clientInfo?.filingStatus || data.taxpayerInfo.filingStatus || "single"

        const federalCalc = TaxCalculator.calculateFederalTax(totalIncome, filingStatus, data.taxYear)

        const stateTax = clientInfo?.state
          ? StateTaxCalculator.calculateStateTax(totalIncome, clientInfo.state, filingStatus)
          : 0

        const result: TaxCalculationResult = {
          ...federalCalc,
          stateTax,
          totalTax: federalCalc.federalTax + stateTax,
        }

        taxCalculations.set(data.taxYear, result)
      }

      // Step 3: Analyze patterns across multiple years
      console.log("Analyzing patterns...")
      const multiYearData: MultiYearData = {
        transcripts: new Map(transcriptData.map((data) => [data.taxYear, data])),
      }

      const patternAnalysis = PatternAnalyzer.analyzeMultiYearPatterns(multiYearData)

      // Step 4: Apply ML analysis
      console.log("Applying ML analysis...")
      const mlAnalysis = await MLAnalyzer.analyzeWithML(transcriptData, patternAnalysis)

      // Step 5: Generate comprehensive summary and recommendations
      console.log("Generating recommendations...")
      const summary = this.generateSummary(
        transcriptData,
        taxCalculations,
        patternAnalysis,
        mlAnalysis,
        Date.now() - startTime,
      )

      const recommendations = this.prioritizeRecommendations(patternAnalysis, mlAnalysis, taxCalculations)

      const timeline = this.generateActionTimeline(recommendations, transcriptData)

      return {
        transcriptData,
        taxCalculations,
        patternAnalysis,
        mlAnalysis,
        summary,
        recommendations,
        timeline,
      }
    } catch (error) {
      console.error("Analysis engine error:", error)
      throw new Error(`Failed to analyze transcripts: ${error.message}`)
    }
  }

  private static generateSummary(
    transcriptData: ParsedTranscriptData[],
    taxCalculations: Map<number, TaxCalculationResult>,
    patternAnalysis: PatternAnalysisResult,
    mlAnalysis: MLAnalysisResult,
    processingTime: number,
  ): AnalysisSummary {
    const totalPotentialRefund =
      patternAnalysis.totalPotentialRecovery +
      mlAnalysis.predictions
        .filter((p) => p.type === "refund_opportunity")
        .reduce((sum, p) => sum + p.estimatedAmount, 0)

    const totalPenaltyAbatement = mlAnalysis.predictions
      .filter((p) => p.type === "penalty_abatement")
      .reduce((sum, p) => sum + p.estimatedAmount, 0)

    const highestPriorityIssues = [
      ...patternAnalysis.patterns.filter((p) => p.severity === "high").map((p) => p.description),
      ...mlAnalysis.anomalies.filter((a) => a.severity > 0.7).map((a) => a.description),
    ].slice(0, 5) // Top 5 issues

    const riskLevel = this.determineOverallRiskLevel(patternAnalysis, mlAnalysis)
    const confidenceScore = (patternAnalysis.confidenceScore + mlAnalysis.confidenceScore) / 2
    const yearsAnalyzed = transcriptData.map((data) => data.taxYear).sort()

    return {
      totalPotentialRefund,
      totalPenaltyAbatement,
      highestPriorityIssues,
      riskLevel,
      confidenceScore,
      yearsAnalyzed,
      processingTime,
    }
  }

  private static prioritizeRecommendations(
    patternAnalysis: PatternAnalysisResult,
    mlAnalysis: MLAnalysisResult,
    taxCalculations: Map<number, TaxCalculationResult>,
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = []

    // Add pattern-based recommendations
    patternAnalysis.patterns.forEach((pattern) => {
      const priority = this.calculatePatternPriority(pattern)

      recommendations.push({
        priority,
        action: pattern.recommendation,
        description: pattern.description,
        potentialValue: pattern.potentialRecovery,
        timeframe: this.getPatternTimeframe(pattern),
        requirements: this.getPatternRequirements(pattern),
        riskLevel: pattern.severity === "high" ? "high" : pattern.severity === "medium" ? "medium" : "low",
        source: "pattern",
      })
    })

    // Add ML-based recommendations
    mlAnalysis.recommendations.forEach((mlRec) => {
      const priority = mlRec.priority === "high" ? 9 : mlRec.priority === "medium" ? 6 : 3

      recommendations.push({
        priority,
        action: mlRec.action,
        description: mlRec.reasoning,
        potentialValue: 0, // ML recommendations don't always have direct value
        timeframe: mlRec.timeline,
        requirements: [mlRec.expectedOutcome],
        riskLevel: "medium",
        source: "ml",
      })
    })

    // Add prediction-based recommendations
    mlAnalysis.predictions.forEach((prediction) => {
      const priority = this.calculatePredictionPriority(prediction)

      recommendations.push({
        priority,
        action: `Pursue ${prediction.type.replace(/_/g, " ")}`,
        description: prediction.description,
        potentialValue: prediction.estimatedAmount,
        timeframe: prediction.timeframe,
        requirements: prediction.requirements,
        riskLevel: prediction.probability > 0.8 ? "low" : prediction.probability > 0.6 ? "medium" : "high",
        source: "ml",
      })
    })

    // Sort by priority (highest first)
    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  private static generateActionTimeline(
    recommendations: PrioritizedRecommendation[],
    transcriptData: ParsedTranscriptData[],
  ): ActionTimeline[] {
    const timeline: ActionTimeline[] = []
    const currentDate = new Date()

    // Add statute of limitations deadlines
    transcriptData.forEach((data) => {
      const refundDeadline = new Date(data.taxYear + 4, 3, 15) // 3 years + 1 for filing
      const daysUntilDeadline = Math.ceil((refundDeadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilDeadline > 0 && daysUntilDeadline < 365) {
        timeline.push({
          deadline: refundDeadline,
          action: `File amended return for ${data.taxYear}`,
          importance: daysUntilDeadline < 90 ? "critical" : daysUntilDeadline < 180 ? "high" : "medium",
          description: `Statute of limitations expires for ${data.taxYear} refund claims`,
          estimatedValue: 0, // Would be calculated based on specific opportunities
        })
      }
    })

    // Add high-priority recommendations with deadlines
    recommendations
      .filter((rec) => rec.priority >= 7)
      .forEach((rec) => {
        const deadline = this.calculateDeadline(rec.timeframe, currentDate)

        timeline.push({
          deadline,
          action: rec.action,
          importance: rec.priority >= 9 ? "critical" : "high",
          description: rec.description,
          estimatedValue: rec.potentialValue,
        })
      })

    // Sort by deadline
    return timeline.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
  }

  private static calculatePatternPriority(pattern: any): number {
    let priority = 5 // Base priority

    // Increase priority based on severity
    if (pattern.severity === "high") priority += 3
    else if (pattern.severity === "medium") priority += 2
    else priority += 1

    // Increase priority based on potential recovery
    if (pattern.potentialRecovery > 10000) priority += 2
    else if (pattern.potentialRecovery > 5000) priority += 1

    // Increase priority based on years affected
    if (pattern.yearsAffected.length >= 3) priority += 1

    return Math.min(priority, 10)
  }

  private static calculatePredictionPriority(prediction: any): number {
    let priority = 4 // Base priority

    // Increase priority based on probability
    if (prediction.probability > 0.8) priority += 3
    else if (prediction.probability > 0.6) priority += 2
    else priority += 1

    // Increase priority based on estimated amount
    if (prediction.estimatedAmount > 10000) priority += 2
    else if (prediction.estimatedAmount > 5000) priority += 1

    // Increase priority based on type
    if (prediction.type === "penalty_abatement") priority += 1

    return Math.min(priority, 10)
  }

  private static determineOverallRiskLevel(
    patternAnalysis: PatternAnalysisResult,
    mlAnalysis: MLAnalysisResult,
  ): "low" | "medium" | "high" {
    const patternRisk = patternAnalysis.riskLevel
    const mlRisk =
      mlAnalysis.riskAssessment.auditRisk > 0.7 ? "high" : mlAnalysis.riskAssessment.auditRisk > 0.4 ? "medium" : "low"

    // Take the higher of the two risk levels
    if (patternRisk === "high" || mlRisk === "high") return "high"
    if (patternRisk === "medium" || mlRisk === "medium") return "medium"
    return "low"
  }

  private static getPatternTimeframe(pattern: any): string {
    // Implementation would depend on pattern type
    return "60-90 days"
  }

  private static getPatternRequirements(pattern: any): string[] {
    // Implementation would depend on pattern type
    return ["Gather documentation", "Review tax law", "File appropriate forms"]
  }

  private static calculateDeadline(timeframe: string, currentDate: Date): Date {
    const deadline = new Date(currentDate)

    if (timeframe.includes("30")) {
      deadline.setDate(deadline.getDate() + 30)
    } else if (timeframe.includes("60")) {
      deadline.setDate(deadline.getDate() + 60)
    } else if (timeframe.includes("90")) {
      deadline.setDate(deadline.getDate() + 90)
    } else {
      deadline.setDate(deadline.getDate() + 60) // Default to 60 days
    }

    return deadline
  }
}
