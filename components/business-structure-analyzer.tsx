"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Calculator } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BusinessStructureAnalyzer() {
  const [entityType, setEntityType] = useState("s_corp")
  const [revenue, setRevenue] = useState("250000")
  const [ownerCount, setOwnerCount] = useState("1")
  const [ownershipPercentage, setOwnershipPercentage] = useState([100])
  const [ownerSalary, setOwnerSalary] = useState("75000")
  const [distributions, setDistributions] = useState("50000")
  const [isActive, setIsActive] = useState(true)

  const [analysisResult, setAnalysisResult] = useState<null | {
    taxSavings: number
    risks: string[]
    recommendations: string[]
    complianceIssues: string[]
  }>(null)

  const handleOwnershipChange = (value: number[]) => {
    setOwnershipPercentage(value)
  }

  const analyzeStructure = () => {
    const revenueNum = Number.parseFloat(revenue)
    const ownerSalaryNum = Number.parseFloat(ownerSalary)
    const distributionsNum = Number.parseFloat(distributions)

    // This is a simplified analysis - a real implementation would be much more complex
    if (entityType === "s_corp") {
      // S-Corp analysis
      const reasonableCompensation = revenueNum * 0.3 // Simplified calculation
      const selfEmploymentTaxSavings = distributionsNum * 0.153 // 15.3% SE tax savings on distributions

      const risks = []
      if (ownerSalaryNum < reasonableCompensation) {
        risks.push("Owner salary appears below reasonable compensation standards")
      }

      if (distributionsNum > ownerSalaryNum * 2) {
        risks.push("Distribution to salary ratio may trigger IRS scrutiny")
      }

      setAnalysisResult({
        taxSavings: selfEmploymentTaxSavings,
        risks,
        recommendations: [
          "Maintain reasonable compensation documentation",
          "Consider retirement plan contributions to reduce taxable income",
          "Ensure all shareholders receive distributions proportional to ownership",
        ],
        complianceIssues: [
          "Annual Form 1120S filing required",
          "Schedule K-1 must be provided to each shareholder",
          "Maintain single class of stock requirement",
        ],
      })
    } else if (entityType === "llc") {
      // LLC analysis
      const selfEmploymentTax = (revenueNum - distributionsNum) * 0.153

      setAnalysisResult({
        taxSavings: 0, // Baseline for comparison
        risks: [
          "All profits subject to self-employment tax for single-member LLC",
          "Limited liability protection may be pierced if business and personal finances are mixed",
        ],
        recommendations: [
          "Consider S-Corp election to potentially reduce self-employment taxes",
          "Maintain separate business bank accounts and records",
          "Create and maintain an operating agreement",
        ],
        complianceIssues: [
          "Single-member LLC reports on Schedule C of Form 1040",
          "Multi-member LLC must file Form 1065 and issue Schedule K-1s",
          "State annual reports and fees may apply",
        ],
      })
    } else if (entityType === "partnership") {
      // Partnership analysis
      setAnalysisResult({
        taxSavings: 0,
        risks: [
          "Partners have joint and several liability for partnership obligations",
          "All partnership income subject to self-employment tax for general partners",
          "Special allocations must have substantial economic effect",
        ],
        recommendations: [
          "Create and maintain a comprehensive partnership agreement",
          "Consider special allocations of income and losses if appropriate",
          "Document partner capital accounts properly",
        ],
        complianceIssues: [
          "Annual Form 1065 filing required",
          "Schedule K-1 must be provided to each partner",
          "Section 704(b) capital account maintenance required",
        ],
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Business Structure Analyzer</CardTitle>
        <CardDescription>Analyze tax implications of your business structure</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="entity-type">Entity Type</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger id="entity-type">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s_corp">S Corporation</SelectItem>
                <SelectItem value="llc">Limited Liability Company</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="c_corp">C Corporation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Business Revenue ($)</Label>
              <Input
                id="revenue"
                placeholder="Enter annual revenue"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-count">Number of Owners</Label>
              <Select value={ownerCount} onValueChange={setOwnerCount}>
                <SelectTrigger id="owner-count">
                  <SelectValue placeholder="Select number of owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3-5">3-5</SelectItem>
                  <SelectItem value="6+">6 or more</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {entityType === "s_corp" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="owner-salary">Owner-Employee Annual Salary ($)</Label>
                <Input
                  id="owner-salary"
                  placeholder="Enter owner salary"
                  value={ownerSalary}
                  onChange={(e) => setOwnerSalary(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distributions">Annual Distributions ($)</Label>
                <Input
                  id="distributions"
                  placeholder="Enter distributions"
                  value={distributions}
                  onChange={(e) => setDistributions(e.target.value)}
                />
              </div>
            </>
          )}

          {(entityType === "partnership" || ownerCount !== "1") && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Primary Owner's Ownership Percentage</Label>
                <span>{ownershipPercentage[0]}%</span>
              </div>
              <Slider
                defaultValue={[100]}
                max={100}
                step={1}
                value={ownershipPercentage}
                onValueChange={handleOwnershipChange}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch id="active-participation" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="active-participation">Owner actively participates in business operations</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button onClick={analyzeStructure}>
          <Calculator className="mr-2 h-4 w-4" />
          Analyze Business Structure
        </Button>

        {analysisResult && (
          <div className="mt-6 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Potential Tax Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analysisResult.taxSavings.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisResult.risks.length === 0 ? "Low" : analysisResult.risks.length === 1 ? "Medium" : "High"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisResult.complianceIssues.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Compliance Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisResult.complianceIssues.map((issue, index) => (
                      <li key={index} className="text-sm">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {analysisResult.risks.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Potential Risks Identified</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {analysisResult.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
