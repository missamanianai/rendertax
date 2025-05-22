import type { Metadata } from "next"
import FileUploadForm from "@/components/file-upload-form"

export const metadata: Metadata = {
  title: "Upload Transcripts | Render Tax",
  description: "Upload IRS transcripts for analysis and refund recovery",
}

export default function UploadPage() {
  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Transcripts</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your IRS transcripts to identify potential refund opportunities.
        </p>
      </div>
      <FileUploadForm />
    </div>
  )
}
