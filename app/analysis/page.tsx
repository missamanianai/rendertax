"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/helpers"
import { DownloadIcon, PrinterIcon, MailIcon, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Dummy client data
const clientData = {
  name: "John Smith",
  taxYear: 2022,
  filingStatus: "single",
  agi: 75000,
  findings: [
    {
      id: "f1",
      type: "income_discrepancy",
      severity: "high",
      title: "W-2 Income Discrepancy",
      description: "Reported income ($52,500) differs from filed amount ($50,000) by $2,500",
      potentialRefund: 550,
      actionRequired: "File amended return (Form 1040X)",
      confidence: "high",
      statute: {
        deadline: "2026-04-15",
        daysRemaining: 365,
        statuteType: "refund",
      },
    },
    {
      id: "f2",
      type: "withholding_discrepancy",
      severity: "medium",
      title: "Withholding Discrepancy",
      description: "Reported withholding ($7,200) differs from claimed amount ($6,800) by $400",
      potentialRefund: 400,
      actionRequired: "File amended return (Form 1040X) to claim additional withholding",
      confidence: "high",
      statute: {
        deadline: "2026-04-15",
        daysRemaining: 365,
        statuteType: "refund",
      },
    },
    {
      id: "f3",
      type: "penalty_abatement",
      severity: "medium",
      title: "Late Filing Penalty - Abatement Opportunity",
      description: "Penalty of $250 may be eligible for abatement",
      potentialRefund: 250,
      actionRequired: "Submit Form 843 for First-Time Penalty Abatement",
      confidence: "medium",
      statute: {
        deadline: "2025-04-15",
        daysRemaining: 180,
        statuteType: "assessment",
      },
    },
  ],
  totalPotentialRefund: 1200,
  confidence: "high",
  processingTime: 45,
}

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("summary")

  const handleExportPDF = () => {
    alert("PDF export functionality would be implemented here")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    alert("Email sharing functionality would be implemented here")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analysis Results for {clientData.name}</CardTitle>
              <CardDescription>
                {clientData.findings.length > 0
                  ? `Found ${clientData.findings.length} potential refund opportunities`
                  : "No refund opportunities found"}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                PDF
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
                      <div className="text-2xl font-bold">{formatCurrency(clientData.totalPotentialRefund)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold capitalize">{clientData.confidence}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{clientData.findings.length}</div>
                    </CardContent>
                  </Card>
                </div>

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
                      clientData.findings.reduce((acc: any, finding: any) => {
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

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Statute of Limitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.findings.map((finding) => (
                        <div key={finding.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{finding.title}</span>
                            <span>{new Date(finding.statute.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(finding.statute.daysRemaining / 365) * 100} className="h-2" />
                            <span className="text-xs text-gray-500">
                              {finding.statute.daysRemaining} days remaining
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-6">
                {clientData.findings.map((finding) => (
                  <Card key={finding.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {finding.title}
                            <Badge
                              variant={
                                finding.severity === "high"
                                  ? "destructive"
                                  : finding.severity === "medium"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {finding.severity}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{finding.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(finding.potentialRefund)}</div>
                          <div className="text-xs text-gray-500">Potential Refund</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Action Required</div>
                          <div>{finding.actionRequired}</div>
                        </div>
                        <div>
                          <div className="font-medium">Confidence</div>
                          <div className="capitalize">{finding.confidence}</div>
                        </div>
                        <div>
                          <div className="font-medium">Deadline</div>
                          <div>
                            {new Date(finding.statute.deadline).toLocaleDateString()} ({finding.statute.daysRemaining}{" "}
                            days)
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      File Amended Return (Form 1040X)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        Based on our analysis, we recommend filing an amended return (Form 1040X) to address the
                        following issues:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>
                          <strong>W-2 Income Discrepancy</strong> - Correct reported income from $50,000 to $52,500
                        </li>
                        <li>
                          <strong>Withholding Discrepancy</strong> - Claim additional withholding of $400
                        </li>
                      </ul>
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-blue-700 text-sm">Deadline: April 15, 2026 (365 days remaining)</p>
                      </div>
                      <div className="flex items-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-700 text-sm">Potential Refund: {formatCurrency(950)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Generate Form 1040X</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Submit Penalty Abatement Request (Form 843)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>We recommend submitting a penalty abatement request for the following:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>
                          <strong>Late Filing Penalty</strong> - $250 penalty may be eligible for First-Time Penalty
                          Abatement
                        </li>
                      </ul>
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-blue-700 text-sm">Deadline: April 15, 2025 (180 days remaining)</p>
                      </div>
                      <div className="flex items-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-700 text-sm">Potential Refund: {formatCurrency(250)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Generate Form 843</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Analysis completed in {(clientData.processingTime / 1000).toFixed(2)} seconds
          </div>
          <Button onClick={() => (window.location.href = "/upload")}>New Analysis</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
