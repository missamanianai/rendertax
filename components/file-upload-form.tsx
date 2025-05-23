"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadTranscript } from "@/lib/actions/upload-actions"

export function FileUploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsUploading(true)

    if (!file) {
      setError("Please select a file to upload")
      setIsUploading(false)
      return
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported")
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await uploadTranscript(formData)

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/analysis")
        }, 2000)
      }
    } catch (error) {
      setError("An error occurred while uploading the file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload IRS Transcript</CardTitle>
        <CardDescription>Upload your IRS transcript PDF file for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>File uploaded successfully! Redirecting to analysis...</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="transcript">Transcript File</Label>
              <Input id="transcript" type="file" accept=".pdf" onChange={handleFileChange} disabled={isUploading} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isUploading || !file}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="text-sm text-muted-foreground">
          <p className="font-semibold">Supported file types:</p>
          <ul className="list-disc list-inside">
            <li>IRS Account Transcript (PDF)</li>
            <li>IRS Wage and Income Transcript (PDF)</li>
            <li>IRS Record of Account Transcript (PDF)</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}
