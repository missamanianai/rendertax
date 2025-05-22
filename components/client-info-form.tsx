"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface ClientInfoFormProps {
  sessionId: string
}

export default function ClientInfoForm({ sessionId }: ClientInfoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // This would normally update the analysis session with client info
    // For now, we'll just redirect to the next step

    setTimeout(() => {
      router.push(`/analysis?sessionId=${sessionId}`)
    }, 1000)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Client information form will be implemented here.</p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="flex items-center">
            Continue to Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
