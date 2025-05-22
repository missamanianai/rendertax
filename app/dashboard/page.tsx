import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { getUserAnalysisSessions } from "@/lib/data/analysis-session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard | Render Tax",
  description: "Render Tax dashboard",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get user's recent analysis sessions
  const analysisSessions = await getUserAnalysisSessions(session.user.id)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome, {session.user.name}</h1>
      <p className="text-muted-foreground mb-8">You are logged in as {session.user.email}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">New Analysis</CardTitle>
            <CardDescription>Upload IRS transcripts to identify potential refund opportunities.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/upload" className="flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                Start New Analysis
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent Analyses</CardTitle>
            <CardDescription>View your recent transcript analyses and results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysisSessions.length > 0 ? (
              analysisSessions.slice(0, 3).map((analysisSession) => (
                <div key={analysisSession.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {analysisSession.clientFirstName && analysisSession.clientLastName
                          ? `${analysisSession.clientFirstName} ${analysisSession.clientLastName}`
                          : "Unnamed Analysis"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(analysisSession.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/results?sessionId=${analysisSession.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">No recent analyses found.</p>
            )}
            {analysisSessions.length > 3 && (
              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link href="/analyses">View All</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Account Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/settings">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
