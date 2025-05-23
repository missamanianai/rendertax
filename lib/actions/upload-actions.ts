"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

    // Create analysis session
    const analysisSession = await prisma.analysisSession.create({
      data: {
        userId: session.user.id,
        taxYear: parsedData.taxYear,
        transcriptType: parsedData.metadata.transcriptType || "unknown",
        status: "processing",
        metadata: {
          taxpayerName: parsedData.metadata.taxpayerName || "",
          lastFourSSN: parsedData.metadata.lastFourSSN || "",
        },
      },
    })

    // Store the raw transcript data
    await prisma.transcriptData.create({
      data: {
        sessionId: analysisSession.id,
        rawData: parsedData.rawText,
        parsedData: JSON.stringify(parsedData),
      },
    })

    return { success: true, sessionId: analysisSession.id }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to process transcript" }
  }
}
