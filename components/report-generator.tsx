"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, Mail, Printer, Share2, FileBarChart, CheckCircle2, Loader2 } from "lucide-react"

export function ReportGenerator({ analysisId }: { analysisId: string }) {
  const [reportFormat, setReportFormat] = useState("pdf")
  const [includeOptions, setIncludeOptions] = useState({
    executiveSummary: true,
    detailedFindings: true,
    actionPlan: true,
    visualizations: true,
    supportingDocuments: false,
    technicalAppendix: false,
  })
  const [customBranding, setCustomBranding] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      setIsGenerated(true)
    }, 3000)
  }

  const handleSendEmail = () => {
    // Implementation would send the report via email
    alert(`Report would be sent to ${recipientEmail}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Professional Report</CardTitle>
        <CardDescription>Create a customized report based on analysis #{analysisId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="report-format">Report Format</Label>
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger id="report-format">
                <SelectValue placeholder="Select report format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="docx">Word Document</SelectItem>
                <SelectItem value="html">Web Page</SelectItem>
                <SelectItem value="pptx">PowerPoint Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Include in Report</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-summary"
                  checked={includeOptions.executiveSummary}
                  onCheckedChange={(checked) => setIncludeOptions({ ...includeOptions, executiveSummary: !!checked })}
                />
                <Label htmlFor="include-summary">Executive Summary</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-findings"
                  checked={includeOptions.detailedFindings}
                  onCheckedChange={(checked) => setIncludeOptions({ ...includeOptions, detailedFindings: !!checked })}
                />
                <Label htmlFor="include-findings">Detailed Findings</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-action"
                  checked={includeOptions.actionPlan}
                  onCheckedChange={(checked) => setIncludeOptions({ ...includeOptions, actionPlan: !!checked })}
                />
                <Label htmlFor="include-action">Action Plan</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-viz"
                  checked={includeOptions.visualizations}
                  onCheckedChange={(checked) => setIncludeOptions({ ...includeOptions, visualizations: !!checked })}
                />
                <Label htmlFor="include-viz">Visualizations</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-docs"
                  checked={includeOptions.supportingDocuments}
                  onCheckedChange={(checked) =>
                    setIncludeOptions({ ...includeOptions, supportingDocuments: !!checked })
                  }
                />
                <Label htmlFor="include-docs">Supporting Documents</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-tech"
                  checked={includeOptions.technicalAppendix}
                  onCheckedChange={(checked) => setIncludeOptions({ ...includeOptions, technicalAppendix: !!checked })}
                />
                <Label htmlFor="include-tech">Technical Appendix</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-branding"
              checked={customBranding}
              onCheckedChange={(checked) => setCustomBranding(!!checked)}
            />
            <Label htmlFor="custom-branding">Include custom branding and letterhead</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email (Optional)</Label>
            <Input
              id="recipient-email"
              placeholder="Enter email address"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes">Additional Notes</Label>
            <Textarea
              id="additional-notes"
              placeholder="Enter any additional notes or instructions"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} disabled={isGenerating || isGenerated}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : isGenerated ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Generated
              </>
            ) : (
              <>
                <FileBarChart className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>

          {isGenerated && (
            <>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button variant="outline" disabled={!recipientEmail} onClick={handleSendEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send via Email
              </Button>

              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>

              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </>
          )}
        </div>

        {isGenerated && (
          <div className="w-full pt-4 border-t">
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Report successfully generated
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your report has been generated and is ready for download or sharing.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
