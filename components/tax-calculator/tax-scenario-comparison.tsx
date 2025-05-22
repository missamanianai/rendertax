"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TaxCalculationResult } from "@/types/tax-calculator"
import { formatCurrency } from "@/utils/helpers"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TaxScenarioComparisonProps {
  scenarios: {
    [key: string]: TaxCalculationResult
  }
  onClearComparisons: () => void
}

export function TaxScenarioComparison({ scenarios, onClearComparisons }: TaxScenarioComparisonProps) {
  const scenarioNames = Object.keys(scenarios)

  if (scenarioNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
          <CardDescription>Save tax scenarios to compare them side by side</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No scenarios saved yet. Calculate a tax scenario and click "Save" to add it for comparison.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart
  const chartData = [
    {
      name: "Total Tax",
      ...scenarioNames.reduce(
        (acc, name) => {
          acc[name] = scenarios[name].totalTax
          return acc
        },
        {} as Record<string, number>,
      ),
    },
    {
      name: "Income Tax",
      ...scenarioNames.reduce(
        (acc, name) => {
          acc[name] = scenarios[name].incomeTax
          return acc
        },
        {} as Record<string, number>,
      ),
    },
    {
      name: "Self-Employment Tax",
      ...scenarioNames.reduce(
        (acc, name) => {
          acc[name] = scenarios[name].selfEmploymentTax
          return acc
        },
        {} as Record<string, number>,
      ),
    },
    {
      name: "Tax Credits",
      ...scenarioNames.reduce(
        (acc, name) => {
          acc[name] = scenarios[name].credits.totalCredits
          return acc
        },
        {} as Record<string, number>,
      ),
    },
  ]

  // Generate random colors for the bars
  const colors = scenarioNames.map(
    () =>
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Scenario Comparison</CardTitle>
            <CardDescription>Compare different tax scenarios side by side</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onClearComparisons}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Visual Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                {scenarioNames.map((name, index) => (
                  <Bar key={name} dataKey={name} fill={colors[index]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Detailed Comparison</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  {scenarioNames.map((name) => (
                    <TableHead key={name}>{name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Adjusted Gross Income</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].adjustedGrossIncome)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Deductions</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].deductions.totalDeductions)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Taxable Income</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].taxableIncome)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Income Tax</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].incomeTax)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Self-Employment Tax</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].selfEmploymentTax)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tax Credits</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].credits.totalCredits)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Total Tax</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{formatCurrency(scenarios[name].totalTax)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Effective Tax Rate</TableCell>
                  {scenarioNames.map((name) => (
                    <TableCell key={name}>{(scenarios[name].effectiveRate * 100).toFixed(2)}%</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
