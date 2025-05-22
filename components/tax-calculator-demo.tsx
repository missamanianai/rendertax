"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilingStatus } from "@/types/transcript"
import { TaxCalculator } from "@/services/tax-calculator"
import type { TaxScenario } from "@/types/tax-calculator"

export function TaxCalculatorDemo() {
  const [taxYear, setTaxYear] = useState<number>(2023)
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single")
  const [agi, setAgi] = useState<number>(50000)
  const [selfEmploymentIncome, setSelfEmploymentIncome] = useState<number>(0)
  const [dependents, setDependents] = useState<number>(0)
  const [educationExpenses, setEducationExpenses] = useState<number>(0)
  const [itemizedDeductions, setItemizedDeductions] = useState({
    stateLocalTax: 0,
    mortgageInterest: 0,
    charitableContributions: 0,
    medicalExpenses: 0,
  })
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleItemizedDeductionChange = (field: string, value: number) => {
    setItemizedDeductions((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTax = async () => {
    setIsLoading(true)

    try {
      const taxCalculator = new TaxCalculator()

      // Create dependents array
      const dependentsArray = Array.from({ length: dependents }, (_, i) => ({
        name: `Dependent ${i + 1}`,
        dateOfBirth: new Date(new Date().getFullYear() - 10, 0, 1), // 10 years old
        relationship: "Child",
        qualifyingChild: true,
        qualifyingRelative: false,
      }))

      // Create tax scenario
      const scenario: TaxScenario = {
        adjustedGrossIncome: agi,
        selfEmploymentIncome: selfEmploymentIncome > 0 ? selfEmploymentIncome : undefined,
        educationExpenses: educationExpenses > 0 ? educationExpenses : undefined,
        itemizedDeductions: Object.values(itemizedDeductions).some((val) => val > 0)
          ? {
              stateLocalTax: itemizedDeductions.stateLocalTax,
              mortgageInterest: itemizedDeductions.mortgageInterest,
              charitableContributions: itemizedDeductions.charitableContributions,
              medicalExpenses: itemizedDeductions.medicalExpenses,
            }
          : undefined,
        dependents: dependentsArray,
        filingStatus,
        taxYear,
      }

      // Calculate tax
      const taxResult = await taxCalculator.calculateTotalTax(scenario, taxCalculator.getTaxDataForYear(taxYear))
      setResult(taxResult)
    } catch (error) {
      console.error("Error calculating tax:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Comprehensive Tax Calculator</CardTitle>
        <CardDescription>Calculate tax liability with advanced options</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="credits">Credits & Special</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxYear">Tax Year</Label>
                <Select value={taxYear.toString()} onValueChange={(value) => setTaxYear(Number.parseInt(value))}>
                  <SelectTrigger id="taxYear">
                    <SelectValue placeholder="Select tax year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filingStatus">Filing Status</Label>
                <Select value={filingStatus} onValueChange={(value) => setFilingStatus(value as FilingStatus)}>
                  <SelectTrigger id="filingStatus">
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
              <Label htmlFor="agi">Adjusted Gross Income (AGI)</Label>
              <Input
                id="agi"
                type="number"
                value={agi}
                onChange={(e) => setAgi(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependents">Number of Dependents</Label>
              <Input
                id="dependents"
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stateLocalTax">State & Local Taxes Paid</Label>
              <Input
                id="stateLocalTax"
                type="number"
                value={itemizedDeductions.stateLocalTax}
                onChange={(e) => handleItemizedDeductionChange("stateLocalTax", Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Capped at $10,000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mortgageInterest">Mortgage Interest</Label>
              <Input
                id="mortgageInterest"
                type="number"
                value={itemizedDeductions.mortgageInterest}
                onChange={(e) =>
                  handleItemizedDeductionChange("mortgageInterest", Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="charitableContributions">Charitable Contributions</Label>
              <Input
                id="charitableContributions"
                type="number"
                value={itemizedDeductions.charitableContributions}
                onChange={(e) =>
                  handleItemizedDeductionChange("charitableContributions", Number.parseFloat(e.target.value) || 0)
                }
              />
              <p className="text-xs text-gray-500">Limited to 60% of AGI for cash donations</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalExpenses">Medical Expenses</Label>
              <Input
                id="medicalExpenses"
                type="number"
                value={itemizedDeductions.medicalExpenses}
                onChange={(e) =>
                  handleItemizedDeductionChange("medicalExpenses", Number.parseFloat(e.target.value) || 0)
                }
              />
              <p className="text-xs text-gray-500">Only amounts exceeding 7.5% of AGI are deductible</p>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selfEmploymentIncome">Self-Employment Income</Label>
              <Input
                id="selfEmploymentIncome"
                type="number"
                value={selfEmploymentIncome}
                onChange={(e) => setSelfEmploymentIncome(Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Subject to self-employment tax (15.3%)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationExpenses">Education Expenses</Label>
              <Input
                id="educationExpenses"
                type="number"
                value={educationExpenses}
                onChange={(e) => setEducationExpenses(Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Eligible for American Opportunity or Lifetime Learning Credit</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button onClick={calculateTax} disabled={isLoading} className="w-full mb-4">
          {isLoading ? "Calculating..." : "Calculate Tax"}
        </Button>

        {result && (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-lg">Tax Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Adjusted Gross Income:</span>
                      <span className="font-medium">${result.adjustedGrossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span className="font-medium">${result.deductions.totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-medium">${result.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span className="font-bold">${result.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effective Tax Rate:</span>
                      <span className="font-medium">{(result.effectiveRate * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-lg">Tax Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Income Tax:</span>
                      <span className="font-medium">${result.incomeTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Self-Employment Tax:</span>
                      <span className="font-medium">${result.selfEmploymentTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alternative Minimum Tax:</span>
                      <span className="font-medium">${result.alternativeMinimumTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Credits:</span>
                      <span className="font-medium">${result.credits.totalCredits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Using Itemized Deductions:</span>
                      <span className="font-medium">{result.deductions.usingItemized ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.credits.totalCredits > 0 && (
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-lg">Tax Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(result.credits.breakdown).map(([creditName, amount]) => (
                      <div key={creditName} className="flex justify-between">
                        <span>{creditName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</span>
                        <span className="font-medium">${(amount as number).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
