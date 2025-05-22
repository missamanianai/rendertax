import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAnalysisSessionById } from "@/lib/data/analysis-session"
import ClientInfoForm from "@/components/client-info-form"

export const metadata: Metadata = {
  title: "Client Information | Render Tax",
  description: "Enter client information for tax refund analysis",
}

interface ClientInfoPageProps {
  searchParams: {
    sessionId?: string
  }
}

export default async function ClientInfoPage({ searchParams }: ClientInfoPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { sessionId } = searchParams

  if (!sessionId) {
    redirect("/upload")
  }

  // Verify the session exists and belongs to the user
  const analysisSession = await getAnalysisSessionById(sessionId)

  if (!analysisSession || analysisSession.userId !== session.user.id) {
    redirect("/upload")
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Client Information</h1>
        <p className="mt-2 text-muted-foreground">
          Enter client details to customize the analysis for their tax situation.
        </p>
      </div>
      <ClientInfoForm sessionId={sessionId} />
    </div>
  )
}
