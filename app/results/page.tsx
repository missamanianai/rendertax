import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAnalysisSessionById } from "@/lib/data/analysis-session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Download, Printer, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Analysis Results | Render Tax",
  description: "Tax refund recovery analysis results",
}

interface ResultsPageProps {
  searchParams: {
    sessionId?: string
  }
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { sessionId } = searchParams

  if (!sessionId) {
    redirect("/upload")
  }

  // Verify the session exists and belongs to the user
  const analysisSession = await getAnalysisSessionById(sessionId)

  if (!analysisSession || analysisSession.userId !== session.user.id) {
    redirect("/upload")
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
          <p className="mt-2 text-muted-foreground">
            Review potential refund opportunities identified in your transcripts.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Client</h3>
                <p className="text-muted-foreground">
                  {analysisSession.clientFirstName || "John"} {analysisSession.clientLastName || "Doe"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Analysis Date</h3>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">Files Analyzed</h3>
                <p className="text-muted-foreground">{analysisSession.transcriptFiles.length} transcripts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Potential Refund Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Results table will be implemented here.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/upload">New Analysis</Link>
        </Button>
      </div>
    </div>
  )
}
