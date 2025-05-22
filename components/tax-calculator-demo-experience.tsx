"use client"

import { useState } from "react"
import { TaxCalculator } from "@/services/tax-calculator"
import { TaxInputForm } from "@/components/tax-calculator/tax-input-form"
import { TaxResultsSummary } from "@/components/tax-calculator/tax-results-summary"
import { TaxBreakdownChart } from "@/components/tax-calculator/tax-breakdown-chart"
import { TaxScenarioComparison } from "@/components/tax-calculator/tax-scenario-comparison"
import { TaxEducationPanel } from "@/components/tax-calculator/tax-education-panel"
import { SampleScenarios } from "@/components/tax-calculator/sample-scenarios"
import type { TaxCalculationResult, TaxScenario } from "@/types/tax-calculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TaxCalculatorDemoExperience() {
  const [activeTab, setActiveTab] = useState("calculator")
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null)
  const [comparisonResults, setComparisonResults] = useState<{
    [key: string]: TaxCalculationResult
  }>({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [currentScenario, setCurrentScenario] = useState<TaxScenario | null>(null)

  const taxCalculator = new TaxCalculator()

  const handleCalculateTax = async (scenario: TaxScenario) => {
    setIsCalculating(true)
    setCurrentScenario(scenario)

    try {
      const taxData = taxCalculator.getTaxDataForYear(scenario.taxYear)
      const result = taxCalculator.calculateTotalTax(scenario, taxData)
      setTaxResult(result)
    } catch (error) {
      console.error("Error calculating tax:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleAddComparison = (name: string) => {
    if (!taxResult) return

    setComparisonResults((prev) => ({
      ...prev,
      [name]: taxResult,
    }))
  }

  const handleLoadSampleScenario = (scenario: TaxScenario) => {
    setCurrentScenario(scenario)
    handleCalculateTax(scenario)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tax Calculator Demo</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the power of our comprehensive tax calculation engine with this interactive demo
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
          <TabsTrigger value="samples">Sample Scenarios</TabsTrigger>
          <TabsTrigger value="education">Tax Education</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TaxInputForm
                initialScenario={currentScenario}
                onCalculate={handleCalculateTax}
                isCalculating={isCalculating}
              />
            </div>
            <div className="lg:col-span-2">
              {taxResult ? (
                <div className="space-y-8">
                  <TaxResultsSummary result={taxResult} onSaveComparison={handleAddComparison} />
                  <TaxBreakdownChart result={taxResult} />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">No Tax Calculation Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Fill out the form on the left to calculate your estimated tax liability
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <TaxScenarioComparison scenarios={comparisonResults} onClearComparisons={() => setComparisonResults({})} />
        </TabsContent>

        <TabsContent value="samples">
          <SampleScenarios onSelectScenario={handleLoadSampleScenario} />
        </TabsContent>

        <TabsContent value="education">
          <TaxEducationPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
