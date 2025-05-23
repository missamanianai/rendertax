import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ClientInfoForm } from "@/components/client-info-form"

export default async function ClientInfoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Client Information</h1>
      <div className="max-w-2xl mx-auto">
        <ClientInfoForm />
      </div>
    </div>
  )
}
