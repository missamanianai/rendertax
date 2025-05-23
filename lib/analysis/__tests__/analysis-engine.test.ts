import { AnalysisEngine } from "../analysis-engine"
import { PDFTranscriptParser } from "../pdf-parser"
import { TaxCalculator } from "../tax-calculator"
import { StateTaxCalculator } from "../state-tax-calculator"

// Mock PDF data for testing
const mockPDFBuffer = Buffer.from(`
WAGE AND INCOME TRANSCRIPT
TAX YEAR 2023
NAME: JOHN DOE
SSN: ***-**-1234
ADDRESS: 123 MAIN ST, ANYTOWN, ST 12345
FILING STATUS: 1

INCOME INFORMATION:
1099-INT FIRST NATIONAL BANK 8500.00
1099-NEC ABC CONSULTING 12500.00
W-2 EMPLOYER INC 65000.00

TRANSACTION CODES:
150 04/15/2024 0.00
806 12/31/2023 8500.00
826 01/15/2024 2500.00

PENALTY INFORMATION:
160 05/15/2024 340.00
`)

describe("Core Analysis Engine", () => {
  describe("PDF Parsing", () => {
    it("should parse transcript data correctly", async () => {
      const result = await PDFTranscriptParser.parseTranscript(mockPDFBuffer)

      expect(result.taxYear).toBe(2023)
      expect(result.taxpayerInfo.name).toBe("JOHN DOE")
      expect(result.taxpayerInfo.ssn).toContain("1234")
      expect(result.incomeItems).toHaveLength(3)
      expect(result.penalties).toHaveLength(1)
      expect(result.transactionCodes).toHaveLength(3)
    })

    it("should identify transcript type correctly", async () => {
      const result = await PDFTranscriptParser.parseTranscript(mockPDFBuffer)
      expect(result.metadata.transcriptType).toBe("wage_income")
    })

    it("should extract income items with correct amounts", async () => {
      const result = await PDFTranscriptParser.parseTranscript(mockPDFBuffer)

      const totalIncome = result.incomeItems.reduce((sum, item) => sum + item.amount, 0)
      expect(totalIncome).toBe(86000) // 8500 + 12500 + 65000
    })
  })

  describe("Tax Calculations", () => {
    it("should calculate federal tax correctly for 2023", () => {
      const result = TaxCalculator.calculateFederalTax(86000, "single", 2023)

      expect(result.taxableIncome).toBe(72150) // 86000 - 13850 standard deduction
      expect(result.federalTax).toBeGreaterThan(0)
      expect(result.effectiveRate).toBeLessThan(result.marginalRate)
      expect(result.breakdown).toHaveLength(3) // Should hit 3 tax brackets
    })

    it("should calculate different filing statuses correctly", () => {
      const singleResult = TaxCalculator.calculateFederalTax(86000, "single", 2023)
      const marriedResult = TaxCalculator.calculateFederalTax(86000, "marriedFilingJointly", 2023)

      expect(marriedResult.federalTax).toBeLessThan(singleResult.federalTax)
    })

    it("should calculate estimated tax penalty correctly", () => {
      const penalty = TaxCalculator.calculateEstimatedTaxPenalty(
        15000, // Current year tax
        12000, // Prior year tax
        10000, // Payments and withholding
        86000, // AGI
      )

      expect(penalty).toBeGreaterThan(0)
    })
  })

  describe("State Tax Calculations", () => {
    it("should return zero for no-tax states", () => {
      const result = StateTaxCalculator.calculateStateTax(86000, "FL")
      expect(result).toBe(0)
    })

    it("should calculate flat tax correctly", () => {
      const result = StateTaxCalculator.calculateStateTax(86000, "IL")
      expect(result).toBeGreaterThan(0)

      // Illinois has 4.95% flat rate
      const expectedTax = (86000 - 2425) * 0.0495 // Subtract standard deduction
      expect(result).toBeCloseTo(expectedTax, 2)
    })

    it("should calculate progressive tax correctly", () => {
      const result = StateTaxCalculator.calculateStateTax(86000, "CA")
      expect(result).toBeGreaterThan(0)
    })

    it("should provide correct state information", () => {
      const info = StateTaxCalculator.getStateInfo("CA")
      expect(info?.hasIncomeTax).toBe(true)
      expect(info?.taxType).toBe("progressive")
      expect(info?.brackets).toBeDefined()
    })
  })

  describe("Comprehensive Analysis", () => {
    it("should perform complete analysis on transcript data", async () => {
      const result = await AnalysisEngine.analyzeTranscripts([mockPDFBuffer], {
        state: "CA",
        filingStatus: "single",
        dependents: 0,
      })

      expect(result.transcriptData).toHaveLength(1)
      expect(result.taxCalculations.size).toBe(1)
      expect(result.summary.yearsAnalyzed).toContain(2023)
      expect(result.recommendations).toBeDefined()
      expect(result.timeline).toBeDefined()
      expect(result.summary.processingTime).toBeGreaterThan(0)
    })

    it("should identify refund opportunities", async () => {
      const result = await AnalysisEngine.analyzeTranscripts([mockPDFBuffer])

      // Should identify penalty abatement opportunity
      expect(result.summary.totalPenaltyAbatement).toBeGreaterThan(0)

      // Should have recommendations
      expect(result.recommendations.length).toBeGreaterThan(0)

      // Should have timeline items
      expect(result.timeline.length).toBeGreaterThan(0)
    })

    it("should calculate risk levels correctly", async () => {
      const result = await AnalysisEngine.analyzeTranscripts([mockPDFBuffer])

      expect(["low", "medium", "high"]).toContain(result.summary.riskLevel)
      expect(result.summary.confidenceScore).toBeGreaterThan(0)
      expect(result.summary.confidenceScore).toBeLessThanOrEqual(1)
    })

    it("should prioritize recommendations correctly", async () => {
      const result = await AnalysisEngine.analyzeTranscripts([mockPDFBuffer])

      // Recommendations should be sorted by priority (highest first)
      for (let i = 1; i < result.recommendations.length; i++) {
        expect(result.recommendations[i - 1].priority).toBeGreaterThanOrEqual(result.recommendations[i].priority)
      }
    })

    it("should generate appropriate timeline", async () => {
      const result = await AnalysisEngine.analyzeTranscripts([mockPDFBuffer])

      // Timeline should be sorted by deadline
      for (let i = 1; i < result.timeline.length; i++) {
        expect(result.timeline[i - 1].deadline.getTime()).toBeLessThanOrEqual(result.timeline[i].deadline.getTime())
      }
    })
  })

  describe("Multi-Year Analysis", () => {
    it("should detect patterns across multiple years", async () => {
      // Create mock data for multiple years
      const mockPDF2022 = Buffer.from(mockPDFBuffer.toString().replace("2023", "2022"))
      const mockPDF2021 = Buffer.from(mockPDFBuffer.toString().replace("2023", "2021"))

      const result = await AnalysisEngine.analyzeTranscripts([mockPDFBuffer, mockPDF2022, mockPDF2021])

      expect(result.transcriptData).toHaveLength(3)
      expect(result.summary.yearsAnalyzed).toHaveLength(3)
      expect(result.patternAnalysis.patterns.length).toBeGreaterThan(0)
    })
  })

  describe("Error Handling", () => {
    it("should handle invalid PDF data gracefully", async () => {
      const invalidBuffer = Buffer.from("Invalid PDF content")

      await expect(AnalysisEngine.analyzeTranscripts([invalidBuffer])).rejects.toThrow()
    })

    it("should handle empty input gracefully", async () => {
      await expect(AnalysisEngine.analyzeTranscripts([])).rejects.toThrow()
    })
  })
})

// Performance tests
describe("Performance Tests", () => {
  it("should complete analysis within reasonable time", async () => {
    const startTime = Date.now()

    await AnalysisEngine.analyzeTranscripts([mockPDFBuffer])

    const endTime = Date.now()
    const processingTime = endTime - startTime

    // Should complete within 5 seconds
    expect(processingTime).toBeLessThan(5000)
  })

  it("should handle multiple transcripts efficiently", async () => {
    const buffers = Array(5).fill(mockPDFBuffer)
    const startTime = Date.now()

    await AnalysisEngine.analyzeTranscripts(buffers)

    const endTime = Date.now()
    const processingTime = endTime - startTime

    // Should complete 5 transcripts within 10 seconds
    expect(processingTime).toBeLessThan(10000)
  })
})
