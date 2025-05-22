"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { TaxCalculationResult } from "@/types/tax-calculator"
import { formatCurrency } from "@/utils/helpers"
import { SaveIcon, PrinterIcon, DownloadIcon } from "lucide-react"

interface TaxResultsSummaryProps {
  result: TaxCalculationResult
  onSaveComparison: (name: string) => void
}

export function TaxResultsSummary({ result, onSaveComparison }: TaxResultsSummaryProps) {
  const [comparisonName, setComparisonName] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSaveComparison = () => {
    if (comparisonName.trim()) {
      onSaveComparison(comparisonName)
      setComparisonName("")
      setDialogOpen(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadCSV = () => {
    // Create CSV content
    const csvContent = [
      ["Tax Calculation Summary"],
      ["Category", "Amount"],
      ["Adjusted Gross Income", result.adjustedGrossIncome],
      ["Total Deductions", result.deductions.totalDeductions],
      ["Taxable Income", result.taxableIncome],
      ["Income Tax", result.incomeTax],
      ["Self-Employment Tax", result.selfEmploymentTax],
      ["Alternative Minimum Tax", result.alternativeMinimumTax],
      ["Total Credits", result.credits.totalCredits],
      ["Total Tax", result.totalTax],
      ["Effective Tax Rate", `${(result.effectiveRate * 100).toFixed(2)}%`],
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "tax_calculation.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tax Calculation Results</CardTitle>
            <CardDescription>Summary of your estimated tax liability</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save for Comparison</DialogTitle>
                  <DialogDescription>
                    Give this tax scenario a name to save it for comparison with other scenarios.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="comparisonName">Scenario Name</Label>
                  <Input
                    id="comparisonName"
                    value={comparisonName}
                    onChange={(e) => setComparisonName(e.target.value)}
                    placeholder="e.g., Base Scenario, With Deductions, etc."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveComparison}>Save Scenario</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Adjusted Gross Income</h3>
              <p className="text-2xl font-bold">{formatCurrency(result.adjustedGrossIncome)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Deductions</h3>
              <p className="text-xl">
                {formatCurrency(result.deductions.totalDeductions)}
                <Badge variant="outline" className="ml-2">
                  {result.deductions.usingItemized ? "Itemized" : "Standard"}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Taxable Income</h3>
              <p className="text-xl">{formatCurrency(result.taxableIncome)}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Tax</h3>
              <p className="text-3xl font-bold text-primary">{formatCurrency(result.totalTax)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Effective Tax Rate</h3>
              <p className="text-xl">{(result.effectiveRate * 100).toFixed(2)}%</p>
            </div>
            {result.credits.totalCredits > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tax Credits</h3>
                <p className="text-xl text-green-600">-{formatCurrency(result.credits.totalCredits)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tax Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Income Tax:</span>
              <span>{formatCurrency(result.incomeTax)}</span>
            </div>
            {result.selfEmploymentTax > 0 && (
              <div className="flex justify-between">
                <span>Self-Employment Tax:</span>
                <span>{formatCurrency(result.selfEmploymentTax)}</span>
              </div>
            )}
            {result.alternativeMinimumTax > 0 && (
              <div className="flex justify-between">
                <span>Alternative Minimum Tax:</span>
                <span>{formatCurrency(result.alternativeMinimumTax)}</span>
              </div>
            )}
            {Object.entries(result.credits.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-green-600">
                <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</span>
                <span>-{formatCurrency(value as number)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
