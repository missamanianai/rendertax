import type { WageAndIncomeTranscript, RecordOfAccountTranscript } from "../types/transcript"
import type { AnalysisResult, Finding, Warning } from "../types/analysis"
import { TranscriptParser } from "./transcript-parser"
import { DiscrepancyAnalyzer } from "./discrepancy-analyzer"
import { EventAnalyzer } from "./event-analyzer"
import { ValidationEngine } from "./validation-engine"

export class AnalysisEngine {
  private transcriptParser: TranscriptParser
  private discrepancyAnalyzer: DiscrepancyAnalyzer
  private eventAnalyzer: EventAnalyzer
  private validationEngine: ValidationEngine

  constructor() {
    this.transcriptParser = new TranscriptParser()
    this.discrepancyAnalyzer = new DiscrepancyAnalyzer()
    this.eventAnalyzer = new EventAnalyzer()
    this.validationEngine = new ValidationEngine()
  }

  /**
   * Run full analysis on transcript files
   */
  async analyzeTranscripts(
    wageIncomePdf: Buffer,
    recordOfAccountPdf: Buffer,
    sessionId: string,
  ): Promise<AnalysisResult> {
    const startTime = Date.now()

    try {
      // Parse transcripts
      const wageIncomeResult = await this.transcriptParser.parseTranscript(wageIncomePdf)
      const recordOfAccountResult = await this.transcriptParser.parseTranscript(recordOfAccountPdf)

      if (wageIncomeResult.type !== "wage_income" || recordOfAccountResult.type !== "record_account") {
        throw new Error("Invalid transcript types")
      }

      const wageIncome = wageIncomeResult.data as WageAndIncomeTranscript
      const recordOfAccount = recordOfAccountResult.data as RecordOfAccountTranscript

      // Validate data
      const validationResult = this.validationEngine.validateAnalysisInput(wageIncome, recordOfAccount)

      if (!validationResult.isValid) {
        return this.createErrorResult(
          sessionId,
          recordOfAccount.taxYear,
          "Validation failed",
          validationResult.errors.map((e) => ({
            type: e.type,
            message: e.message,
            severity: e.severity === "critical" ? "high" : "medium",
          })),
        )
      }

      // Run discrepancy analysis
      const discrepancyFindings = await this.discrepancyAnalyzer.analyzeDiscrepancies(wageIncome, recordOfAccount)

      // Run event analysis
      const eventFindings = await this.eventAnalyzer.analyzeEvents(recordOfAccount)

      // Combine findings
      const allFindings = [...discrepancyFindings, ...eventFindings]

      // Calculate total potential refund
      const totalPotentialRefund = allFindings.reduce((sum, finding) => sum + finding.potentialRefund, 0)

      // Determine primary analysis type
      let analysisType: "discrepancy" | "event" | "miscellaneous" = "miscellaneous"

      if (discrepancyFindings.length > eventFindings.length) {
        analysisType = "discrepancy"
      } else if (eventFindings.length > 0) {
        analysisType = "event"
      }

      // Create result
      const result: AnalysisResult = {
        sessionId,
        taxYear: recordOfAccount.taxYear,
        analysisType,
        findings: allFindings,
        totalPotentialRefund,
        confidence: this.calculateOverallConfidence(allFindings),
        processingTime: Date.now() - startTime,
        warnings: validationResult.warnings.map((w) => ({
          type: w.type,
          message: w.message,
          severity: w.severity,
        })),
      }

      return result
    } catch (error) {
      console.error("Analysis error:", error)

      return this.createErrorResult(
        sessionId,
        0, // Unknown tax year
        "Analysis failed",
        [
          {
            type: "processing_error",
            message: error instanceof Error ? error.message : "Unknown error",
            severity: "high",
          },
        ],
      )
    }
  }

  /**
   * Create error result when analysis fails
   */
  private createErrorResult(sessionId: string, taxYear: number, reason: string, errors: Warning[]): AnalysisResult {
    return {
      sessionId,
      taxYear,
      analysisType: "miscellaneous",
      findings: [],
      totalPotentialRefund: 0,
      confidence: "low",
      processingTime: 0,
      warnings: errors,
    }
  }

  /**
   * Calculate overall confidence level based on findings
   */
  private calculateOverallConfidence(findings: Finding[]): "high" | "medium" | "low" {
    if (findings.length === 0) return "high"

    const confidenceScores = {
      high: 3,
      medium: 2,
      low: 1,
    }

    const totalScore = findings.reduce((sum, finding) => sum + confidenceScores[finding.confidence], 0)

    const averageScore = totalScore / findings.length

    if (averageScore >= 2.5) return "high"
    if (averageScore >= 1.5) return "medium"
    return "low"
  }
}
