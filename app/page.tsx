import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calculator, FileText, Upload, BarChart2, Lightbulb, Layers, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Render Tax Analysis Engine</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced tax analysis and optimization platform for professionals
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" />
                Upload Transcripts
              </CardTitle>
              <CardDescription>Upload and analyze IRS transcripts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Upload Wage & Income and Record of Account transcripts to identify refund opportunities.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/upload">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-primary" />
                Tax Calculator
              </CardTitle>
              <CardDescription>Calculate tax liability</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Interactive tax calculator with comprehensive options for accurate tax estimation.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/tax-calculator-demo">
                  Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Analysis Results
              </CardTitle>
              <CardDescription>View analysis findings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Review detailed analysis results and potential refund opportunities.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/analysis">
                  View Results <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Advanced Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                What-If Scenarios
              </CardTitle>
              <CardDescription>Explore tax planning options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Build and compare different tax scenarios to optimize your tax strategy.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/scenario-builder">Explore Scenarios</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                Visualizations
              </CardTitle>
              <CardDescription>Interactive tax data charts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Visualize tax data with interactive charts and graphs for better insights.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/visualization">View Charts</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2 text-primary" />
                Multi-Year Projections
              </CardTitle>
              <CardDescription>Long-term tax planning</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Project tax liability across multiple years for comprehensive tax planning.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/multi-year">Create Projections</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
}
