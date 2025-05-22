import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | Render Tax",
  description: "Login to your Render Tax account",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string; error?: string; timeout?: string }
}) {
  const registered = searchParams.registered === "true"
  const error = searchParams.error
  const timeout = searchParams.timeout === "true"

  return (
    <div className="container flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>
        <LoginForm registered={registered} error={error} timeout={timeout} />
        <p className="px-8 text-center text-sm text-muted-foreground">
          New to Render Tax?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
