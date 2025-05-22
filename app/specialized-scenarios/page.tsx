import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InternationalTaxCompliance } from "@/components/international-tax-compliance"
import { BusinessStructureAnalyzer } from "@/components/business-structure-analyzer"

export default function SpecializedScenariosPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Specialized Tax Scenarios</h1>

      <Tabs defaultValue="international" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="international">International Tax Compliance</TabsTrigger>
          <TabsTrigger value="business">Business Structure Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="international" className="mt-6">
          <InternationalTaxCompliance />
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <BusinessStructureAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
