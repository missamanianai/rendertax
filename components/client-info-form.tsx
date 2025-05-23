"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ClientInfoForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      setError("An error occurred while saving client information")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
        <CardDescription>Enter client details to improve analysis accuracy</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>Client information saved successfully! Redirecting...</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" disabled={isSubmitting} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled={isSubmitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" disabled={isSubmitting} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="AK">Alaska</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  {/* Add more states as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filingStatus">Filing Status</Label>
              <Select disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="marriedJoint">Married Filing Jointly</SelectItem>
                  <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                  <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                  <SelectItem value="qualifyingWidow">Qualifying Widow(er)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dependents">Number of Dependents</Label>
              <Input id="dependents" type="number" min="0" disabled={isSubmitting} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Information"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
