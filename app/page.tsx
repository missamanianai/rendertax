import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Automate Tax Refund Recovery</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Identify missing refunds and actionable discrepancies through IRS transcript analysis
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
