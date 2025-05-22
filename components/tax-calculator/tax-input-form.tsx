"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { FilingStatus } from "@/types/transcript"
import type { TaxScenario } from "@/types/tax-calculator"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaxInputFormProps {
  initialScenario: TaxScenario | null
  onCalculate: (scenario: TaxScenario) => void
  isCalculating: boolean
}

export function TaxInputForm({ initialScenario, onCalculate, isCalculating }: TaxInputFormProps) {
  const [activeTab, setActiveTab] = useState("income")

  const defaultScenario: TaxScenario = {
    taxYear: 2023,
    filingStatus: "single",
    adjustedGrossIncome: 75000,
    earnedIncome: 75000,
    selfEmploymentIncome: 0,
    educationExpenses: 0,
    dependents: [],
    itemizedDeductions: {
      stateLocalTax: 0,
      mortgageInterest: 0,
      charitableContributions: 0,
      medicalExpenses: 0,
    },
  }

  const [scenario, setScenario] = useState<TaxScenario>(defaultScenario)
  const [useItemizedDeductions, setUseItemizedDeductions] = useState(false)
  const [dependentCount, setDependentCount] = useState(0)

  useEffect(() => {
    if (initialScenario) {
      setScenario(initialScenario)
      setDependentCount(initialScenario.dependents?.length || 0)
      setUseItemizedDeductions(!!initialScenario.itemizedDeductions)
    }
  }, [initialScenario])

  const handleInputChange = (field: keyof TaxScenario, value: any) => {
    setScenario((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleItemizedDeductionChange = (field: keyof typeof scenario.itemizedDeductions, value: number) => {
    setScenario((prev) => ({
      ...prev,
      itemizedDeductions: {
        ...(prev.itemizedDeductions || {}),
        [field]: value,
      },
    }))
  }

  const handleDependentCountChange = (count: number) => {
    setDependentCount(count)

    // Create array of dependents
    const dependents = Array.from({ length: count }, (_, i) => ({
      name: `Dependent ${i + 1}`,
      dateOfBirth: new Date(new Date().getFullYear() - 10 - i, 0, 1), // 10+ years old
      relationship: "Child",
      qualifyingChild: true,
      qualifyingRelative: false,
    }))

    setScenario((prev) => ({
      ...prev,
      dependents,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If not using itemized deductions, remove them from the scenario
    const finalScenario = {
      ...scenario,
      itemizedDeductions: useItemizedDeductions ? scenario.itemizedDeductions : undefined,
    }

    onCalculate(finalScenario)
  }

  const handleReset = () => {
    setScenario(defaultScenario)
    setDependentCount(0)
    setUseItemizedDeductions(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Calculator</CardTitle>
        <CardDescription>Enter your financial information to calculate your tax liability</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="deductions">Deductions</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="taxYear">Tax Year</Label>
                  <Select
                    value={scenario.taxYear.toString()}
                    onValueChange={(value) => handleInputChange("taxYear", Number.parseInt(value))}
                  >
                    <SelectTrigger id="taxYear" className="w-[180px]">
                      <SelectValue placeholder="Select tax year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select
                    value={scenario.filingStatus}
                    onValueChange={(value) => handleInputChange("filingStatus", value as FilingStatus)}
                  >
                    <SelectTrigger id="filingStatus" className="w-[180px]">
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                      <SelectItem value="qualifying_widow">Qualifying Widow(er)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="agi">Adjusted Gross Income</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Adjusted Gross Income (AGI) is your total income minus certain adjustments
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="w-[180px]">
                    <Input
                      id="agi"
                      type="number"
                      value={scenario.adjustedGrossIncome}
                      onChange={(e) => handleInputChange("adjustedGrossIncome", Number(e.target.value) || 0)}
                      className="text-right"
                    />
                  </div>
                </div>
                <Slider
                  value={[scenario.adjustedGrossIncome]}
                  min={0}
                  max={500000}
                  step={1000}
                  onValueChange={(value) => handleInputChange("adjustedGrossIncome", value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$0</span>
                  <span>$250,000</span>
                  <span>$500,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="selfEmploymentIncome">Self-Employment Income</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Income from self-employment is subject to both income tax and self-employment tax
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="w-[180px]">
                    <Input
                      id="selfEmploymentIncome"
                      type="number"
                      value={scenario.selfEmploymentIncome || 0}
                      onChange={(e) => handleInputChange("selfEmploymentIncome", Number(e.target.value) || 0)}
                      className="text-right"
                    />
                  </div>
                </div>
                <Slider
                  value={[scenario.selfEmploymentIncome || 0]}
                  min={0}
                  max={200000}
                  step={1000}
                  onValueChange={(value) => handleInputChange("selfEmploymentIncome", value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$0</span>
                  <span>$100,000</span>
                  <span>$200,000</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deductions" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch id="useItemized" checked={useItemizedDeductions} onCheckedChange={setUseItemizedDeductions} />
                <Label htmlFor="useItemized">Use Itemized Deductions</Label>
              </div>

              {useItemizedDeductions ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="stateLocalTax">State & Local Taxes</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Deduction for state and local taxes is capped at $10,000</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="w-[180px]">
                        <Input
                          id="stateLocalTax"
                          type="number"
                          value={scenario.itemizedDeductions?.stateLocalTax || 0}
                          onChange={(e) => handleItemizedDeductionChange("stateLocalTax", Number(e.target.value) || 0)}
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mortgageInterest">Mortgage Interest</Label>
                      <div className="w-[180px]">
                        <Input
                          id="mortgageInterest"
                          type="number"
                          value={scenario.itemizedDeductions?.mortgageInterest || 0}
                          onChange={(e) =>
                            handleItemizedDeductionChange("mortgageInterest", Number(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="charitableContributions">Charitable Contributions</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Cash contributions are generally limited to 60% of your AGI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="w-[180px]">
                        <Input
                          id="charitableContributions"
                          type="number"
                          value={scenario.itemizedDeductions?.charitableContributions || 0}
                          onChange={(e) =>
                            handleItemizedDeductionChange("charitableContributions", Number(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="medicalExpenses">Medical Expenses</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Only medical expenses exceeding 7.5% of your AGI are deductible
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="w-[180px]">
                        <Input
                          id="medicalExpenses"
                          type="number"
                          value={scenario.itemizedDeductions?.medicalExpenses || 0}
                          onChange={(e) =>
                            handleItemizedDeductionChange("medicalExpenses", Number(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600">
                    Using standard deduction for {scenario.filingStatus.replace("_", " ")} filing status
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="credits" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="dependents">Dependents</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Dependents under 17 may qualify for the Child Tax Credit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="w-[180px]">
                    <Input
                      id="dependents"
                      type="number"
                      min={0}
                      max={10}
                      value={dependentCount}
                      onChange={(e) => handleDependentCountChange(Number(e.target.value) || 0)}
                      className="text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="educationExpenses">Education Expenses</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Qualified education expenses may be eligible for education credits</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="w-[180px]">
                    <Input
                      id="educationExpenses"
                      type="number"
                      value={scenario.educationExpenses || 0}
                      onChange={(e) => handleInputChange("educationExpenses", Number(e.target.value) || 0)}
                      className="text-right"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Calculate Tax"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
