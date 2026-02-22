import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Calculator, Wallet, Briefcase, CalendarDays, FileText, HelpCircle } from 'lucide-react';

const sections = [
  {
    id: "what-is-tax",
    icon: HelpCircle,
    title: "What is Tax and Why Do I Pay It?",
    content: `Tax is a mandatory payment to the government. In Nigeria, taxes fund public infrastructure like roads, hospitals, schools, and security. The Federal Inland Revenue Service (FIRS) collects federal taxes, while each state has its own Internal Revenue Service (IRS) for state taxes.

As a Nigerian citizen or resident earning income, you are required by law to pay taxes. Don't worry - the system includes reliefs and allowances that reduce what you actually owe.`
  },
  {
    id: "pit",
    icon: Calculator,
    title: "Personal Income Tax (PIT) Explained",
    content: `Personal Income Tax is what you pay on your annual income. Nigeria uses a graduated (progressive) tax system, which means different portions of your income are taxed at different rates:

- First ₦300,000: 7%
- Next ₦300,000: 11%
- Next ₦500,000: 15%
- Next ₦500,000: 19%
- Next ₦1,600,000: 21%
- Above ₦3,200,000: 24%

This means if you earn ₦5,000,000, only the amount above ₦3,200,000 is taxed at 24%. The rest is taxed at lower rates. This is fairer than a flat tax.

There's also a minimum tax of 1% of your gross income. If your calculated tax is less than this, you pay the minimum tax instead.`
  },
  {
    id: "cra",
    icon: FileText,
    title: "What is CRA (Consolidated Relief Allowance)?",
    content: `CRA is the government's way of reducing your tax burden. Before calculating your tax, a portion of your income is removed (relieved) from taxation.

CRA = Higher of (₦200,000 OR 1% of Gross Income) + 20% of Gross Income

For example, if your gross income is ₦5,000,000:
- 1% of ₦5,000,000 = ₦50,000
- Higher of ₦200,000 or ₦50,000 = ₦200,000
- 20% of ₦5,000,000 = ₦1,000,000
- Total CRA = ₦200,000 + ₦1,000,000 = ₦1,200,000

This means only ₦3,800,000 of your income is taxable, not the full ₦5,000,000.

You can also get additional relief for rent paid during the year.`
  },
  {
    id: "paye",
    icon: Wallet,
    title: "PAYE (Pay As You Earn) for Employees",
    content: `If you're an employee, you don't file taxes yourself - your employer deducts tax from your salary every month and remits it to the tax authority. This is called PAYE.

Before calculating PAYE, these are deducted from your gross salary:
- Pension contribution (minimum 8% of your gross salary - this is mandatory)
- National Housing Fund (NHF) - 2.5% of your basic salary
- Consolidated Relief Allowance (CRA)

After these deductions, the remaining amount (taxable income) is taxed using the graduated rates.

Your employer contributes 10% to your pension separately - this doesn't come from your salary.`
  },
  {
    id: "business-tax",
    icon: Briefcase,
    title: "Small Business Tax (Company Income Tax)",
    content: `If you run a registered company, you pay Company Income Tax (CIT) on your profits. The rate depends on your company's annual turnover:

- Small Companies (₦25 million or less): 0% CIT - You're exempt!
- Medium Companies (₦25M to ₦100M): 20% CIT
- Large Companies (above ₦100M): 30% CIT

Companies with turnover above ₦25M also pay Tertiary Education Tax at 2.5% of assessable profit.

Taxable profit = Revenue - Allowable Expenses (rent, salaries, utilities, materials, etc.)

If you're a sole proprietor (not a registered company), your business income is taxed as personal income using PIT rates instead.`
  },
  {
    id: "deadlines",
    icon: CalendarDays,
    title: "Important Tax Deadlines",
    content: `Mark these dates on your calendar:

For Individuals (PIT):
- January 31: File annual tax returns for the previous year
- March 31: Pay outstanding tax for previous year

For Companies (CIT):
- 6 months after your financial year end: File returns and pay tax
- Example: If your year ends December 31, deadline is June 30

Monthly PAYE:
- 10th of each month: Employer remits PAYE deductions for the previous month

VAT:
- 21st of each month: File and remit VAT collected in the previous month

Withholding Tax:
- 21 days after deduction: Remit withholding tax to FIRS

Late filing attracts penalties: ₦50,000 for the first month and ₦25,000 for each subsequent month for individuals. Companies face higher penalties.`
  },
  {
    id: "tin",
    icon: FileText,
    title: "Getting Your TIN (Tax Identification Number)",
    content: `Every Nigerian taxpayer needs a TIN. Here's how to get one:

1. Visit the FIRS JTB TIN Registration portal (tinverification.firs.gov.ng)
2. Fill in your personal details (name, date of birth, address, etc.)
3. You'll get your TIN immediately after registration
4. You can also visit any FIRS office with your NIN, BVN, or passport

Your TIN is permanent and follows you throughout your life. You'll need it for:
- Filing tax returns
- Opening certain bank accounts
- Government contracts and tenders
- Property transactions

It's free to register, and it only takes a few minutes online.`
  },
];

export default function EducationPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold" data-testid="education-title">Tax Education</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Everything you need to know about Nigerian tax, explained in plain English. No jargon, no confusion.
            </p>
          </div>

          <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="education-content">
            <CardContent className="p-4 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {sections.map((section, i) => {
                  const Icon = section.icon;
                  return (
                    <AccordionItem key={section.id} value={section.id} className="border-border/40">
                      <AccordionTrigger className="hover:no-underline py-5" data-testid={`education-accordion-${section.id}`}>
                        <div className="flex items-center gap-3 text-left">
                          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-heading font-semibold text-sm md:text-base">{section.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-11 pr-2 pb-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Disclaimer: This information is for educational purposes only and should not be considered as professional tax advice.
              Consult a qualified tax consultant for specific guidance.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
