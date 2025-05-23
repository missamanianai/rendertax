import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Render Tax
        </h1>
        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          Automated Tax Refund Recovery through IRS transcript analysis
        </p>
      </div>

      <div className="flex gap-4 mt-8">
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
    </div>
  )
}
