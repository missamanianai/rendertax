"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/auth/logout-button"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Render Tax
        </Link>

        <nav className="flex items-center gap-6">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
              <Link href="/upload" className="text-sm font-medium hover:underline">
                Upload
              </Link>
              <Link href="/analyses" className="text-sm font-medium hover:underline">
                Analyses
              </Link>
              <LogoutButton variant="outline" />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
