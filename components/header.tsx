"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Render Tax</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"}
                >
                  Dashboard
                </Link>
                <Link href="/upload" className={pathname === "/upload" ? "text-foreground" : "text-foreground/60"}>
                  Upload
                </Link>
                <Link href="/analysis" className={pathname === "/analysis" ? "text-foreground" : "text-foreground/60"}>
                  Analysis
                </Link>
                <Link href="/results" className={pathname === "/results" ? "text-foreground" : "text-foreground/60"}>
                  Results
                </Link>
              </>
            ) : (
              <>
                <Link href="/demo" className={pathname === "/demo" ? "text-foreground" : "text-foreground/60"}>
                  Demo
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm text-muted-foreground">{session.user?.name || session.user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : pathname !== "/login" && pathname !== "/register" ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
