"use client"

import type React from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

type SessionProviderProps = {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
