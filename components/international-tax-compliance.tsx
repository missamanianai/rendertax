"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InternationalTaxCompliance() {
  const [activeTab, setActiveTab] = useState("fbar")
  const [hasAccounts, setHasAccounts] = useState(false)
  const [maxBalance, setMaxBalance] = useState("")
  const [accountCount, setAccountCount] = useState("1")
  const [complianceResult, setComplianceResult] = useState<null | {
    required: boolean
    deadline: string
    penalty: string
    recommendation: string
  }>(null)

  const checkCompliance = () => {
    if (!hasAccounts) {
      setComplianceResult({
        required: false,
        deadline: "N/A",
        penalty: "N/A",
        recommendation: "No filing requirement identified.",
      })
      return
    }

    const balance = Number.parseFloat(maxBalance || "0")

    if (activeTab === "fbar") {
      setComplianceResult({
        required: balance >= 10000,
        deadline: "April 15, 2024 (with automatic extension to October 15)",
        penalty:
          balance >= 10000
            ? "Non-willful: up to $10,000 per violation\nWillful: greater of $100,000 or 50% of account balance"
            : "N/A",
        recommendation:
          balance >= 10000
            ? "File FinCEN Form 114 (FBAR) by the deadline. Consider Streamlined Filing Compliance Procedures if you have unfiled prior years."
            : "No FBAR filing required as maximum aggregate balance is below $10,000 threshold.",
      })
    } else if (activeTab === "fatca") {
      // Simplified FATCA logic - would be more complex in real implementation
      const filingThreshold = 50000 // Simplified threshold
      setComplianceResult({
        required: balance >= filingThreshold,
        deadline: "Tax return due date (including extensions)",
        penalty:
          balance >= filingThreshold
            ? "$10,000 initial penalty, additional penalties for continued non-compliance"
            : "N/A",
        recommendation:
          balance >= filingThreshold
            ? "File Form 8938 with your tax return. Ensure all foreign financial assets are properly reported."
            : "No Form 8938 filing required as foreign financial assets are below the filing threshold.",
      })
    } else if (activeTab === "pfic") {
      setComplianceResult({
        required: hasAccounts,
        deadline: "Tax return due date (including extensions)",
        penalty: "Excess distribution taxation plus interest charges",
        recommendation:
          "Determine if foreign investments qualify as PFICs. If so, consider making a QEF or MTM election to avoid excess distribution tax treatment.",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>International Tax Compliance Analyzer</CardTitle>
        <CardDescription>Determine your international tax reporting requirements</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fbar">FBAR</TabsTrigger>
            <TabsTrigger value="fatca">FATCA (Form 8938)</TabsTrigger>
            <TabsTrigger value="pfic">PFIC (Form 8621)</TabsTrigger>
          </TabsList>

          <TabsContent value="fbar" className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                The FBAR (FinCEN Form 114) must be filed if you have a financial interest in or signature authority over
                foreign financial accounts with an aggregate value exceeding $10,000 at any time during the calendar
                year.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-accounts"
                  checked={hasAccounts}
                  onCheckedChange={(checked) => setHasAccounts(checked as boolean)}
                />
                <Label htmlFor="has-accounts">I have financial accounts outside the United States</Label>
              </div>

              {hasAccounts && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-balance">Maximum aggregate balance during the year ($)</Label>
                      <Input
                        id="max-balance"
                        placeholder="Enter maximum balance"
                        value={maxBalance}
                        onChange={(e) => setMaxBalance(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-count">Number of foreign accounts</Label>
                      <Select value={accountCount} onValueChange={setAccountCount}>
                        <SelectTrigger id="account-count">
                          <SelectValue placeholder="Select number of accounts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2-5">2-5</SelectItem>
                          <SelectItem value="6-10">6-10</SelectItem>
                          <SelectItem value="11+">11 or more</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fatca" className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Form 8938 (FATCA) requires U.S. taxpayers to report specified foreign financial assets if the total
                value exceeds certain thresholds. These thresholds vary based on filing status and residence.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-accounts-fatca"
                  checked={hasAccounts}
                  onCheckedChange={(checked) => setHasAccounts(checked as boolean)}
                />
                <Label htmlFor="has-accounts-fatca">I have specified foreign financial assets</Label>
              </div>

              {hasAccounts && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-balance-fatca">Total value of foreign financial assets ($)</Label>
                      <Input
                        id="max-balance-fatca"
                        placeholder="Enter total value"
                        value={maxBalance}
                        onChange={(e) => setMaxBalance(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filing-status">Filing Status</Label>
                      <Select defaultValue="single">
                        <SelectTrigger id="filing-status">
                          <SelectValue placeholder="Select filing status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                          <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                          <SelectItem value="head_household">Head of Household</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pfic" className="space-y-4 mt-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Passive Foreign Investment Companies (PFICs) include foreign mutual funds, ETFs, and certain foreign
                corporations. U.S. taxpayers with PFIC investments must file Form 8621 and may face complex tax
                calculations.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-pfic"
                  checked={hasAccounts}
                  onCheckedChange={(checked) => setHasAccounts(checked as boolean)}
                />
                <Label htmlFor="has-pfic">
                  I have investments in foreign mutual funds, ETFs, or investment companies
                </Label>
              </div>

              {hasAccounts && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pfic-value">Total value of PFIC investments ($)</Label>
                      <Input
                        id="pfic-value"
                        placeholder="Enter total value"
                        value={maxBalance}
                        onChange={(e) => setMaxBalance(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pfic-type">Type of Foreign Investment</Label>
                      <Select defaultValue="mutual_fund">
                        <SelectTrigger id="pfic-type">
                          <SelectValue placeholder="Select investment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mutual_fund">Foreign Mutual Fund</SelectItem>
                          <SelectItem value="etf">Foreign ETF</SelectItem>
                          <SelectItem value="holding_company">Foreign Holding Company</SelectItem>
                          <SelectItem value="startup">Foreign Startup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button onClick={checkCompliance}>Check Compliance Requirements</Button>

        {complianceResult && (
          <Alert className="mt-4 w-full">
            <AlertTitle className="flex items-center">
              {complianceResult.required ? (
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              )}
              {complianceResult.required ? "Filing Required" : "No Filing Required"}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Deadline:</span> {complianceResult.deadline}
                </div>
                <div>
                  <span className="font-semibold">Potential Penalties:</span> {complianceResult.penalty}
                </div>
                <div>
                  <span className="font-semibold">Recommendation:</span> {complianceResult.recommendation}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}
