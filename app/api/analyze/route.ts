import { type NextRequest, NextResponse } from "next/server"
import { AnalysisEngine } from "@/services/analysis-engine"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const wageIncomeFile = formData.get("wageIncome") as File
    const recordOfAccountFile = formData.get("recordOfAccount") as File
    const sessionId = formData.get("sessionId") as string

    if (!wageIncomeFile || !recordOfAccountFile || !sessionId) {
      return NextResponse.json({ error: "Missing required files or session ID" }, { status: 400 })
    }

    // Convert files to buffers
    const wageIncomeBuffer = Buffer.from(await wageIncomeFile.arrayBuffer())
    const recordOfAccountBuffer = Buffer.from(await recordOfAccountFile.arrayBuffer())

    // Initialize analysis engine
    const analysisEngine = new AnalysisEngine()

    // Run analysis
    const result = await analysisEngine.analyzeTranscripts(wageIncomeBuffer, recordOfAccountBuffer, sessionId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
