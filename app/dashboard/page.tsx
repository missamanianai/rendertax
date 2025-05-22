import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  ArrowUpRight,
  Download,
  FileBarChart,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // This would come from your API in a real implementation
  const clientStats = {
    totalClients: 124,
    activeAnalyses: 8,
    completedAnalyses: 87,
    pendingReviews: 12,
    totalRefundOpportunities: 187650,
    averageRefundAmount: 2158,
    highPriorityFindings: 23,
    expiringOpportunities: 7,
  }

  // Recent analyses would come from your API
  const recentAnalyses = [
    {
      id: "A-1234",
      clientName: "John Smith",
      date: "2023-05-15",
      status: "completed",
      refundAmount: 3245.0,
      findings: 4,
    },
    {
      id: "A-1235",
      clientName: "Sarah Johnson",
      date: "2023-05-14",
      status: "completed",
      refundAmount: 1872.5,
      findings: 2,
    },
    {
      id: "A-1236",
      clientName: "Michael Brown",
      date: "2023-05-14",
      status: "in_progress",
      refundAmount: 0,
      findings: 0,
    },
    {
      id: "A-1237",
      clientName: "Emily Davis",
      date: "2023-05-13",
      status: "completed",
      refundAmount: 4125.75,
      findings: 5,
    },
    {
      id: "A-1238",
      clientName: "Robert Wilson",
      date: "2023-05-12",
      status: "completed",
      refundAmount: 950.25,
      findings: 1,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tax Analysis Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
          <Button>
            <FileBarChart className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Refund Opportunities</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${clientStats.totalRefundOpportunities.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg. ${clientStats.averageRefundAmount.toLocaleString()} per client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Analyses</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.activeAnalyses}</div>
            <p className="text-xs text-muted-foreground">{clientStats.completedAnalyses} completed analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Priority Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.highPriorityFindings}</div>
            <p className="text-xs text-muted-foreground">{clientStats.pendingReviews} pending reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Opportunities</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.expiringOpportunities}</div>
            <p className="text-xs text-muted-foreground">Statute expiring within 90 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Analyses</TabsTrigger>
          <TabsTrigger value="high-value">High Value Opportunities</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>View and manage your most recent tax transcript analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">ID</th>
                      <th className="pb-2 text-left font-medium">Client</th>
                      <th className="pb-2 text-left font-medium">Date</th>
                      <th className="pb-2 text-left font-medium">Status</th>
                      <th className="pb-2 text-left font-medium">Findings</th>
                      <th className="pb-2 text-right font-medium">Potential Refund</th>
                      <th className="pb-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAnalyses.map((analysis) => (
                      <tr key={analysis.id} className="border-b">
                        <td className="py-3">{analysis.id}</td>
                        <td className="py-3">{analysis.clientName}</td>
                        <td className="py-3">{analysis.date}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              analysis.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {analysis.status === "completed" ? "Completed" : "In Progress"}
                          </span>
                        </td>
                        <td className="py-3">{analysis.findings}</td>
                        <td className="py-3 text-right">
                          {analysis.status === "completed" ? `$${analysis.refundAmount.toLocaleString()}` : "-"}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/analysis/${analysis.id}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </Button>
                            {analysis.status === "completed" && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-value" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>High Value Opportunities</CardTitle>
              <CardDescription>Refund opportunities with the highest potential value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">High value opportunities will appear here</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Opportunities</CardTitle>
              <CardDescription>Opportunities with approaching statute of limitations deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">Expiring opportunities will appear here</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
