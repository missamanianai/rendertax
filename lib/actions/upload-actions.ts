"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PDFTranscriptParser } from "@/lib/analysis/pdf-parser"

export async function uploadTranscript(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return { error: "Unauthorized" }
    }

    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    if (file.type !== "application/pdf") {
      return { error: "Only PDF files are supported" }
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse the transcript
    const parsedData = await PDFTranscriptParser.parseTranscript(buffer)

    // In a real implementation, we would save this to the database
    // For now, we'll just return success
    return {
      success: true,
      sessionId: "demo-1",
      message: "File processed successfully. In demo mode, data is not saved to the database.",
    }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to process transcript" }
  }
}
