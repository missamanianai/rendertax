import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { FileUploadForm } from "@/components/file-upload-form"

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>
      <div className="max-w-2xl mx-auto">
        <FileUploadForm />
      </div>
    </div>
  )
}
