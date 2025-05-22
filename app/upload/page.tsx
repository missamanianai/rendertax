"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { Steps, Step } from "@/components/ui/steps"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("walkthrough")
  const [activeStep, setActiveStep] = useState(0)
  const [files, setFiles] = useState<{
    wageIncome?: File
    recordOfAccount?: File
  }>({})
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleFileUpload = (type: "wageIncome" | "recordOfAccount", file: File) => {
    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }))
  }

  const handleAnalyze = async () => {
    setIsUploading(true)

    // Simulate upload and processing
    setTimeout(() => {
      setIsUploading(false)
      router.push("/analysis")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Upload Transcripts</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
          <TabsTrigger value="upload">Upload Transcripts</TabsTrigger>
        </TabsList>

        <TabsContent value="walkthrough">
          <Card>
            <CardHeader>
              <CardTitle>Transcript Analysis Walkthrough</CardTitle>
              <CardDescription>
                Learn how to use the Render Tax Analysis Engine to identify refund opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Steps value={activeStep} onChange={setActiveStep} className="mb-8">
                <Step title="Obtain IRS Transcripts">
                  <div className="space-y-4 mt-4">
                    <p>To begin the analysis process, you'll need to obtain two types of IRS transcripts:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Wage & Income Transcript</strong> - Shows all reported income including W-2s, 1099s, and
                        other income documents
                      </li>
                      <li>
                        <strong>Record of Account Transcript</strong> - Shows tax return data and account activity
                      </li>
                    </ul>
                    <p>These can be obtained from the IRS through:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>IRS.gov website (Get Transcript Online)</li>
                      <li>IRS Form 4506-T</li>
                      <li>IRS Transcript Phone Line: 800-908-9946</li>
                    </ul>
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Demo Mode</AlertTitle>
                      <AlertDescription>
                        For this demo, we'll provide sample transcripts that you can use to test the system.
                      </AlertDescription>
                    </Alert>
                  </div>
                </Step>
                <Step title="Upload Transcripts">
                  <div className="space-y-4 mt-4">
                    <p>Once you have your transcripts, upload them to our secure system:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Upload the Wage & Income Transcript PDF</li>
                      <li>Upload the Record of Account Transcript PDF</li>
                      <li>Ensure files are in PDF format and under 10MB each</li>
                    </ul>
                    <p>
                      Our system uses advanced OCR technology to extract data from your transcripts securely. All data
                      is encrypted and processed in compliance with IRS regulations.
                    </p>
                  </div>
                </Step>
                <Step title="Analysis Process">
                  <div className="space-y-4 mt-4">
                    <p>Once uploaded, our system performs a comprehensive analysis:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Income Discrepancy Analysis</strong> - Compares reported income to filed income
                      </li>
                      <li>
                        <strong>Withholding Analysis</strong> - Identifies missed withholding credits
                      </li>
                      <li>
                        <strong>Deduction Analysis</strong> - Finds potential missed deductions
                      </li>
                      <li>
                        <strong>Credit Analysis</strong> - Identifies eligible tax credits
                      </li>
                      <li>
                        <strong>Event Analysis</strong> - Examines IRS account events for refund opportunities
                      </li>
                    </ul>
                    <p>
                      The analysis typically takes 1-2 minutes to complete, depending on the complexity of the
                      transcripts.
                    </p>
                  </div>
                </Step>
                <Step title="Review Findings">
                  <div className="space-y-4 mt-4">
                    <p>After analysis, you'll receive a detailed report of findings:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Summary of potential refund opportunities</li>
                      <li>Detailed explanation of each finding</li>
                      <li>Recommended actions to take</li>
                      <li>Tax impact calculations</li>
                      <li>Statute of limitations information</li>
                    </ul>
                    <p>
                      You can export the findings as a PDF report, save them for later review, or share them with
                      clients.
                    </p>
                    <div className="flex items-center p-4 bg-green-50 rounded-lg mt-4">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      <p className="text-green-700">
                        On average, our system identifies $1,200 in refund opportunities per analysis!
                      </p>
                    </div>
                  </div>
                </Step>
              </Steps>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  Previous Step
                </Button>
                {activeStep < 3 ? (
                  <Button onClick={() => setActiveStep(Math.min(3, activeStep + 1))}>Next Step</Button>
                ) : (
                  <Button onClick={() => setActiveTab("upload")}>
                    Start Upload <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload IRS Transcripts</CardTitle>
              <CardDescription>
                Upload your Wage & Income and Record of Account transcripts to begin analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Wage & Income Transcript</h3>
                <FileUploader
                  onFileSelected={(file) => handleFileUpload("wageIncome", file)}
                  acceptedFileTypes=".pdf"
                  maxSize={10}
                  file={files.wageIncome}
                />
                <p className="text-sm text-gray-500 mt-1">For demo purposes, you can upload any PDF file</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Record of Account Transcript</h3>
                <FileUploader
                  onFileSelected={(file) => handleFileUpload("recordOfAccount", file)}
                  acceptedFileTypes=".pdf"
                  maxSize={10}
                  file={files.recordOfAccount}
                />
                <p className="text-sm text-gray-500 mt-1">For demo purposes, you can upload any PDF file</p>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Demo Mode</AlertTitle>
                <AlertDescription>
                  In this demo, any PDF files will be accepted. In the production version, files are validated for
                  authenticity.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAnalyze}
                disabled={isUploading || !files.wageIncome || !files.recordOfAccount}
                className="ml-auto"
              >
                {isUploading ? "Analyzing..." : "Run Analysis"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
