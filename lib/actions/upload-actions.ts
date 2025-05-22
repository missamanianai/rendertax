"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { validateTranscript } from "@/lib/validation/transcript-validator"
import type { TranscriptFile } from "@/lib/types"
import { extractTranscriptMetadata } from "@/lib/utils/transcript-parser"

export async function uploadTranscript(file: File, onProgress?: (progress: number) => void): Promise<TranscriptFile> {
  try {
    // Upload file to Vercel Blob
    const blob = await put(`transcripts/${Date.now()}-${file.name}`, file, {
      access: "private",
      handleUploadUrl: "/api/upload-handler",
    })

    // Extract metadata from the PDF (tax year, transcript type)
    const metadata = await extractTranscriptMetadata(blob.url)

    // Validate the transcript
    const validationResult = await validateTranscript(blob.url, metadata)

    // Create transcript file record
    const transcriptFile: TranscriptFile = {
      id: blob.url, // Using the blob URL as the ID for simplicity
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
      transcriptType: metadata.transcriptType || "unknown",
      taxYear: metadata.taxYear || null,
      processingStatus: "processed",
      validationErrors: validationResult.errors || [],
      validationWarnings: validationResult.warnings || [],
    }

    // Revalidate the upload page
    revalidatePath("/upload")

    return transcriptFile
  } catch (error) {
    console.error("Error uploading transcript:", error)
    throw new Error("Failed to upload transcript")
  }
}
