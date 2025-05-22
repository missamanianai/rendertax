"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validateTranscript } from "@/lib/validation/transcript-validator"
import { extractTranscriptMetadata } from "@/lib/utils/transcript-parser"
import { createAnalysisSession } from "@/lib/data/analysis-session"
import { createTranscriptFile } from "@/lib/data/transcript-file"

export async function createUploadSession() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Unauthorized")
    }

    // Create a new analysis session
    const analysisSession = await createAnalysisSession({
      userId: session.user.id,
    })

    return {
      success: true,
      sessionId: analysisSession.id,
    }
  } catch (error) {
    console.error("Error creating upload session:", error)
    return {
      success: false,
      error: "Failed to create upload session",
    }
  }
}

export async function uploadTranscript(file: File, analysisSessionId: string, onProgress?: (progress: number) => void) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Unauthorized")
    }

    // Upload file to Vercel Blob
    const blob = await put(`transcripts/${session.user.id}/${Date.now()}-${file.name}`, file, {
      access: "private",
      handleUploadUrl: "/api/upload-handler",
    })

    // Extract metadata from the PDF (tax year, transcript type)
    const metadata = await extractTranscriptMetadata(blob.url)

    // Validate the transcript
    const validationResult = await validateTranscript(blob.url, metadata)

    // Map validation errors and warnings to database format
    const validationErrors = validationResult.errors.map((error) => ({
      type: error.type,
      message: error.message,
    }))

    const validationWarnings = validationResult.warnings.map((warning) => ({
      type: warning.type,
      message: warning.message,
    }))

    // Create transcript file record in database
    const transcriptFile = await createTranscriptFile(
      {
        analysisSessionId,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        transcriptType: metadata.transcriptType || "unknown",
        taxYear: metadata.taxYear,
        processingStatus: "processed",
      },
      validationErrors,
      validationWarnings,
    )

    // Revalidate the upload page
    revalidatePath("/upload")

    return {
      success: true,
      file: {
        id: transcriptFile.id,
        fileName: transcriptFile.fileName,
        fileUrl: transcriptFile.fileUrl,
        fileSize: transcriptFile.fileSize,
        transcriptType: transcriptFile.transcriptType,
        taxYear: transcriptFile.taxYear,
        processingStatus: transcriptFile.processingStatus,
        validationErrors: transcriptFile.validationErrors,
        validationWarnings: transcriptFile.validationWarnings,
      },
    }
  } catch (error) {
    console.error("Error uploading transcript:", error)
    return {
      success: false,
      error: "Failed to upload transcript",
    }
  }
}
