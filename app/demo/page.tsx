import { DemoAnalysisDashboard } from "@/components/demo/demo-analysis-dashboard"
import { DemoComparison } from "@/components/demo/demo-comparison"
import { DemoRefundOpportunities } from "@/components/demo/demo-refund-opportunities"
import { DemoRiskAssessment } from "@/components/demo/demo-risk-assessment"
import { DemoTimeline } from "@/components/demo/demo-timeline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Render Tax Demo</h1>
          <p className="text-muted-foreground mt-1">Interactive demonstration of the Render Tax analysis platform</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="opportunities">Refund Opportunities</TabsTrigger>
          <TabsTrigger value="comparison">Tax Comparison</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="timeline">Action Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DemoAnalysisDashboard />
        </TabsContent>

        <TabsContent value="opportunities">
          <DemoRefundOpportunities />
        </TabsContent>

        <TabsContent value="comparison">
          <DemoComparison />
        </TabsContent>

        <TabsContent value="risk">
          <DemoRiskAssessment />
        </TabsContent>

        <TabsContent value="timeline">
          <DemoTimeline />
        </TabsContent>
      </Tabs>
    </div>
  )
}
