"use client"
import { MultiYearVisualization } from "@/components/multi-year-analysis/multi-year-visualization"
import type { MultiYearAnalysisResult, TaxOpportunity, TaxRiskArea, YearlyTaxData } from "@/types/multi-year"

// Sample data for demonstration
const sampleTaxData: YearlyTaxData[] = [
  {
    year: 2019,
    effectiveTaxRate: 0.18,
    totalIncome: 85000,
    adjustedGrossIncome: 78500,
    taxableIncome: 65000,
    totalTax: 11700,
    totalCredits: 1000,
    totalDeductions: 13500,
    totalWithholding: 12500,
    refundOrDue: 800,
    selfEmploymentTax: 0,
    capitalGains: 0,
    qualifiedDividends: 500,
    filingStatus: "single",
  },
  {
    year: 2020,
    effectiveTaxRate: 0.17,
    totalIncome: 88000,
    adjustedGrossIncome: 81000,
    taxableIncome: 67500,
    totalTax: 11475,
    totalCredits: 2000,
    totalDeductions: 13500,
    totalWithholding: 12000,
    refundOrDue: 525,
    selfEmploymentTax: 0,
    capitalGains: 0,
    qualifiedDividends: 600,
    filingStatus: "single",
  },
  {
    year: 2021,
    effectiveTaxRate: 0.19,
    totalIncome: 92000,
    adjustedGrossIncome: 84500,
    taxableIncome: 71000,
    totalTax: 13490,
    totalCredits: 1000,
    totalDeductions: 13500,
    totalWithholding: 13000,
    refundOrDue: -490,
    selfEmploymentTax: 0,
    capitalGains: 2000,
    qualifiedDividends: 700,
    filingStatus: "single",
  },
  {
    year: 2022,
    effectiveTaxRate: 0.21,
    totalIncome: 98000,
    adjustedGrossIncome: 90000,
    taxableIncome: 76500,
    totalTax: 16065,
    totalCredits: 500,
    totalDeductions: 13500,
    totalWithholding: 15000,
    refundOrDue: -1065,
    selfEmploymentTax: 0,
    capitalGains: 3000,
    qualifiedDividends: 800,
    filingStatus: "single",
  },
  {
    year: 2023,
    effectiveTaxRate: 0.22,
    totalIncome: 105000,
    adjustedGrossIncome: 96500,
    taxableIncome: 83000,
    totalTax: 18260,
    totalCredits: 0,
    totalDeductions: 13500,
    totalWithholding: 17000,
    refundOrDue: -1260,
    selfEmploymentTax: 0,
    capitalGains: 4000,
    qualifiedDividends: 900,
    filingStatus: "single",
  },
]

// Sample opportunities
const sampleOpportunities: TaxOpportunity[] = [
  {
    id: "opp-1",
    title: "Retirement Contribution Opportunity",
    description: "Increasing retirement contributions could reduce taxable income and lower effective tax rate.",
    years: [2022, 2023],
    potentialSavings: 2500,
    confidence: "high",
    implementationComplexity: "low",
    actionSteps: [
      "Maximize 401(k) contributions up to $22,500 (2023 limit)",
      "Consider IRA contributions if eligible",
      "Explore HSA contributions if you have a high-deductible health plan",
    ],
  },
  {
    id: "opp-2",
    title: "Capital Gains Tax Planning",
    description: "Strategic realization of capital gains could reduce overall tax burden.",
    years: [2021, 2022, 2023],
    potentialSavings: 1200,
    confidence: "medium",
    implementationComplexity: "medium",
    actionSteps: [
      "Review investment portfolio for tax-loss harvesting opportunities",
      "Consider timing of capital gains realization",
      "Evaluate tax-efficient investment strategies",
    ],
  },
]

// Sample risk areas
const sampleRiskAreas: TaxRiskArea[] = [
  {
    id: "risk-1",
    title: "Increasing Effective Tax Rate",
    description:
      "Your effective tax rate has increased steadily over the past 5 years, potentially indicating inefficient tax planning.",
    years: [2019, 2020, 2021, 2022, 2023],
    potentialImpact: 3500,
    probability: "high",
    severity: "medium",
    mitigationSteps: [
      "Review deduction and credit opportunities",
      "Evaluate timing of income recognition",
      "Consider tax-advantaged investment vehicles",
    ],
  },
  {
    id: "risk-2",
    title: "Underpayment Penalties Risk",
    description: "Increasing balance due at tax time may lead to underpayment penalties if not addressed.",
    years: [2021, 2022, 2023],
    potentialImpact: 750,
    probability: "medium",
    severity: "low",
    mitigationSteps: [
      "Adjust tax withholding with employer",
      "Make estimated tax payments if necessary",
      "Monitor tax situation throughout the year",
    ],
  },
]

// Create sample analysis result
const sampleAnalysisResult: MultiYearAnalysisResult = {
  taxData: sampleTaxData,
  trends: {
    effectiveTaxRate: {
      metric: "effectiveTaxRate",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.effectiveTaxRate,
        previousValue: index > 0 ? sampleTaxData[index - 1].effectiveTaxRate : null,
        change: index > 0 ? data.effectiveTaxRate - sampleTaxData[index - 1].effectiveTaxRate : null,
        percentChange:
          index > 0
            ? ((data.effectiveTaxRate - sampleTaxData[index - 1].effectiveTaxRate) /
                sampleTaxData[index - 1].effectiveTaxRate) *
              100
            : null,
        trend: index > 0 ? (data.effectiveTaxRate > sampleTaxData[index - 1].effectiveTaxRate ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.effectiveTaxRate, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.effectiveTaxRate)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.effectiveTaxRate)),
      minYear:
        sampleTaxData.find(
          (data) => data.effectiveTaxRate === Math.min(...sampleTaxData.map((data) => data.effectiveTaxRate)),
        )?.year || 0,
      maxYear:
        sampleTaxData.find(
          (data) => data.effectiveTaxRate === Math.max(...sampleTaxData.map((data) => data.effectiveTaxRate)),
        )?.year || 0,
      overallTrend: "increasing",
      anomalies: [],
    },
    totalIncome: {
      metric: "totalIncome",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.totalIncome,
        previousValue: index > 0 ? sampleTaxData[index - 1].totalIncome : null,
        change: index > 0 ? data.totalIncome - sampleTaxData[index - 1].totalIncome : null,
        percentChange:
          index > 0
            ? ((data.totalIncome - sampleTaxData[index - 1].totalIncome) / sampleTaxData[index - 1].totalIncome) * 100
            : null,
        trend: index > 0 ? (data.totalIncome > sampleTaxData[index - 1].totalIncome ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.totalIncome, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.totalIncome)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.totalIncome)),
      minYear:
        sampleTaxData.find((data) => data.totalIncome === Math.min(...sampleTaxData.map((data) => data.totalIncome)))
          ?.year || 0,
      maxYear:
        sampleTaxData.find((data) => data.totalIncome === Math.max(...sampleTaxData.map((data) => data.totalIncome)))
          ?.year || 0,
      overallTrend: "increasing",
      anomalies: [],
    },
    adjustedGrossIncome: {
      metric: "adjustedGrossIncome",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.adjustedGrossIncome,
        previousValue: index > 0 ? sampleTaxData[index - 1].adjustedGrossIncome : null,
        change: index > 0 ? data.adjustedGrossIncome - sampleTaxData[index - 1].adjustedGrossIncome : null,
        percentChange:
          index > 0
            ? ((data.adjustedGrossIncome - sampleTaxData[index - 1].adjustedGrossIncome) /
                sampleTaxData[index - 1].adjustedGrossIncome) *
              100
            : null,
        trend:
          index > 0
            ? data.adjustedGrossIncome > sampleTaxData[index - 1].adjustedGrossIncome
              ? "up"
              : "down"
            : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.adjustedGrossIncome, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.adjustedGrossIncome)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.adjustedGrossIncome)),
      minYear:
        sampleTaxData.find(
          (data) => data.adjustedGrossIncome === Math.min(...sampleTaxData.map((data) => data.adjustedGrossIncome)),
        )?.year || 0,
      maxYear:
        sampleTaxData.find(
          (data) => data.adjustedGrossIncome === Math.max(...sampleTaxData.map((data) => data.adjustedGrossIncome)),
        )?.year || 0,
      overallTrend: "increasing",
      anomalies: [],
    },
    taxableIncome: {
      metric: "taxableIncome",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.taxableIncome,
        previousValue: index > 0 ? sampleTaxData[index - 1].taxableIncome : null,
        change: index > 0 ? data.taxableIncome - sampleTaxData[index - 1].taxableIncome : null,
        percentChange:
          index > 0
            ? ((data.taxableIncome - sampleTaxData[index - 1].taxableIncome) / sampleTaxData[index - 1].taxableIncome) *
              100
            : null,
        trend: index > 0 ? (data.taxableIncome > sampleTaxData[index - 1].taxableIncome ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.taxableIncome, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.taxableIncome)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.taxableIncome)),
      minYear:
        sampleTaxData.find(
          (data) => data.taxableIncome === Math.min(...sampleTaxData.map((data) => data.taxableIncome)),
        )?.year || 0,
      maxYear:
        sampleTaxData.find(
          (data) => data.taxableIncome === Math.max(...sampleTaxData.map((data) => data.taxableIncome)),
        )?.year || 0,
      overallTrend: "increasing",
      anomalies: [],
    },
    totalTax: {
      metric: "totalTax",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.totalTax,
        previousValue: index > 0 ? sampleTaxData[index - 1].totalTax : null,
        change: index > 0 ? data.totalTax - sampleTaxData[index - 1].totalTax : null,
        percentChange:
          index > 0
            ? ((data.totalTax - sampleTaxData[index - 1].totalTax) / sampleTaxData[index - 1].totalTax) * 100
            : null,
        trend: index > 0 ? (data.totalTax > sampleTaxData[index - 1].totalTax ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.totalTax, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.totalTax)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.totalTax)),
      minYear:
        sampleTaxData.find((data) => data.totalTax === Math.min(...sampleTaxData.map((data) => data.totalTax)))?.year ||
        0,
      maxYear:
        sampleTaxData.find((data) => data.totalTax === Math.max(...sampleTaxData.map((data) => data.totalTax)))?.year ||
        0,
      overallTrend: "increasing",
      anomalies: [],
    },
    totalCredits: {
      metric: "totalCredits",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.totalCredits,
        previousValue: index > 0 ? sampleTaxData[index - 1].totalCredits : null,
        change: index > 0 ? data.totalCredits - sampleTaxData[index - 1].totalCredits : null,
        percentChange:
          index > 0
            ? ((data.totalCredits - sampleTaxData[index - 1].totalCredits) / sampleTaxData[index - 1].totalCredits) *
              100
            : null,
        trend: index > 0 ? (data.totalCredits > sampleTaxData[index - 1].totalCredits ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.totalCredits, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.totalCredits)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.totalCredits)),
      minYear:
        sampleTaxData.find((data) => data.totalCredits === Math.min(...sampleTaxData.map((data) => data.totalCredits)))
          ?.year || 0,
      maxYear:
        sampleTaxData.find((data) => data.totalCredits === Math.max(...sampleTaxData.map((data) => data.totalCredits)))
          ?.year || 0,
      overallTrend: "decreasing",
      anomalies: [],
    },
    totalDeductions: {
      metric: "totalDeductions",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.totalDeductions,
        previousValue: index > 0 ? sampleTaxData[index - 1].totalDeductions : null,
        change: index > 0 ? data.totalDeductions - sampleTaxData[index - 1].totalDeductions : null,
        percentChange:
          index > 0
            ? ((data.totalDeductions - sampleTaxData[index - 1].totalDeductions) /
                sampleTaxData[index - 1].totalDeductions) *
              100
            : null,
        trend: index > 0 ? (data.totalDeductions > sampleTaxData[index - 1].totalDeductions ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.totalDeductions, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.totalDeductions)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.totalDeductions)),
      minYear:
        sampleTaxData.find(
          (data) => data.totalDeductions === Math.min(...sampleTaxData.map((data) => data.totalDeductions)),
        )?.year || 0,
      maxYear:
        sampleTaxData.find(
          (data) => data.totalDeductions === Math.max(...sampleTaxData.map((data) => data.totalDeductions)),
        )?.year || 0,
      overallTrend: "stable",
      anomalies: [],
    },
    totalWithholding: {
      metric: "totalWithholding",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.totalWithholding,
        previousValue: index > 0 ? sampleTaxData[index - 1].totalWithholding : null,
        change: index > 0 ? data.totalWithholding - sampleTaxData[index - 1].totalWithholding : null,
        percentChange:
          index > 0
            ? ((data.totalWithholding - sampleTaxData[index - 1].totalWithholding) /
                sampleTaxData[index - 1].totalWithholding) *
              100
            : null,
        trend: index > 0 ? (data.totalWithholding > sampleTaxData[index - 1].totalWithholding ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.totalWithholding, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.totalWithholding)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.totalWithholding)),
      minYear:
        sampleTaxData.find(
          (data) => data.totalWithholding === Math.min(...sampleTaxData.map((data) => data.totalWithholding)),
        )?.year || 0,
      maxYear:
        sampleTaxData.find(
          (data) => data.totalWithholding === Math.max(...sampleTaxData.map((data) => data.totalWithholding)),
        )?.year || 0,
      overallTrend: "increasing",
      anomalies: [],
    },
    refundOrDue: {
      metric: "refundOrDue",
      data: sampleTaxData.map((data, index) => ({
        year: data.year,
        value: data.refundOrDue,
        previousValue: index > 0 ? sampleTaxData[index - 1].refundOrDue : null,
        change: index > 0 ? data.refundOrDue - sampleTaxData[index - 1].refundOrDue : null,
        percentChange:
          index > 0
            ? ((data.refundOrDue - sampleTaxData[index - 1].refundOrDue) /
                Math.abs(sampleTaxData[index - 1].refundOrDue)) *
              100
            : null,
        trend: index > 0 ? (data.refundOrDue > sampleTaxData[index - 1].refundOrDue ? "up" : "down") : "none",
      })),
      averageValue: sampleTaxData.reduce((sum, data) => sum + data.refundOrDue, 0) / sampleTaxData.length,
      minValue: Math.min(...sampleTaxData.map((data) => data.refundOrDue)),
      maxValue: Math.max(...sampleTaxData.map((data) => data.refundOrDue)),
      minYear:
        sampleTaxData.find((data) => data.refundOrDue === Math.min(...sampleTaxData.map((data) => data.refundOrDue)))
          ?.year || 0,
      maxYear:
        sampleTaxData.find((data) => data.refundOrDue === Math.max(...sampleTaxData.map((data) => data.refundOrDue)))
          ?.year || 0,
      overallTrend: "decreasing",
      anomalies: [],
    },
  },
  anomalies: [
    {
      year: 2021,
      metric: "totalTax",
      value: 13490,
      expectedValue: 12500,
      deviation: 990,
      percentDeviation: 7.9,
      severity: "medium",
      potentialCauses: ["Increase in capital gains", "Reduction in available tax credits", "Change in tax brackets"],
    },
    {
      year: 2023,
      metric: "effectiveTaxRate",
      value: 0.22,
      expectedValue: 0.2,
      deviation: 0.02,
      percentDeviation: 10.0,
      severity: "high",
      potentialCauses: [
        "Income growth pushing into higher tax bracket",
        "Reduction in available deductions",
        "Increase in capital gains",
      ],
    },
  ],
  opportunities: sampleOpportunities,
  riskAreas: sampleRiskAreas,
}

export default function MultiYearAnalysisPage() {
  return (
    <div className="container mx-auto py-8">
      <MultiYearVisualization analysisResult={sampleAnalysisResult} clientName="Sarah Johnson" />
    </div>
  )
}
