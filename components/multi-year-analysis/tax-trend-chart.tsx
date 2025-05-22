"use client"

import { useEffect, useRef } from "react"
import type { YearlyTaxData } from "@/types/multi-year"
import { formatCurrency, formatPercentage } from "@/utils/helpers"

interface TaxTrendChartProps {
  data: YearlyTaxData[]
  metric: string
  metricLabel: string
}

export function TaxTrendChart({ data, metric, metricLabel }: TaxTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sort data by year
    const sortedData = [...data].sort((a, b) => a.year - b.year)

    // Extract values for the selected metric
    const years = sortedData.map((d) => d.year)
    const values = sortedData.map((d) => d[metric as keyof YearlyTaxData] as number)

    // Calculate chart dimensions
    const padding = { top: 40, right: 40, bottom: 60, left: 80 }
    const chartWidth = canvas.width - padding.left - padding.right
    const chartHeight = canvas.height - padding.top - padding.bottom

    // Calculate scales
    const minValue = Math.min(...values) * 0.9
    const maxValue = Math.max(...values) * 1.1
    const valueRange = maxValue - minValue

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1

    // X-axis
    ctx.moveTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)

    // Y-axis
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvas.height - padding.bottom)
    ctx.stroke()

    // Draw grid lines
    const gridLineCount = 5
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 0.5

    for (let i = 0; i <= gridLineCount; i++) {
      const y = padding.top + (chartHeight * i) / gridLineCount
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvas.width - padding.right, y)

      // Y-axis labels
      const value = maxValue - (valueRange * i) / gridLineCount
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

      if (metric === "effectiveTaxRate") {
        ctx.fillText(formatPercentage(value), padding.left - 10, y)
      } else {
        ctx.fillText(formatCurrency(value), padding.left - 10, y)
      }
    }
    ctx.stroke()

    // Draw x-axis labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    const xStep = chartWidth / (years.length - 1 || 1)
    years.forEach((year, i) => {
      const x = padding.left + i * xStep
      ctx.fillText(year.toString(), x, canvas.height - padding.bottom + 10)
    })

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.lineJoin = "round"

    values.forEach((value, i) => {
      const x = padding.left + i * xStep
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw points
    values.forEach((value, i) => {
      const x = padding.left + i * xStep
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight

      ctx.beginPath()
      ctx.fillStyle = "#3b82f6"
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.fillStyle = "#ffffff"
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw trend line (linear regression)
    if (years.length > 1) {
      // Calculate linear regression
      const n = years.length
      const sumX = years.reduce((sum, x) => sum + x, 0)
      const sumY = values.reduce((sum, y) => sum + y, 0)
      const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0)
      const sumXX = years.reduce((sum, x) => sum + x * x, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      // Draw trend line
      ctx.beginPath()
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      const startYear = years[0]
      const endYear = years[years.length - 1]
      const startValue = intercept + slope * startYear
      const endValue = intercept + slope * endYear

      const startX = padding.left
      const startY = padding.top + chartHeight - ((startValue - minValue) / valueRange) * chartHeight
      const endX = padding.left + chartWidth
      const endY = padding.top + chartHeight - ((endValue - minValue) / valueRange) * chartHeight

      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw title
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText(`${metricLabel} (${years[0]} - ${years[years.length - 1]})`, canvas.width / 2, 10)

    // Draw y-axis title
    ctx.save()
    ctx.translate(20, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = "#64748b"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(metricLabel, 0, 0)
    ctx.restore()
  }, [data, metric, metricLabel])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  )
}
