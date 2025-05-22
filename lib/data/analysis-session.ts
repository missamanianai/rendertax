import { db } from "@/lib/db"
import type { Dependent } from "@prisma/client"

export type CreateAnalysisSessionInput = {
  userId: string
}

export type UpdateAnalysisSessionInput = {
  clientFirstName?: string
  clientLastName?: string
  clientDateOfBirth?: Date
  maritalStatus?: string
  status?: string
  dependents?: Omit<Dependent, "id" | "analysisSessionId">[]
}

export async function createAnalysisSession(input: CreateAnalysisSessionInput) {
  try {
    return await db.analysisSession.create({
      data: {
        userId: input.userId,
        status: "pending",
      },
    })
  } catch (error) {
    console.error("Failed to create analysis session:", error)
    throw new Error("Failed to create analysis session")
  }
}

export async function getAnalysisSessionById(id: string) {
  try {
    return await db.analysisSession.findUnique({
      where: { id },
      include: {
        transcriptFiles: {
          include: {
            validationErrors: true,
            validationWarnings: true,
          },
        },
        dependents: true,
      },
    })
  } catch (error) {
    console.error("Failed to get analysis session:", error)
    return null
  }
}

export async function updateAnalysisSession(id: string, input: UpdateAnalysisSessionInput) {
  try {
    const { dependents, ...sessionData } = input

    // Update the session
    const session = await db.analysisSession.update({
      where: { id },
      data: sessionData,
    })

    // If dependents are provided, delete existing ones and create new ones
    if (dependents) {
      // Delete existing dependents
      await db.dependent.deleteMany({
        where: { analysisSessionId: id },
      })

      // Create new dependents
      if (dependents.length > 0) {
        await db.dependent.createMany({
          data: dependents.map((dependent) => ({
            ...dependent,
            analysisSessionId: id,
          })),
        })
      }
    }

    return session
  } catch (error) {
    console.error("Failed to update analysis session:", error)
    throw new Error("Failed to update analysis session")
  }
}

export async function getUserAnalysisSessions(userId: string) {
  try {
    return await db.analysisSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        transcriptFiles: true,
        analysisResults: {
          select: {
            issueType: true,
            potentialImpact: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Failed to get user analysis sessions:", error)
    return []
  }
}

export async function deleteAnalysisSession(id: string) {
  try {
    return await db.analysisSession.delete({
      where: { id },
    })
  } catch (error) {
    console.error("Failed to delete analysis session:", error)
    throw new Error("Failed to delete analysis session")
  }
}
