import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get user's analysis sessions
  const analysisSessions = await prisma.analysisSession.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Analysis</h1>

      {analysisSessions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Analysis Sessions Found</h2>
          <p className="text-muted-foreground mb-6">Upload IRS transcripts to begin analyzing your tax data</p>
          <Button asChild>
            <Link href="/upload">Upload Documents</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {analysisSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>Tax Year {session.taxYear}</CardTitle>
                <CardDescription>
                  {session.transcriptType === "wage_income"
                    ? "Wage and Income Transcript"
                    : session.transcriptType === "account_transcript"
                      ? "Account Transcript"
                      : session.transcriptType === "record_account"
                        ? "Record of Account Transcript"
                        : "IRS Transcript"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm">
                      {session.status === "processing" ? (
                        <span className="text-yellow-500">Processing</span>
                      ) : session.status === "completed" ? (
                        <span className="text-green-500">Completed</span>
                      ) : (
                        <span className="text-red-500">Error</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm">{new Date(session.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/results?sessionId=${session.id}`}>View Results</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
