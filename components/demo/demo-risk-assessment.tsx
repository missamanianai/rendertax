"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

// Sample risk assessment data
const riskFactors = [
  { factor: "Audit Risk", value: 42, description: "Moderate risk based on income and deductions" },
  { factor: "Penalty Risk", value: 28, description: "Low risk of penalties based on compliance history" },
  { factor: "Compliance Score", value: 85, description: "Good overall compliance with tax regulations" },
  { factor: "Documentation", value: 72, description: "Adequate documentation for most items" },
  { factor: "Consistency", value: 90, description: "High consistency across tax years" },
]

const riskRadarData = [
  { subject: "Audit Risk", A: 42, fullMark: 100 },
  { subject: "Penalty Risk", A: 28, fullMark: 100 },
  { subject: "Documentation", A: 72, fullMark: 100 },
  { subject: "Consistency", A: 90, fullMark: 100 },
  { subject: "Complexity", A: 65, fullMark: 100 },
]

const auditTriggerData = [
  { name: "High Income", score: 15, threshold: 25 },
  { name: "Business Income", score: 10, threshold: 20 },
  { name: "Large Deductions", score: 12, threshold: 20 },
  { name: "Cash Transactions", score: 5, threshold: 15 },
  { name: "Prior Audits", score: 0, threshold: 20 },
]

export function DemoRiskAssessment() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Risk Assessment Overview</CardTitle>
          <CardDescription>Comprehensive analysis of tax compliance risks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Risk Profile" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Factors</CardTitle>
          <CardDescription>Detailed breakdown of risk components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {riskFactors.map((factor) => (
              <div key={factor.factor} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{factor.factor}</span>
                  <span className="text-sm font-medium">{factor.value}%</span>
                </div>
                <Progress value={factor.value} className="h-2" />
                <p className="text-sm text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Triggers</CardTitle>
          <CardDescription>Factors that may trigger an IRS audit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditTriggerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Your Score" fill="#8884d8" />
                <Bar dataKey="threshold" name="Risk Threshold" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
