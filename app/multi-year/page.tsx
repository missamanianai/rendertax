import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers } from "lucide-react"

export default function MultiYearPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Multi-Year Tax Projections</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Multi-Year Tax Planning</CardTitle>
          <CardDescription>Project tax liability across multiple years for comprehensive tax planning</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Layers className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-center text-gray-500 max-w-md">
            The Multi-Year Projection tool is currently under development. This feature will allow you to project and
            plan your tax liability across multiple years.
          </p>
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
                <span>Project tax liability for up to 5 years in the future</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Account for anticipated income changes, life events, and tax law changes</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Visualize projected tax liability with interactive charts</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Identify optimal timing for major financial decisions</span>
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
                <span>Retirement planning and RMD optimization</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Roth conversion strategy planning</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Business growth and income planning</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">•</span>
                <span>Education funding and 529 plan optimization</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
