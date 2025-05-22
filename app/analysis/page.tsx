import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAnalysisSessionById } from "@/lib/data/analysis-session"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Analysis | Render Tax",
  description: "Analyzing tax transcripts for refund opportunities",
}

interface AnalysisPageProps {
  searchParams: {
    sessionId?: string
  }
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analysis</h1>
        <p className="mt-2 text-muted-foreground">Analyzing your transcripts for potential refund opportunities.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Analysis in Progress</h2>
            <p className="text-muted-foreground mb-8">
              We're analyzing your transcripts for potential refund opportunities. This may take a few moments.
            </p>

            <div className="flex justify-center">
              <Button asChild>
                <Link href={`/results?sessionId=${sessionId}`}>View Results (Demo)</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
