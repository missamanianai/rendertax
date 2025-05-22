"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TaxScenario } from "@/types/tax-calculator"
import { formatCurrency } from "@/utils/helpers"

interface SampleScenariosProps {
  onSelectScenario: (scenario: TaxScenario) => void
}

export function SampleScenarios({ onSelectScenario }: SampleScenariosProps) {
  // Sample scenarios to demonstrate different tax situations
  const scenarios: { name: string; description: string; scenario: TaxScenario }[] = [
    {
      name: "Single Filer with W-2 Income",
      description: "A typical single taxpayer with $75,000 in W-2 income",
      scenario: {
        taxYear: 2023,
        filingStatus: "single",
        adjustedGrossIncome: 75000,
        earnedIncome: 75000,
        selfEmploymentIncome: 0,
        educationExpenses: 0,
        dependents: [],
      },
    },
    {
      name: "Married Couple with Children",
      description: "Married couple filing jointly with $120,000 income and 2 children",
      scenario: {
        taxYear: 2023,
        filingStatus: "married_joint",
        adjustedGrossIncome: 120000,
        earnedIncome: 120000,
        selfEmploymentIncome: 0,
        educationExpenses: 0,
        dependents: [
          {
            name: "Child 1",
            dateOfBirth: new Date(2015, 0, 1),
            relationship: "Child",
            qualifyingChild: true,
            qualifyingRelative: false,
          },
          {
            name: "Child 2",
            dateOfBirth: new Date(2018, 0, 1),
            relationship: "Child",
            qualifyingChild: true,
            qualifyingRelative: false,
          },
        ],
      },
    },
    {
      name: "Self-Employed Individual",
      description: "Self-employed person with $85,000 in business income",
      scenario: {
        taxYear: 2023,
        filingStatus: "single",
        adjustedGrossIncome: 85000,
        earnedIncome: 85000,
        selfEmploymentIncome: 85000,
        educationExpenses: 0,
        dependents: [],
      },
    },
    {
      name: "High-Income Itemizer",
      description: "High-income individual with significant itemized deductions",
      scenario: {
        taxYear: 2023,
        filingStatus: "single",
        adjustedGrossIncome: 250000,
        earnedIncome: 250000,
        selfEmploymentIncome: 0,
        educationExpenses: 0,
        dependents: [],
        itemizedDeductions: {
          stateLocalTax: 10000, // Capped at $10,000
          mortgageInterest: 15000,
          charitableContributions: 10000,
          medicalExpenses: 5000,
        },
      },
    },
    {
      name: "Student with Education Credits",
      description: "College student with qualified education expenses",
      scenario: {
        taxYear: 2023,
        filingStatus: "single",
        adjustedGrossIncome: 35000,
        earnedIncome: 35000,
        selfEmploymentIncome: 0,
        educationExpenses: 4000,
        dependents: [],
      },
    },
    {
      name: "Head of Household with EITC",
      description: "Single parent with one child eligible for Earned Income Tax Credit",
      scenario: {
        taxYear: 2023,
        filingStatus: "head_of_household",
        adjustedGrossIncome: 30000,
        earnedIncome: 30000,
        selfEmploymentIncome: 0,
        educationExpenses: 0,
        dependents: [
          {
            name: "Child",
            dateOfBirth: new Date(2016, 0, 1),
            relationship: "Child",
            qualifyingChild: true,
            qualifyingRelative: false,
          },
        ],
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Tax Scenarios</CardTitle>
        <CardDescription>
          Explore pre-configured tax scenarios to see how different situations affect tax liability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((item) => (
            <Card key={item.name} className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Income:</span>
                    <span>{formatCurrency(item.scenario.adjustedGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Filing Status:</span>
                    <span>{item.scenario.filingStatus.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dependents:</span>
                    <span>{item.scenario.dependents?.length || 0}</span>
                  </div>
                  {item.scenario.selfEmploymentIncome > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Self-Employment:</span>
                      <span>{formatCurrency(item.scenario.selfEmploymentIncome)}</span>
                    </div>
                  )}
                  {item.scenario.educationExpenses > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Education Expenses:</span>
                      <span>{formatCurrency(item.scenario.educationExpenses)}</span>
                    </div>
                  )}
                </div>
                <Button className="w-full" variant="outline" onClick={() => onSelectScenario(item.scenario)}>
                  Load Scenario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
