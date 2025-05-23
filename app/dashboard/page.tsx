import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>Upload IRS transcripts for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Upload your tax documents to begin the analysis process.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/upload">Upload Documents</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Manage your client information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Update client details to improve analysis accuracy.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/client-info">Manage Client Info</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Analysis</CardTitle>
            <CardDescription>Review tax analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View detailed analysis of your tax documents.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/analysis">View Analysis</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>View detailed results and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review comprehensive findings and action items.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/results">View Results</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo</CardTitle>
            <CardDescription>Explore demo features</CardDescription>
          </CardHeader>
          <CardContent>
            <p>See example analysis with sample data.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/demo">View Demo</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
