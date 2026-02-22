// Nigerian PIT 2024/2025 graduated tax bands
const PIT_BANDS = [
  { min: 0, max: 300000, rate: 0.07, label: "First ₦300,000" },
  { min: 300000, max: 600000, rate: 0.11, label: "Next ₦300,000" },
  { min: 600000, max: 1100000, rate: 0.15, label: "Next ₦500,000" },
  { min: 1100000, max: 1600000, rate: 0.19, label: "Next ₦500,000" },
  { min: 1600000, max: 3200000, rate: 0.21, label: "Next ₦1,600,000" },
  { min: 3200000, max: Infinity, rate: 0.24, label: "Above ₦3,200,000" },
];

// Consolidated Relief Allowance
export function calculateCRA(grossIncome) {
  const higherOf = Math.max(200000, 0.01 * grossIncome);
  return higherOf + 0.20 * grossIncome;
}

// Apply graduated tax bands
function applyGraduatedTax(taxableIncome) {
  let tax = 0;
  let remaining = taxableIncome;
  const breakdown = [];

  for (const band of PIT_BANDS) {
    if (remaining <= 0) break;
    const bandWidth = band.max === Infinity ? remaining : band.max - band.min;
    const taxableInBand = Math.min(remaining, bandWidth);
    const taxForBand = taxableInBand * band.rate;
    tax += taxForBand;
    breakdown.push({
      label: band.label,
      rate: band.rate * 100,
      taxable: taxableInBand,
      tax: taxForBand,
    });
    remaining -= taxableInBand;
  }

  return { totalTax: tax, breakdown };
}

// Personal Income Tax Calculator
export function calculatePersonalIncomeTax(annualIncome, rentRelief = 0) {
  const cra = calculateCRA(annualIncome);
  const totalRelief = cra + rentRelief;
  const taxableIncome = Math.max(0, annualIncome - totalRelief);
  const minimumTax = 0.01 * annualIncome;
  const { totalTax, breakdown } = applyGraduatedTax(taxableIncome);
  const finalTax = Math.max(totalTax, minimumTax);
  const isMinimumTax = minimumTax > totalTax;

  return {
    grossIncome: annualIncome,
    cra,
    rentRelief,
    totalRelief,
    taxableIncome,
    calculatedTax: totalTax,
    minimumTax,
    finalTax,
    isMinimumTax,
    monthlyTax: finalTax / 12,
    effectiveRate: annualIncome > 0 ? (finalTax / annualIncome) * 100 : 0,
    breakdown,
  };
}

// PAYE Calculator
export function calculatePAYE(monthlySalary, pensionPercent = 8, nhfPercent = 2.5) {
  const annualSalary = monthlySalary * 12;
  const monthlyPension = monthlySalary * (pensionPercent / 100);
  const annualPension = monthlyPension * 12;
  const monthlyNHF = monthlySalary * (nhfPercent / 100);
  const annualNHF = monthlyNHF * 12;
  const cra = calculateCRA(annualSalary);
  const totalDeductions = cra + annualPension + annualNHF;
  const taxableIncome = Math.max(0, annualSalary - totalDeductions);
  const { totalTax, breakdown } = applyGraduatedTax(taxableIncome);
  const minimumTax = 0.01 * annualSalary;
  const finalTax = Math.max(totalTax, minimumTax);
  const monthlyTax = finalTax / 12;
  const netMonthlySalary = monthlySalary - monthlyPension - monthlyNHF - monthlyTax;

  return {
    monthlySalary,
    annualSalary,
    monthlyPension,
    annualPension,
    monthlyNHF,
    annualNHF,
    cra,
    totalDeductions,
    taxableIncome,
    annualTax: finalTax,
    monthlyTax,
    netMonthlySalary,
    effectiveRate: annualSalary > 0 ? (finalTax / annualSalary) * 100 : 0,
    breakdown,
  };
}

// Small Business Tax Calculator
export function calculateBusinessTax(annualRevenue, annualExpenses) {
  const taxableProfit = Math.max(0, annualRevenue - annualExpenses);
  let citRate, citTax, category;

  if (annualRevenue <= 25000000) {
    citRate = 0;
    citTax = 0;
    category = "Small Company";
  } else if (annualRevenue <= 100000000) {
    citRate = 20;
    citTax = taxableProfit * 0.20;
    category = "Medium Company";
  } else {
    citRate = 30;
    citTax = taxableProfit * 0.30;
    category = "Large Company";
  }

  const educationTax = annualRevenue > 25000000 ? taxableProfit * 0.025 : 0;
  const totalTax = citTax + educationTax;

  return {
    annualRevenue,
    annualExpenses,
    taxableProfit,
    category,
    citRate,
    citTax,
    educationTax,
    totalTax,
    effectiveRate: taxableProfit > 0 ? (totalTax / taxableProfit) * 100 : 0,
    netProfit: taxableProfit - totalTax,
  };
}

export function formatNaira(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₦0.00";
  return "₦" + Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
