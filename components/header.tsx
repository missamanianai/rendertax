"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Render Tax
          </Link>
          {session && (
            <nav className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/upload" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Upload Transcripts
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <>
              <span className="text-sm hidden md:inline-block">{session.user?.name || session.user?.email}</span>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
