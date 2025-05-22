"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, X } from "lucide-react"

const clientInfoSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  maritalStatus: z.enum(["SINGLE", "MARRIED_FILING_JOINTLY", "MARRIED_FILING_SEPARATELY", "HEAD_OF_HOUSEHOLD"]),
})

type ClientInfoFormValues = z.infer<typeof clientInfoSchema>

interface Dependent {
  id: string
  name: string
  dateOfBirth: string
}

interface ClientInfoFormProps {
  fileIds: string[]
}

export default function ClientInfoForm({ fileIds }: ClientInfoFormProps) {
  const router = useRouter()
  const [dependents, setDependents] = useState<Dependent[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClientInfoFormValues>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      maritalStatus: "SINGLE",
    },
  })

  const addDependent = () => {
    setDependents([
      ...dependents,
      {
        id: `dep-${Date.now()}`,
        name: "",
        dateOfBirth: "",
      },
    ])
  }

  const removeDependent = (id: string) => {
    setDependents(dependents.filter((dep) => dep.id !== id))
  }

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(dependents.map((dep) => (dep.id === id ? { ...dep, [field]: value } : dep)))
  }

  const onSubmit = async (values: ClientInfoFormValues) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would send this data to your backend
      console.log("Form values:", values)
      console.log("Dependents:", dependents)
      console.log("File IDs:", fileIds)

      // Navigate to analysis page
      router.push("/analysis")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SINGLE">Single</SelectItem>
                            <SelectItem value="MARRIED_FILING_JOINTLY">Married Filing Jointly</SelectItem>
                            <SelectItem value="MARRIED_FILING_SEPARATELY">Married Filing Separately</SelectItem>
                            <SelectItem value="HEAD_OF_HOUSEHOLD">Head of Household</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Dependents (Optional)</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addDependent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dependent
                  </Button>
                </div>

                {dependents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No dependents added.</p>
                ) : (
                  <div className="space-y-4">
                    {dependents.map((dependent) => (
                      <div key={dependent.id} className="flex items-start gap-4 p-4 border rounded-md">
                        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <FormLabel htmlFor={`${dependent.id}-name`}>Name</FormLabel>
                            <Input
                              id={`${dependent.id}-name`}
                              value={dependent.name}
                              onChange={(e) => updateDependent(dependent.id, "name", e.target.value)}
                              placeholder="Dependent's name"
                            />
                          </div>
                          <div>
                            <FormLabel htmlFor={`${dependent.id}-dob`}>Date of Birth</FormLabel>
                            <Input
                              id={`${dependent.id}-dob`}
                              type="date"
                              value={dependent.dateOfBirth}
                              onChange={(e) => updateDependent(dependent.id, "dateOfBirth", e.target.value)}
                            />
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDependent(dependent.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Run Analysis"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
