"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/utils/helpers"
import { DownloadIcon, PrinterIcon, MailIcon } from "lucide-react"

interface AnalysisResultProps {
  result: any // Using any for simplicity, would use AnalysisResult type in production
  clientName: string
}

export function AnalysisResult({ result, clientName }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState("summary")

  const handleExportPDF = () => {
    // Implementation would use a PDF generation library
    alert("PDF export functionality would be implemented here")
  }

  const handleExportCSV = () => {
    // Implementation would generate and download a CSV file
    alert("CSV export functionality would be implemented here")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    // Implementation would open a sharing dialog
    alert("Email sharing functionality would be implemented here")
  }

  // Group findings by tax year
  const findingsByYear = result.findings.reduce((acc: any, finding: any) => {
    if (!acc[finding.statute.deadline.substring(0, 4)]) {
      acc[finding.statute.deadline.substring(0, 4)] = []
    }
    acc[finding.statute.deadline.substring(0, 4)].push(finding)
    return acc
  }, {})

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Analysis Results for {clientName}</CardTitle>
            <CardDescription>
              {result.findings.length > 0
                ? `Found ${result.findings.length} potential refund opportunities`
                : "No refund opportunities found"}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <MailIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Detailed Findings</TabsTrigger>
            <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Potential Refund</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(result.totalPotentialRefund)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{result.confidence}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{result.findings.length}</div>
                  </CardContent>
                </Card>
              </div>

              {result.findings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finding Type</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead className="text-right">Potential Refund</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(
                      result.findings.reduce((acc: any, finding: any) => {
                        if (!acc[finding.type]) {
                          acc[finding.type] = {
                            count: 0,
                            refund: 0,
                          }
                        }
                        acc[finding.type].count++
                        acc[finding.type].refund += finding.potentialRefund
                        return acc
                      }, {}),
                    ).map(([type, data]: [string, any]) => (
                      <TableRow key={type}>
                        <TableCell className="font-medium capitalize">{type.replace(/_/g, " ")}</TableCell>
                        <TableCell>{data.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(data.refund)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No Issues Found</AlertTitle>
                  <AlertDescription>
                    We did not identify any refund opportunities in the provided transcripts.
                  </AlertDescription>
                </Alert>
              )}

              {result.warnings.length > 0 && (
                <Alert>
                  <AlertTitle>Analysis Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2">
                      {result.warnings.map((warning: any, index: number) => (
                        <li key={index}>{warning.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-6">
              {Object.entries(findingsByYear).map(([year, findings]: [string, any]) => (
                <div key={year} className="space-y-4">
                  <h3 className="text-lg font-semibold">Tax Year {year}</h3>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Finding</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead className="text-right">Potential Refund</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {findings.map((finding: any) => (
                        <TableRow key={finding.id}>
                          <TableCell className="font-medium">{finding.title}</TableCell>
                          <TableCell>{finding.description}</TableCell>
                          <TableCell className="capitalize">{finding.severity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(finding.potentialRefund)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}

              {result.findings.length === 0 && (
                <Alert>
                  <AlertTitle>No Issues Found</AlertTitle>
                  <AlertDescription>
                    We did not identify any refund opportunities in the provided transcripts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-6">
              {result.findings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finding</TableHead>
                      <TableHead>Action Required</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Potential Refund</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.findings.map((finding: any) => (
                      <TableRow key={finding.id}>
                        <TableCell className="font-medium">{finding.title}</TableCell>
                        <TableCell>{finding.actionRequired}</TableCell>
                        <TableCell>
                          {new Date(finding.statute.deadline).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {finding.statute.daysRemaining > 0
                              ? `${finding.statute.daysRemaining} days remaining`
                              : "Expired"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(finding.potentialRefund)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertTitle>No Actions Required</AlertTitle>
                  <AlertDescription>
                    No action items were identified based on the provided transcripts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Analysis completed in {(result.processingTime / 1000).toFixed(2)} seconds
        </div>
        <Button onClick={() => window.location.reload()}>New Analysis</Button>
      </CardFooter>
    </Card>
  )
}
