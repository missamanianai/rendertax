import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/auth/session-provider"
import { SessionTimeout } from "@/components/auth/session-timeout"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Render Tax",
    template: "%s | Render Tax",
  },
  description: "Automated Tax Refund Recovery through IRS transcript analysis",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SessionTimeout />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
