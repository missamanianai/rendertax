import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function EducationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Tax Education Center</h1>

      <Tabs defaultValue="basics" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basics">Tax Basics</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="planning">Tax Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Tax Basics</CardTitle>
              <CardDescription>Learn the fundamental concepts of taxation</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Adjusted Gross Income (AGI)?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      Adjusted Gross Income (AGI) is your total gross income minus specific deductions. It's a key
                      figure used to determine your eligibility for certain tax benefits.
                    </p>
                    <p className="mb-2">
                      <strong>AGI includes:</strong> Wages, salaries, tips, interest, dividends, business income,
                      retirement income, and other income.
                    </p>
                    <p>
                      <strong>Common adjustments to income:</strong> Student loan interest, self-employment tax, health
                      savings account contributions, and retirement account contributions.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What's the difference between marginal and effective tax rates?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      <strong>Marginal Tax Rate:</strong> The tax rate applied to your last dollar of income. The U.S.
                      has a progressive tax system with different tax brackets. As your income increases, you move into
                      higher tax brackets, but only the income within each bracket is taxed at that bracket's rate.
                    </p>
                    <p>
                      <strong>Effective Tax Rate:</strong> Your total tax divided by your total taxable income. This
                      represents the average rate you pay across all your income and is typically lower than your
                      marginal rate.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How do tax brackets work?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The U.S. uses a progressive tax system with seven federal income tax brackets. For 2023, these
                      brackets are 10%, 12%, 22%, 24%, 32%, 35%, and 37%.
                    </p>
                    <p className="mb-2">
                      <strong>Example:</strong> If you're a single filer with $50,000 in taxable income in 2023:
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>The first $11,000 is taxed at 10% = $1,100</li>
                      <li>The next $33,725 ($11,001 to $44,725) is taxed at 12% = $4,047</li>
                      <li>The final $5,275 ($44,726 to $50,000) is taxed at 22% = $1,160.50</li>
                      <li>Total tax = $6,307.50</li>
                    </ul>
                    <p>
                      Your marginal tax rate would be 22%, but your effective tax rate would be about 12.6% ($6,307.50 ÷
                      $50,000).
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle>Tax Deductions</CardTitle>
              <CardDescription>Learn about various tax deductions available to taxpayers</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Standard vs. Itemized Deductions</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      <strong>Standard Deduction:</strong> A fixed amount that reduces your taxable income, based on
                      your filing status. For 2023, the standard deduction is:
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>Single: $13,850</li>
                      <li>Married Filing Jointly: $27,700</li>
                      <li>Head of Household: $20,800</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Itemized Deductions:</strong> Specific expenses you can deduct, including:
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>State and local taxes (capped at $10,000)</li>
                      <li>Mortgage interest</li>
                      <li>Charitable contributions</li>
                      <li>Medical expenses (exceeding 7.5% of AGI)</li>
                    </ul>
                    <p>
                      You should choose whichever gives you the larger deduction. Most taxpayers take the standard
                      deduction, but if your itemized deductions exceed the standard deduction amount, itemizing will
                      save you more in taxes.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Mortgage Interest Deduction</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The mortgage interest deduction allows homeowners to deduct interest paid on mortgage debt used to
                      buy, build, or substantially improve a primary or secondary home.
                    </p>
                    <p className="mb-2">
                      <strong>Current Limits:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>
                        You can deduct interest on up to $750,000 of qualified residence loans (for loans taken out
                        after December 15, 2017)
                      </li>
                      <li>For loans taken out before December 15, 2017, the limit is $1 million</li>
                      <li>
                        Home equity loan interest is only deductible if the loan was used to buy, build, or
                        substantially improve the home that secures the loan
                      </li>
                    </ul>
                    <p>To claim this deduction, you must itemize deductions on your tax return.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Tax Credits</CardTitle>
              <CardDescription>Learn about various tax credits available to taxpayers</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Child Tax Credit</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The Child Tax Credit helps families with qualifying children offset the cost of raising children.
                    </p>
                    <p className="mb-2">
                      <strong>For 2023:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>Up to $2,000 per qualifying child under age 17</li>
                      <li>Up to $1,600 is refundable as the Additional Child Tax Credit</li>
                      <li>Begins to phase out when AGI exceeds $200,000 ($400,000 for married filing jointly)</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Qualifying Child Requirements:</strong>
                    </p>
                    <ul className="list-disc pl-6">
                      <li>Must be under age 17 at the end of the tax year</li>
                      <li>Must be your dependent</li>
                      <li>Must have a valid Social Security number</li>
                      <li>Must be a U.S. citizen, U.S. national, or U.S. resident alien</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Earned Income Tax Credit (EITC)</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      The EITC is a refundable tax credit for low to moderate-income working individuals and couples,
                      particularly those with children.
                    </p>
                    <p className="mb-2">
                      <strong>For 2023, maximum credit amounts:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>$7,430 with three or more qualifying children</li>
                      <li>$6,604 with two qualifying children</li>
                      <li>$3,995 with one qualifying child</li>
                      <li>$560 with no qualifying children</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Key Features:</strong>
                    </p>
                    <ul className="list-disc pl-6">
                      <li>Refundable credit (you can receive it even if you owe no tax)</li>
                      <li>Has income limits that vary based on filing status and number of children</li>
                      <li>Designed with a phase-in range, plateau range, and phase-out range</li>
                      <li>Must have earned income to qualify</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>Tax Planning</CardTitle>
              <CardDescription>Learn about tax planning strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Year-End Tax Planning Strategies</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      <strong>Income Timing:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>Defer income to next year if you expect to be in a lower tax bracket</li>
                      <li>Accelerate income into current year if you expect to be in a higher tax bracket next year</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Deduction Timing:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>Consider "bunching" itemized deductions in alternating years</li>
                      <li>Accelerate charitable contributions in high-income years</li>
                      <li>Prepay deductible expenses in the current year if beneficial</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Tax-Loss Harvesting:</strong>
                    </p>
                    <ul className="list-disc pl-6">
                      <li>Sell investments with losses to offset capital gains</li>
                      <li>Can offset up to $3,000 of ordinary income after offsetting capital gains</li>
                      <li>Avoid wash sale rules by waiting 30 days before buying substantially identical securities</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Retirement Tax Planning</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">
                      <strong>Roth Conversion Strategy:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>Convert traditional IRA/401(k) assets to Roth in lower-income years</li>
                      <li>Pay taxes now at a potentially lower rate for tax-free growth and withdrawals later</li>
                      <li>Consider partial conversions to manage tax brackets</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Required Minimum Distributions (RMDs):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-2">
                      <li>Begin at age 73 (as of 2023) for traditional IRAs and 401(k)s</li>
                      <li>Consider qualified charitable distributions (QCDs) to satisfy RMDs tax-free</li>
                      <li>Plan withdrawals strategically to minimize lifetime tax burden</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
