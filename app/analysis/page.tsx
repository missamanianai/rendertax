import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AnalysisPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Instead of fetching from Prisma, we'll use demo data
  const demoSessions = [
    {
      id: "demo-1",
      taxYear: 2023,
      transcriptType: "wage_income",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      taxYear: 2022,
      transcriptType: "account_transcript",
      status: "processing",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Analysis</h1>

      <div className="grid gap-6">
        {demoSessions.map((session) => (
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

        <div className="text-center py-6">
          <Button asChild>
            <Link href="/upload">Upload New Document</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
