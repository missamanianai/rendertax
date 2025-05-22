"use client"

import type { YearlyTaxData } from "@/types/multi-year"
import { formatCurrency, formatPercentage } from "@/utils/helpers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

interface TaxMetricsTableProps {
  data: YearlyTaxData[]
  metricOptions: { value: string; label: string }[]
}

export function TaxMetricsTable({ data, metricOptions }: TaxMetricsTableProps) {
  // Sort data by year
  const sortedData = [...data].sort((a, b) => a.year - b.year)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Metric</TableHead>
            {sortedData.map((yearData) => (
              <TableHead key={yearData.year} className="text-right">
                {yearData.year}
              </TableHead>
            ))}
            {sortedData.length > 1 && <TableHead className="text-right">Change</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metricOptions.map((metric) => (
            <TableRow key={metric.value}>
              <TableCell className="font-medium">{metric.label}</TableCell>

              {sortedData.map((yearData) => {
                const value = yearData[metric.value as keyof YearlyTaxData] as number

                return (
                  <TableCell key={`${yearData.year}-${metric.value}`} className="text-right">
                    {metric.value === "effectiveTaxRate" ? formatPercentage(value) : formatCurrency(value)}
                  </TableCell>
                )
              })}

              {sortedData.length > 1 && (
                <TableCell className="text-right">{calculateChange(sortedData, metric.value)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  function calculateChange(data: YearlyTaxData[], metricKey: string) {
    if (data.length < 2) return null

    const firstValue = data[0][metricKey as keyof YearlyTaxData] as number
    const lastValue = data[data.length - 1][metricKey as keyof YearlyTaxData] as number

    const change = lastValue - firstValue
    const percentChange = (change / Math.abs(firstValue)) * 100

    const isPositive = change > 0
    const color = isPositive ? "text-red-600" : "text-green-600"

    return (
      <span className={`flex items-center justify-end gap-1 ${color}`}>
        {isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
        {Math.abs(percentChange).toFixed(1)}%
      </span>
    )
  }
}
