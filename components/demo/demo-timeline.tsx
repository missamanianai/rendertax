"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

// Sample timeline data
const timelineItems = [
  {
    id: 1,
    action: "File First-Time Penalty Abatement Request",
    deadline: "June 15, 2024",
    importance: "critical",
    description: "Submit Form 843 for penalty abatement for tax year 2021",
    estimatedValue: 1200,
    daysRemaining: 24,
  },
  {
    id: 2,
    action: "File Amended Return for 2022",
    deadline: "July 30, 2024",
    importance: "high",
    description: "Submit Form 1040X to claim missed home office deduction",
    estimatedValue: 1800,
    daysRemaining: 69,
  },
  {
    id: 3,
    action: "Prepare Documentation for Education Credits",
    deadline: "September 15, 2024",
    importance: "medium",
    description: "Gather Form 1098-T and receipts for qualified education expenses",
    estimatedValue: 2400,
    daysRemaining: 116,
  },
  {
    id: 4,
    action: "Statute of Limitations Deadline for 2020",
    deadline: "April 15, 2025",
    importance: "critical",
    description: "Last day to claim refunds for 2020 tax year",
    estimatedValue: 0,
    daysRemaining: 328,
  },
]

// Chart data
const timelineChartData = [
  { name: "Jun 2024", value: 1200 },
  { name: "Jul 2024", value: 3000 },
  { name: "Aug 2024", value: 3000 },
  { name: "Sep 2024", value: 5400 },
  { name: "Oct 2024", value: 5400 },
  { name: "Nov 2024", value: 5400 },
  { name: "Dec 2024", value: 5400 },
  { name: "Jan 2025", value: 5400 },
  { name: "Feb 2025", value: 5400 },
  { name: "Mar 2025", value: 5400 },
  { name: "Apr 2025", value: 5400 },
]

export function DemoTimeline() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refund Recovery Timeline</CardTitle>
          <CardDescription>Projected refund recovery over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="stepAfter" dataKey="value" name="Cumulative Refund" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Action Items</h3>

        {timelineItems.map((item) => (
          <Card
            key={item.id}
            className={
              item.importance === "critical"
                ? "border-red-400"
                : item.importance === "high"
                  ? "border-yellow-400"
                  : "border-blue-400"
            }
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{item.action}</CardTitle>
                  <CardDescription>
                    Deadline: {item.deadline} ({item.daysRemaining} days remaining)
                  </CardDescription>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.importance === "critical"
                      ? "bg-red-100 text-red-800"
                      : item.importance === "high"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {item.importance.charAt(0).toUpperCase() + item.importance.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{item.description}</p>
                {item.estimatedValue > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estimated Value:</span>
                    <span className="text-sm font-bold text-green-600">${item.estimatedValue.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2">
                  <Button size="sm" className="w-full">
                    Take Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
