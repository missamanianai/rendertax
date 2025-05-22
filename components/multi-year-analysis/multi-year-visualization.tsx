"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FileDown, Printer, Share2 } from "lucide-react"
import { TaxTrendChart } from "./tax-trend-chart"
import { TaxComparisonChart } from "./tax-comparison-chart"
import { TaxHeatmap } from "./tax-heatmap"
import { TaxMetricsTable } from "./tax-metrics-table"
import { TaxYearSummary } from "./tax-year-summary"
import type { MultiYearAnalysisResult } from "@/types/multi-year"

interface MultiYearVisualizationProps {
  analysisResult: MultiYearAnalysisResult
  clientName: string
}

export function MultiYearVisualization({ analysisResult, clientName }: MultiYearVisualizationProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("effectiveTaxRate")
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState("trends")

  const availableYears = useMemo(() => {
    return analysisResult.taxData.map((data) => data.year).sort((a, b) => a - b)
  }, [analysisResult.taxData])

  // Initialize selected years if empty
  useMemo(() => {
    if (selectedYears.length === 0 && availableYears.length > 0) {
      setSelectedYears(availableYears)
    }
  }, [availableYears, selectedYears])

  const filteredData = useMemo(() => {
    return analysisResult.taxData.filter((data) => selectedYears.includes(data.year))
  }, [analysisResult.taxData, selectedYears])

  const metricOptions = [
    { value: "effectiveTaxRate", label: "Effective Tax Rate" },
    { value: "totalIncome", label: "Total Income" },
    { value: "adjustedGrossIncome", label: "Adjusted Gross Income" },
    { value: "taxableIncome", label: "Taxable Income" },
    { value: "totalTax", label: "Total Tax" },
    { value: "totalCredits", label: "Total Credits" },
    { value: "totalDeductions", label: "Total Deductions" },
    { value: "totalWithholding", label: "Total Withholding" },
    { value: "refundOrDue", label: "Refund/Amount Due" },
  ]

  const handleYearToggle = (year: number) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter((y) => y !== year))
      }
    } else {
      setSelectedYears([...selectedYears, year].sort((a, b) => a - b))
    }
  }

  const handleSelectAllYears = () => {
    setSelectedYears([...availableYears])
  }

  const handleExportData = () => {
    // Implementation for exporting data
    console.log("Exporting data...")
  }

  const handlePrintReport = () => {
    // Implementation for printing report
    window.print()
  }

  const handleShareReport = () => {
    // Implementation for sharing report
    console.log("Sharing report...")
  }

  const selectedTrend = analysisResult.trends[selectedMetric as keyof typeof analysisResult.trends]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{clientName} - Multi-Year Tax Analysis</h2>
          <p className="text-muted-foreground">
            Analysis of {availableYears.length} tax years ({Math.min(...availableYears)} - {Math.max(...availableYears)}
            )
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareReport}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-64">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {metricOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableYears.map((year) => (
            <Button
              key={year}
              variant={selectedYears.includes(year) ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearToggle(year)}
            >
              {year}
            </Button>
          ))}
          <Button variant="secondary" size="sm" onClick={handleSelectAllYears}>
            All Years
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {metricOptions.find((option) => option.value === selectedMetric)?.label} Trend Analysis
              </CardTitle>
              <CardDescription>
                Visualizing changes in{" "}
                {metricOptions.find((option) => option.value === selectedMetric)?.label.toLowerCase()} over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <TaxTrendChart
                  data={filteredData}
                  metric={selectedMetric}
                  metricLabel={metricOptions.find((option) => option.value === selectedMetric)?.label || ""}
                />
              </div>
              <TaxYearSummary trend={selectedTrend} years={selectedYears} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Year-to-Year Comparison</CardTitle>
              <CardDescription>
                Compare {metricOptions.find((option) => option.value === selectedMetric)?.label.toLowerCase()} across
                selected years
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <TaxComparisonChart
                  data={filteredData}
                  metric={selectedMetric}
                  metricLabel={metricOptions.find((option) => option.value === selectedMetric)?.label || ""}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Metrics Heatmap</CardTitle>
              <CardDescription>Visualize all tax metrics across years with color intensity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <TaxHeatmap data={filteredData} metricOptions={metricOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Data Table</CardTitle>
              <CardDescription>Detailed tax metrics for all selected years</CardDescription>
            </CardHeader>
            <CardContent>
              <TaxMetricsTable data={filteredData} metricOptions={metricOptions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Insights</CardTitle>
          <CardDescription>Key findings and opportunities identified from multi-year analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analysisResult.anomalies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Anomalies Detected</h3>
                <ul className="space-y-2">
                  {analysisResult.anomalies.map((anomaly, index) => (
                    <li key={index} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            anomaly.severity === "high"
                              ? "bg-red-500"
                              : anomaly.severity === "medium"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        ></span>
                        <span className="font-medium">
                          {anomaly.year}: {anomaly.metric}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Value: {anomaly.value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        (Expected:{" "}
                        {anomaly.expectedValue.toLocaleString("en-US", { style: "currency", currency: "USD" })})
                      </p>
                      <p className="text-sm mt-1">
                        Deviation: {anomaly.percentDeviation.toFixed(2)}% ({anomaly.deviation > 0 ? "higher" : "lower"}{" "}
                        than expected)
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.opportunities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tax Opportunities</h3>
                <ul className="space-y-2">
                  {analysisResult.opportunities.map((opportunity) => (
                    <li key={opportunity.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{opportunity.title}</span>
                        <span className="font-semibold text-green-600">
                          {opportunity.potentialSavings.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{opportunity.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Years: {opportunity.years.join(", ")}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            opportunity.confidence === "high"
                              ? "bg-green-100 text-green-800"
                              : opportunity.confidence === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {opportunity.confidence.charAt(0).toUpperCase() + opportunity.confidence.slice(1)} confidence
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.riskAreas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Risk Areas</h3>
                <ul className="space-y-2">
                  {analysisResult.riskAreas.map((risk) => (
                    <li key={risk.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{risk.title}</span>
                        <span
                          className={`font-semibold ${
                            risk.severity === "high"
                              ? "text-red-600"
                              : risk.severity === "medium"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        >
                          {risk.severity.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-sm mt-1">{risk.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Years: {risk.years.join(", ")}
                        </span>
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          Potential Impact:{" "}
                          {risk.potentialImpact.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
