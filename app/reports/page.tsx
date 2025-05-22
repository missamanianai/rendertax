import { ReportGenerator } from "@/components/report-generator"

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Professional Report Generation</h1>
      <p className="text-muted-foreground mb-8">
        Generate customized professional reports based on your tax analysis results.
      </p>

      <ReportGenerator analysisId="A-1234" />
    </div>
  )
}
