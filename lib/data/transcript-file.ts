import { db } from "@/lib/db"
import type { ValidationError, ValidationWarning } from "@prisma/client"

export type CreateTranscriptFileInput = {
  analysisSessionId: string
  fileName: string
  fileUrl: string
  fileSize: number
  transcriptType: string
  taxYear?: number | null
  processingStatus?: string
}

export type ValidationErrorInput = Omit<ValidationError, "id" | "transcriptFileId">
export type ValidationWarningInput = Omit<ValidationWarning, "id" | "transcriptFileId">

export async function createTranscriptFile(
  input: CreateTranscriptFileInput,
  validationErrors: ValidationErrorInput[] = [],
  validationWarnings: ValidationWarningInput[] = [],
) {
  try {
    return await db.transcriptFile.create({
      data: {
        analysisSessionId: input.analysisSessionId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        transcriptType: input.transcriptType,
        taxYear: input.taxYear,
        processingStatus: input.processingStatus || "pending",
        validationErrors: {
          createMany: {
            data: validationErrors,
          },
        },
        validationWarnings: {
          createMany: {
            data: validationWarnings,
          },
        },
      },
      include: {
        validationErrors: true,
        validationWarnings: true,
      },
    })
  } catch (error) {
    console.error("Failed to create transcript file:", error)
    throw new Error("Failed to create transcript file")
  }
}

export async function getTranscriptFileById(id: string) {
  try {
    return await db.transcriptFile.findUnique({
      where: { id },
      include: {
        validationErrors: true,
        validationWarnings: true,
      },
    })
  } catch (error) {
    console.error("Failed to get transcript file:", error)
    return null
  }
}

export async function updateTranscriptFile(
  id: string,
  data: Partial<CreateTranscriptFileInput>,
  validationErrors?: ValidationErrorInput[],
  validationWarnings?: ValidationWarningInput[],
) {
  try {
    // Start a transaction
    return await db.$transaction(async (tx) => {
      // Update the file
      const file = await tx.transcriptFile.update({
        where: { id },
        data,
      })

      // If validation errors are provided, delete existing ones and create new ones
      if (validationErrors) {
        await tx.validationError.deleteMany({
          where: { transcriptFileId: id },
        })

        if (validationErrors.length > 0) {
          await tx.validationError.createMany({
            data: validationErrors.map((error) => ({
              ...error,
              transcriptFileId: id,
            })),
          })
        }
      }

      // If validation warnings are provided, delete existing ones and create new ones
      if (validationWarnings) {
        await tx.validationWarning.deleteMany({
          where: { transcriptFileId: id },
        })

        if (validationWarnings.length > 0) {
          await tx.validationWarning.createMany({
            data: validationWarnings.map((warning) => ({
              ...warning,
              transcriptFileId: id,
            })),
          })
        }
      }

      return file
    })
  } catch (error) {
    console.error("Failed to update transcript file:", error)
    throw new Error("Failed to update transcript file")
  }
}

export async function getSessionTranscriptFiles(analysisSessionId: string) {
  try {
    return await db.transcriptFile.findMany({
      where: { analysisSessionId },
      include: {
        validationErrors: true,
        validationWarnings: true,
      },
    })
  } catch (error) {
    console.error("Failed to get session transcript files:", error)
    return []
  }
}

export async function deleteTranscriptFile(id: string) {
  try {
    return await db.transcriptFile.delete({
      where: { id },
    })
  } catch (error) {
    console.error("Failed to delete transcript file:", error)
    throw new Error("Failed to delete transcript file")
  }
}
