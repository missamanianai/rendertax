import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Mail, Printer } from "lucide-react"

export const metadata: Metadata = {
  title: "Analysis Results | Render Tax",
  description: "Your tax transcript analysis results",
}

export default function ResultsPage() {
  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
          <p className="mt-2 text-muted-foreground">
            We've identified potential refund opportunities in your transcripts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Overview of findings from your transcript analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Tax Years Analyzed</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-500">2</div>
              <div className="text-sm text-muted-foreground">Potential Discrepancies</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-500">$1,250</div>
              <div className="text-sm text-muted-foreground">Estimated Potential Refund</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="discrepancies">
        <TabsList className="mb-4">
          <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
          <TabsTrigger value="events">Actionable Events</TabsTrigger>
          <TabsTrigger value="all">All Findings</TabsTrigger>
        </TabsList>

        <TabsContent value="discrepancies">
          <Card>
            <CardHeader>
              <CardTitle>Potential Discrepancies</CardTitle>
              <CardDescription>Differences between reported income and IRS records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">Unreported 1099-MISC Income</div>
                      <div className="text-sm text-muted-foreground">Tax Year 2021</div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                      Discrepancy
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    A 1099-MISC for $750 from "ABC Consulting" appears in your Wage & Income transcript but was not
                    included on your tax return.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">Potential Impact:</div>
                    <div className="text-destructive">-$150</div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">Missing Education Credit</div>
                      <div className="text-sm text-muted-foreground">Tax Year 2022</div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Opportunity
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    A 1098-T from "State University" for $4,500 appears in your Wage & Income transcript, but no
                    education credit was claimed on your return.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">Potential Impact:</div>
                    <div className="text-green-600">+$1,000</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Actionable Events</CardTitle>
              <CardDescription>IRS transaction codes that may require action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">Undelivered Refund (Code 740)</div>
                      <div className="text-sm text-muted-foreground">Tax Year 2020</div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      Action Required
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    The IRS attempted to issue a refund of $400 but it was returned as undeliverable. This may be due to
                    an incorrect address on file.
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">Potential Recovery:</div>
                    <div className="text-green-600">+$400</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Findings</CardTitle>
              <CardDescription>Complete list of all analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Tax Year
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Issue Type
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Description
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Impact
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">2020</td>
                      <td className="px-4 py-3">Event</td>
                      <td className="px-4 py-3">Undelivered Refund (Code 740)</td>
                      <td className="px-4 py-3 text-green-600">+$400</td>
                      <td className="px-4 py-3">File Form 8822</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">2021</td>
                      <td className="px-4 py-3">Discrepancy</td>
                      <td className="px-4 py-3">Unreported 1099-MISC Income</td>
                      <td className="px-4 py-3 text-destructive">-$150</td>
                      <td className="px-4 py-3">File 1040X</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">2022</td>
                      <td className="px-4 py-3">Discrepancy</td>
                      <td className="px-4 py-3">Missing Education Credit</td>
                      <td className="px-4 py-3 text-green-600">+$1,000</td>
                      <td className="px-4 py-3">File 1040X</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
              <Button>Take Action</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/">Start New Analysis</Link>
        </Button>
      </div>
    </div>
  )
}
