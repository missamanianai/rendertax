import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, PieChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard | Render Tax",
  description: "Render Tax dashboard",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {session.user?.name || session.user?.email}</h1>
          <p className="text-muted-foreground mt-1">Manage your tax transcript analyses</p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Analyses</CardTitle>
            <CardDescription>Your most recent transcript analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">No recent analyses</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/upload">Start your first analysis</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Potential Refunds</CardTitle>
            <CardDescription>Estimated refund opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <PieChart className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">No refund data available</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/upload">Upload transcripts to analyze</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account Type:</span>
                <span className="text-sm font-medium">{session.user?.role || "Tax Professional"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{session.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member Since:</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
