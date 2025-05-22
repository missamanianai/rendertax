"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TaxCalculationResult } from "@/types/tax-calculator"
import { formatCurrency } from "@/utils/helpers"

interface TaxBreakdownChartProps {
  result: TaxCalculationResult
}

export function TaxBreakdownChart({ result }: TaxBreakdownChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Prepare data for the chart
    const taxComponents = [
      { name: "Income Tax", value: result.incomeTax, color: "#3b82f6" }, // blue
      { name: "Self-Employment Tax", value: result.selfEmploymentTax, color: "#f97316" }, // orange
      { name: "Alternative Minimum Tax", value: result.alternativeMinimumTax, color: "#8b5cf6" }, // purple
    ].filter((component) => component.value > 0)

    // Calculate total for percentages
    const total = taxComponents.reduce((sum, item) => sum + item.value, 0)

    // Draw the pie chart
    let startAngle = 0
    const centerX = canvasRef.current.width / 2
    const centerY = canvasRef.current.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw each slice
    taxComponents.forEach((component) => {
      const sliceAngle = (2 * Math.PI * component.value) / total

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = component.color
      ctx.fill()

      // Calculate position for the label
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      // Only draw label if slice is big enough
      if (component.value / total > 0.05) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${Math.round((component.value / total) * 100)}%`, labelX, labelY)
      }

      startAngle += sliceAngle
    })

    // Draw a white circle in the middle for a donut chart effect
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()

    // Add total in the center
    ctx.fillStyle = "#000000"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Total Tax", centerX, centerY - 10)
    ctx.font = "bold 16px Arial"
    ctx.fillText(formatCurrency(total), centerX, centerY + 15)
  }, [result])

  // Calculate marginal tax bracket
  const getMarginalTaxBracket = () => {
    const income = result.taxableIncome
    const taxYear = 2023 // Assuming current tax year

    // 2023 tax brackets for single filers (simplified)
    const brackets = [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 578125, rate: 35 },
      { min: 578125, max: Number.POSITIVE_INFINITY, rate: 37 },
    ]

    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate
      }
    }

    return brackets[brackets.length - 1].rate
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Tax Breakdown</CardTitle>
        <CardDescription>Visual breakdown of your tax components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <canvas ref={canvasRef} width={300} height={300} />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Marginal Tax Rate</h3>
              <p className="text-2xl font-bold">{getMarginalTaxBracket()}%</p>
              <p className="text-sm text-gray-500">This is the tax rate that applies to your last dollar of income</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Effective Tax Rate</h3>
              <p className="text-2xl font-bold">{(result.effectiveRate * 100).toFixed(2)}%</p>
              <p className="text-sm text-gray-500">This is your total tax divided by your adjusted gross income</p>
            </div>

            {result.deductions.usingItemized && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Itemized Deductions Benefit</h3>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    Math.max(0, result.deductions.itemizedDeductions - result.deductions.standardDeduction),
                  )}
                </p>
                <p className="text-sm text-gray-500">Additional deduction amount compared to standard deduction</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Legend</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {result.incomeTax > 0 && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                <span className="text-sm">Income Tax</span>
              </div>
            )}
            {result.selfEmploymentTax > 0 && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-sm mr-2"></div>
                <span className="text-sm">Self-Employment Tax</span>
              </div>
            )}
            {result.alternativeMinimumTax > 0 && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-sm mr-2"></div>
                <span className="text-sm">Alternative Minimum Tax</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
