import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Analysis | Render Tax",
  description: "Analyzing your tax transcripts",
}

export default function AnalysisPage() {
  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analysis in Progress</h1>
        <p className="mt-2 text-muted-foreground">
          We're analyzing your transcripts to identify potential refund opportunities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Your Transcripts</CardTitle>
          <CardDescription>This may take up to 30 seconds</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <div className="text-center max-w-md">
            <p className="mb-4">
              Our system is analyzing your transcripts for discrepancies and actionable events that could lead to
              potential tax refunds.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll be automatically redirected to the results page when the analysis is complete.
            </p>
          </div>

          <div className="mt-8">
            <Button asChild>
              <Link href="/results">View Demo Results</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
