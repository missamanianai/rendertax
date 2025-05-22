"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { TaxTrend } from "@/types/multi-year"
import { formatCurrency, formatPercentage } from "@/utils/helpers"
import { ArrowRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

interface TaxYearSummaryProps {
  trend: TaxTrend
  years: number[]
}

export function TaxYearSummary({ trend, years }: TaxYearSummaryProps) {
  if (!trend) return null

  const isPercentage = trend.metric === "effectiveTaxRate"
  const formatValue = isPercentage ? formatPercentage : formatCurrency

  const trendIcon =
    trend.overallTrend === "increasing" ? (
      <TrendingUpIcon className="h-5 w-5 text-red-500" />
    ) : trend.overallTrend === "decreasing" ? (
      <TrendingDownIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowRightIcon className="h-5 w-5 text-blue-500" />
    )

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Average</h3>
            <div className="flex items-center gap-1">
              {trendIcon}
              <span className="text-sm font-medium">
                {trend.overallTrend.charAt(0).toUpperCase() + trend.overallTrend.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">{formatValue(trend.averageValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Highest</h3>
            <span className="text-sm font-medium">{trend.maxYear}</span>
          </div>
          <p className="text-2xl font-bold mt-2">{formatValue(trend.maxValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Lowest</h3>
            <span className="text-sm font-medium">{trend.minYear}</span>
          </div>
          <p className="text-2xl font-bold mt-2">{formatValue(trend.minValue)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
