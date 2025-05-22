import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"

export default function ScenarioBuilderPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">What-If Scenario Builder</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tax Scenario Builder</CardTitle>
          <CardDescription>Create and compare different tax scenarios to optimize your tax strategy</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-center text-gray-500 max-w-md mb-6">
            The What-If Scenario Builder is currently under development. This feature will allow you to create and
            compare different tax scenarios.
          </p>
          <Button>Try Tax Calculator Instead</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feature Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Create multiple tax scenarios with different income, deductions, and credits</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Compare scenarios side-by-side to see tax implications</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Visualize tax impact with interactive charts</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Save scenarios for future reference</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Evaluate the tax impact of a job change or income increase</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Analyze different retirement contribution strategies</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Compare standard vs. itemized deductions</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Plan for major life events (marriage, children, home purchase)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
