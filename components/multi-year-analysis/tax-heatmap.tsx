"use client"

import { useEffect, useRef } from "react"
import type { YearlyTaxData } from "@/types/multi-year"
import { formatCurrency, formatPercentage } from "@/utils/helpers"

interface TaxHeatmapProps {
  data: YearlyTaxData[]
  metricOptions: { value: string; label: string }[]
}

export function TaxHeatmap({ data, metricOptions }: TaxHeatmapProps) {
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
    const years = sortedData.map((d) => d.year)

    // Filter out metrics we don't want to show
    const metrics = metricOptions.map((option) => option.value)
    const metricLabels = metricOptions.map((option) => option.label)

    // Calculate chart dimensions
    const padding = { top: 40, right: 40, bottom: 40, left: 200 }
    const cellWidth = (canvas.width - padding.left - padding.right) / years.length
    const cellHeight = (canvas.height - padding.top - padding.bottom) / metrics.length

    // Draw title
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Tax Metrics Heatmap", canvas.width / 2, 10)

    // Draw year labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    years.forEach((year, i) => {
      const x = padding.left + i * cellWidth + cellWidth / 2
      ctx.fillText(year.toString(), x, padding.top / 2)
    })

    // Draw metric labels
    ctx.textAlign = "right"
    metricLabels.forEach((label, i) => {
      const y = padding.top + i * cellHeight + cellHeight / 2
      ctx.fillText(label, padding.left - 10, y)
    })

    // Calculate min and max values for each metric for color scaling
    const metricRanges = metrics.map((metric) => {
      const values = sortedData.map((d) => d[metric as keyof YearlyTaxData] as number)
      return {
        min: Math.min(...values),
        max: Math.max(...values),
      }
    })

    // Draw cells
    metrics.forEach((metric, metricIndex) => {
      const { min, max } = metricRanges[metricIndex]
      const range = max - min

      years.forEach((year, yearIndex) => {
        const yearData = sortedData[yearIndex]
        const value = yearData[metric as keyof YearlyTaxData] as number

        // Calculate normalized value for color intensity
        const normalizedValue = range === 0 ? 0.5 : (value - min) / range

        // Calculate cell position
        const x = padding.left + yearIndex * cellWidth
        const y = padding.top + metricIndex * cellHeight

        // Draw cell background
        ctx.fillStyle = getHeatmapColor(normalizedValue)
        ctx.fillRect(x, y, cellWidth, cellHeight)

        // Draw cell border
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, cellWidth, cellHeight)

        // Draw value text
        ctx.fillStyle = normalizedValue > 0.7 ? "#ffffff" : "#1e293b"
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const formattedValue = metric === "effectiveTaxRate" ? formatPercentage(value) : formatCurrency(value)

        ctx.fillText(formattedValue, x + cellWidth / 2, y + cellHeight / 2)

        // Draw year-over-year change indicator if not first year
        if (yearIndex > 0) {
          const prevYearData = sortedData[yearIndex - 1]
          const prevValue = prevYearData[metric as keyof YearlyTaxData] as number
          const change = value - prevValue

          // Draw arrow
          const arrowX = x + cellWidth - 10
          const arrowY = y + 10

          ctx.fillStyle = change >= 0 ? "#ef4444" : "#22c55e"

          // Draw triangle
          ctx.beginPath()
          if (change >= 0) {
            // Up arrow
            ctx.moveTo(arrowX, arrowY - 5)
            ctx.lineTo(arrowX - 4, arrowY + 1)
            ctx.lineTo(arrowX + 4, arrowY + 1)
          } else {
            // Down arrow
            ctx.moveTo(arrowX, arrowY + 5)
            ctx.lineTo(arrowX - 4, arrowY - 1)
            ctx.lineTo(arrowX + 4, arrowY - 1)
          }
          ctx.fill()
        }
      })
    })

    // Helper function to get color based on normalized value
    function getHeatmapColor(value: number): string {
      // Blue to red gradient
      const r = Math.floor(255 * Math.min(1, value * 2))
      const g = Math.floor(255 * Math.min(1, 2 - value * 2))
      const b = Math.floor(200 * (1 - value))

      return `rgb(${r}, ${g}, ${b})`
    }
  }, [data, metricOptions])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-full"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  )
}
