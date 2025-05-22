import type { Metadata } from "next"
import ClientInfoForm from "@/components/client-info-form"

export const metadata: Metadata = {
  title: "Client Information | Render Tax",
  description: "Enter client information for tax refund analysis",
}

export default function ClientInfoPage({
  searchParams,
}: {
  searchParams: { files?: string }
}) {
  const fileIds = searchParams.files ? searchParams.files.split(",") : []

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Client Information</h1>
        <p className="mt-2 text-muted-foreground">
          Enter client details to customize the analysis for their tax situation.
        </p>
      </div>
      <ClientInfoForm fileIds={fileIds} />
    </div>
  )
}
