"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Sample refund opportunity data
const refundOpportunities = [
  {
    id: 1,
    type: "Penalty Abatement",
    description: "First-time penalty abatement for late filing in 2021",
    amount: 1200,
    probability: 85,
    requirements: ["No penalties in prior 3 years", "Current on all filing requirements"],
    timeframe: "60-90 days",
  },
  {
    id: 2,
    type: "Missed Deduction",
    description: "Home office deduction not claimed for 2022",
    amount: 1800,
    probability: 75,
    requirements: ["Documentation of home office use", "Exclusive use for business"],
    timeframe: "File amended return within 3 years",
  },
  {
    id: 3,
    type: "Tax Credit",
    description: "Eligible for education credits in 2023",
    amount: 2400,
    probability: 90,
    requirements: ["Form 1098-T from eligible institution", "Qualified education expenses"],
    timeframe: "Current tax year",
  },
]

// Chart data
const opportunityChartData = [
  { name: "Penalty Abatement", amount: 1200, probability: 85 },
  { name: "Missed Deduction", amount: 1800, probability: 75 },
  { name: "Tax Credit", amount: 2400, probability: 90 },
]

export function DemoRefundOpportunities() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refund Opportunities</CardTitle>
          <CardDescription>Potential tax refunds identified through analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opportunityChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "amount" ? `$${value.toLocaleString()}` : `${value}%`,
                    name === "amount" ? "Amount" : "Probability",
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="amount" name="Amount" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="probability" name="Probability %" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {refundOpportunities.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardHeader>
              <CardTitle>{opportunity.type}</CardTitle>
              <CardDescription>{opportunity.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Probability of Success</span>
                    <span className="text-sm font-medium">{opportunity.probability}%</span>
                  </div>
                  <Progress value={opportunity.probability} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Potential Refund:</span>
                  <span className="text-lg font-bold text-green-600">${opportunity.amount.toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Timeframe:</span>
                  <span className="text-sm">{opportunity.timeframe}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Pursue This Opportunity</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
