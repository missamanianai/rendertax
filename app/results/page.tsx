import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { sessionId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { sessionId } = searchParams

  if (!sessionId) {
    redirect("/analysis")
  }

  // Get analysis session
  const analysisSession = await prisma.analysisSession.findUnique({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
    include: {
      transcriptData: true,
    },
  })

  if (!analysisSession) {
    redirect("/analysis")
  }

  // Parse the transcript data
  const parsedData = analysisSession.transcriptData?.parsedData
    ? JSON.parse(analysisSession.transcriptData.parsedData as string)
    : null

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <Button asChild variant="outline">
          <Link href="/analysis">Back to Analysis</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tax Year {analysisSession.taxYear}</CardTitle>
          <CardDescription>
            {analysisSession.transcriptType === "wage_income"
              ? "Wage and Income Transcript"
              : analysisSession.transcriptType === "account_transcript"
                ? "Account Transcript"
                : analysisSession.transcriptType === "record_account"
                  ? "Record of Account Transcript"
                  : "IRS Transcript"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm">
                {analysisSession.status === "processing" ? (
                  <span className="text-yellow-500">Processing</span>
                ) : analysisSession.status === "completed" ? (
                  <span className="text-green-500">Completed</span>
                ) : (
                  <span className="text-red-500">Error</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm">{new Date(analysisSession.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>Overview of analysis findings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Analysis results will appear here once processing is complete.</p>
                {analysisSession.status === "processing" && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Analysis in progress...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of findings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Detailed analysis will appear here once processing is complete.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggested actions based on analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Recommendations will appear here once processing is complete.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Action Timeline</CardTitle>
              <CardDescription>Recommended timeline for actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Timeline will appear here once processing is complete.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
