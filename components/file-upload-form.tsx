"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Upload, File, AlertCircle, CheckCircle, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createUploadSession, uploadTranscript } from "@/lib/actions/upload-actions"
import type { TranscriptFile } from "@/lib/types"

export default function FileUploadForm() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [files, setFiles] = useState<TranscriptFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize the upload session
  useEffect(() => {
    async function initSession() {
      try {
        const result = await createUploadSession()
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId)
        } else {
          setError("Failed to initialize upload session. Please try again.")
        }
      } catch (err) {
        console.error("Session initialization error:", err)
        setError("Failed to initialize upload session. Please try again.")
      } finally {
        setIsInitializing(false)
      }
    }

    initSession()
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!sessionId) {
        setError("Upload session not initialized. Please refresh the page.")
        return
      }

      // Reset error state
      setError(null)

      // Check if adding these files would exceed the 6 file limit
      if (files.length + acceptedFiles.length > 6) {
        setError("Maximum 6 files allowed for analysis")
        return
      }

      // Validate file types and sizes
      const invalidFiles = acceptedFiles.filter((file) => {
        const isPDF = file.type === "application/pdf"
        const isUnderSizeLimit = file.size <= 10 * 1024 * 1024 // 10MB
        return !isPDF || !isUnderSizeLimit
      })

      if (invalidFiles.length > 0) {
        setError("Only PDF files under 10MB are accepted")
        return
      }

      setUploading(true)

      // Process each file
      for (const file of acceptedFiles) {
        try {
          // Initialize progress for this file
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

          // Upload file to Vercel Blob and create database record
          const result = await uploadTranscript(file, sessionId, (progress) => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: progress }))
          })

          if (!result.success) {
            throw new Error(result.error || "Upload failed")
          }

          // Add the file to our state
          setFiles((prev) => [...prev, result.file])
        } catch (err) {
          console.error("Upload error:", err)
          setError("Failed to upload file. Please try again.")
        }
      }

      setUploading(false)
    },
    [files, sessionId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    disabled: uploading || files.length >= 6 || !sessionId,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId))
  }

  const hasErrors = files.some((file) => file.validationErrors.length > 0)
  const canContinue = files.length > 0 && !hasErrors && !uploading && sessionId !== null

  const handleContinue = () => {
    if (sessionId) {
      // Navigate to client information page
      router.push(`/client-info?sessionId=${sessionId}`)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Initializing upload session...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } ${uploading || files.length >= 6 || !sessionId ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Drag & drop your transcripts here</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Upload up to 6 IRS transcripts (PDF only, 10MB max per file)
          </p>
          <Button variant="secondary" className="mt-2" disabled={uploading || files.length >= 6 || !sessionId}>
            Browse Files
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Transcripts ({files.length}/6)</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <File className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.fileName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{(file.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                          {file.transcriptType !== "unknown" && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="capitalize">{file.transcriptType.replace(/_/g, " ")}</span>
                            </>
                          )}
                          {file.taxYear && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Tax Year {file.taxYear}</span>
                            </>
                          )}
                        </div>

                        {/* Validation Results */}
                        {file.processingStatus === "processed" && (
                          <div className="mt-2">
                            {file.validationErrors.length > 0 && (
                              <div className="text-destructive text-sm mt-1">
                                <span className="font-semibold">Errors: </span>
                                {file.validationErrors.map((error, i) => (
                                  <span key={i} className="block ml-4">
                                    • {error.message}
                                  </span>
                                ))}
                              </div>
                            )}
                            {file.validationWarnings.length > 0 && (
                              <div className="text-amber-500 text-sm mt-1">
                                <span className="font-semibold">Warnings: </span>
                                {file.validationWarnings.map((warning, i) => (
                                  <span key={i} className="block ml-4">
                                    • {warning.message}
                                  </span>
                                ))}
                              </div>
                            )}
                            {file.validationErrors.length === 0 && file.validationWarnings.length === 0 && (
                              <div className="text-green-600 text-sm mt-1 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span>File validated successfully</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} disabled={uploading}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress[file.fileName] !== undefined && uploadProgress[file.fileName] < 100 && (
                    <div className="mt-3">
                      <Progress value={uploadProgress[file.fileName]} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Uploading: {uploadProgress[file.fileName]}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleContinue} disabled={!canContinue} className="flex items-center">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
