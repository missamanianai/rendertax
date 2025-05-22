"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleLogout = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: "/" })
  }

  return (
    <Button variant={variant} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      Sign Out
    </Button>
  )
}
