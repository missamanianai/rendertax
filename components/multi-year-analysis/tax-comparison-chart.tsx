"use client"

import { useEffect, useRef } from "react"
import type { YearlyTaxData } from "@/types/multi-year"
import { formatCurrency, formatPercentage } from "@/utils/helpers"

interface TaxComparisonChartProps {
  data: YearlyTaxData[]
  metric: string
  metricLabel: string
}

export function TaxComparisonChart({ data, metric, metricLabel }: TaxComparisonChartProps) {
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

    // Draw bars
    const barWidth = (chartWidth / years.length) * 0.7
    const barSpacing = (chartWidth / years.length) * 0.3

    values.forEach((value, i) => {
      const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2
      const barHeight = ((value - minValue) / valueRange) * chartHeight
      const y = canvas.height - padding.bottom - barHeight

      // Draw bar
      ctx.beginPath()

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding.bottom)
      gradient.addColorStop(0, "#3b82f6")
      gradient.addColorStop(1, "#93c5fd")

      ctx.fillStyle = gradient
      ctx.rect(x, y, barWidth, barHeight)
      ctx.fill()

      // Draw year label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(years[i].toString(), x + barWidth / 2, canvas.height - padding.bottom + 10)

      // Draw value label
      ctx.fillStyle = "#1e293b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"

      if (metric === "effectiveTaxRate") {
        ctx.fillText(formatPercentage(value), x + barWidth / 2, y - 5)
      } else {
        ctx.fillText(formatCurrency(value), x + barWidth / 2, y - 5)
      }

      // Draw year-over-year change if not first year
      if (i > 0) {
        const prevValue = values[i - 1]
        const change = value - prevValue
        const percentChange = (change / prevValue) * 100

        ctx.fillStyle = change >= 0 ? "#ef4444" : "#22c55e"
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "top"

        const changeText = `${change >= 0 ? "▲" : "▼"} ${Math.abs(percentChange).toFixed(1)}%`
        ctx.fillText(changeText, x + barWidth / 2, y - 20)
      }
    })

    // Draw title
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText(`${metricLabel} Comparison by Year`, canvas.width / 2, 10)

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
