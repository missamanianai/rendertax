"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Sample data for year-over-year comparison
const yearComparisonData = [
  {
    year: 2020,
    income: 78500,
    federalTax: 12450,
    stateTax: 3920,
    totalTax: 16370,
    effectiveRate: 20.85,
  },
  {
    year: 2021,
    income: 82300,
    federalTax: 13180,
    stateTax: 4115,
    totalTax: 17295,
    effectiveRate: 21.02,
  },
  {
    year: 2022,
    income: 86700,
    federalTax: 14050,
    stateTax: 4335,
    totalTax: 18385,
    effectiveRate: 21.21,
  },
  {
    year: 2023,
    income: 92400,
    federalTax: 15210,
    stateTax: 4620,
    totalTax: 19830,
    effectiveRate: 21.46,
  },
]

// Sample data for state comparison
const stateComparisonData = [
  { state: "Current (CA)", stateTax: 4620, effectiveRate: 5.0 },
  { state: "TX", stateTax: 0, effectiveRate: 0 },
  { state: "NY", stateTax: 5544, effectiveRate: 6.0 },
  { state: "FL", stateTax: 0, effectiveRate: 0 },
  { state: "WA", stateTax: 0, effectiveRate: 0 },
  { state: "CO", stateTax: 4066, effectiveRate: 4.4 },
]

// Sample data for filing status comparison
const filingStatusData = [
  { status: "Single", federalTax: 15210, effectiveRate: 16.46 },
  { status: "Married Filing Jointly", federalTax: 12012, effectiveRate: 13.0 },
  { status: "Married Filing Separately", federalTax: 15672, effectiveRate: 16.96 },
  { status: "Head of Household", federalTax: 13398, effectiveRate: 14.5 },
]

// Sample data for tax optimization comparison
const optimizationComparisonData = [
  { category: "Current", value: 19830 },
  { category: "With 401(k)", value: 17850 },
  { category: "With HSA", value: 18930 },
  { category: "With Both", value: 16950 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function DemoComparison() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="year" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="year">Year-over-Year</TabsTrigger>
          <TabsTrigger value="state">State Comparison</TabsTrigger>
          <TabsTrigger value="filing">Filing Status</TabsTrigger>
          <TabsTrigger value="optimization">Tax Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="year">
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Tax Comparison</CardTitle>
              <CardDescription>Compare tax data across multiple years</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="federalTax" name="Federal Tax" fill="#8884d8" />
                      <Bar dataKey="stateTax" name="State Tax" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="effectiveRate"
                        name="Effective Tax Rate %"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="state">
          <Card>
            <CardHeader>
              <CardTitle>State Tax Comparison</CardTitle>
              <CardDescription>Compare tax implications across different states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="state" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="stateTax" name="State Tax" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="state" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="effectiveRate" name="Effective Rate %" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filing">
          <Card>
            <CardHeader>
              <CardTitle>Filing Status Comparison</CardTitle>
              <CardDescription>Compare tax implications of different filing statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filingStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="federalTax" name="Federal Tax" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filingStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="effectiveRate" name="Effective Rate %" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Tax Optimization Comparison</CardTitle>
              <CardDescription>Compare tax implications of different optimization strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={optimizationComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="value" name="Total Tax" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={optimizationComparisonData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: $${optimizationComparisonData.find((item) => item.category === name)?.value.toLocaleString()}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="category"
                      >
                        {optimizationComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
