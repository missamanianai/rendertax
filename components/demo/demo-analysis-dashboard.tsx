"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

// Sample data for the dashboard
const taxSummaryData = [
  { year: 2020, income: 78500, federalTax: 12450, stateTax: 3920, totalTax: 16370 },
  { year: 2021, income: 82300, federalTax: 13180, stateTax: 4115, totalTax: 17295 },
  { year: 2022, income: 86700, federalTax: 14050, stateTax: 4335, totalTax: 18385 },
  { year: 2023, income: 92400, federalTax: 15210, stateTax: 4620, totalTax: 19830 },
]

const incomeBreakdownData = [
  { name: "Wages", value: 72000 },
  { name: "Interest", value: 3200 },
  { name: "Dividends", value: 5800 },
  { name: "Capital Gains", value: 8400 },
  { name: "Business", value: 3000 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

const refundOpportunitiesData = [
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 1200 },
  { month: "Apr", amount: 1200 },
  { month: "May", amount: 1800 },
  { month: "Jun", amount: 2400 },
  { month: "Jul", amount: 2400 },
  { month: "Aug", amount: 3600 },
  { month: "Sep", amount: 3600 },
  { month: "Oct", amount: 4200 },
  { month: "Nov", amount: 4800 },
  { month: "Dec", amount: 5400 },
]

export function DemoAnalysisDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Tax Summary (2020-2023)</CardTitle>
          <CardDescription>Overview of income and tax payments over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxSummaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#8884d8" />
                <Bar dataKey="federalTax" name="Federal Tax" fill="#82ca9d" />
                <Bar dataKey="stateTax" name="State Tax" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Breakdown (2023)</CardTitle>
          <CardDescription>Sources of income for tax year 2023</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Refund Opportunities</CardTitle>
          <CardDescription>Potential refund amount over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={refundOpportunitiesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="amount" name="Potential Refund" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>Key findings from tax analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Potential Refund:</span>
              <span className="text-lg font-bold text-green-600">$5,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Audit Risk Level:</span>
              <span className="text-sm font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Confidence Score:</span>
              <span className="text-sm">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Years Analyzed:</span>
              <span className="text-sm">2020-2023</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">High Priority Issues:</span>
              <span className="text-sm">3</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
