import { handleUpload } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle the file upload
    const response = await handleUpload({
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate file type
        if (!pathname.endsWith(".pdf")) {
          throw new Error("Only PDF files are allowed")
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optional: Log the upload or store metadata in database
        console.log("Upload completed:", blob)
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Upload handler error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 })
  }
}
