import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Wallet, Save, Info } from 'lucide-react';
import { calculatePAYE, formatNaira } from '@/lib/taxUtils';
import api from '@/lib/api';

export default function PAYECalculator() {
  const { user } = useAuth();
  const [monthlySalary, setMonthlySalary] = useState('');
  const [pensionPct, setPensionPct] = useState('8');
  const [nhfPct, setNhfPct] = useState('2.5');
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCalculate = () => {
    const salary = parseFloat(monthlySalary) || 0;
    const pension = parseFloat(pensionPct) || 8;
    const nhf = parseFloat(nhfPct) || 2.5;
    if (salary <= 0) {
      toast.error('Please enter a valid monthly salary');
      return;
    }
    setResults(calculatePAYE(salary, pension, nhf));
  };

  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    try {
      await api.post('/calculations', {
        calc_type: 'paye',
        inputs: { monthlySalary: parseFloat(monthlySalary), pensionPct: parseFloat(pensionPct), nhfPct: parseFloat(nhfPct) },
        results: { netMonthlySalary: results.netMonthlySalary, monthlyTax: results.monthlyTax, effectiveRate: results.effectiveRate },
      });
      toast.success('Calculation saved!');
    } catch {
      toast.error('Failed to save. Please log in first.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold" data-testid="paye-title">Salary PAYE Estimator</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">See exactly what you take home after pension, NHF, and PAYE deductions</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="paye-input-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Salary Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-salary">Monthly Gross Salary</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₦</span>
                      <Input
                        id="monthly-salary"
                        type="number"
                        placeholder="e.g. 350,000"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        className="h-12 rounded-lg pl-7"
                        data-testid="paye-salary-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pension-pct">Pension (%)</Label>
                      <Input
                        id="pension-pct"
                        type="number"
                        value={pensionPct}
                        onChange={(e) => setPensionPct(e.target.value)}
                        className="h-12 rounded-lg"
                        data-testid="paye-pension-input"
                      />
                      <p className="text-xs text-muted-foreground">Min 8% by law</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nhf-pct">NHF (%)</Label>
                      <Input
                        id="nhf-pct"
                        type="number"
                        value={nhfPct}
                        onChange={(e) => setNhfPct(e.target.value)}
                        className="h-12 rounded-lg"
                        data-testid="paye-nhf-input"
                      />
                      <p className="text-xs text-muted-foreground">Standard 2.5%</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    <span>Pension is your employee contribution. Employer contributes 10% separately.</span>
                  </div>
                  <Button onClick={handleCalculate} className="w-full h-12 rounded-xl font-medium" data-testid="paye-calculate-btn">
                    Calculate Take-Home
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {results ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="paye-results-card">
                    <CardHeader>
                      <CardTitle className="font-heading text-lg">Your Take-Home Pay</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Big number */}
                      <div className="bg-primary/10 rounded-2xl p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Net Monthly Salary</p>
                        <p className="font-heading font-bold text-3xl md:text-4xl text-primary" data-testid="paye-result-net-salary">{formatNaira(results.netMonthlySalary)}</p>
                        <p className="text-xs text-muted-foreground mt-2">Effective tax rate: {results.effectiveRate.toFixed(1)}%</p>
                      </div>

                      {/* Monthly deductions */}
                      <div>
                        <h4 className="font-heading font-semibold text-sm mb-3">Monthly Deductions</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gross Salary</span>
                            <span className="font-medium">{formatNaira(results.monthlySalary)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pension ({pensionPct}%)</span>
                            <span className="font-medium text-accent">-{formatNaira(results.monthlyPension)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">NHF ({nhfPct}%)</span>
                            <span className="font-medium text-accent">-{formatNaira(results.monthlyNHF)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">PAYE Tax</span>
                            <span className="font-medium text-accent">-{formatNaira(results.monthlyTax)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-sm font-semibold">
                            <span>Net Salary</span>
                            <span className="text-primary">{formatNaira(results.netMonthlySalary)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Annual summary */}
                      <div>
                        <h4 className="font-heading font-semibold text-sm mb-3">Annual Summary</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">Annual Salary</p>
                            <p className="font-heading font-bold text-sm">{formatNaira(results.annualSalary)}</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">Annual Tax</p>
                            <p className="font-heading font-bold text-sm">{formatNaira(results.annualTax)}</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">Annual Pension</p>
                            <p className="font-heading font-bold text-sm">{formatNaira(results.annualPension)}</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground">CRA Relief</p>
                            <p className="font-heading font-bold text-sm">{formatNaira(results.cra)}</p>
                          </div>
                        </div>
                      </div>

                      {user && (
                        <Button onClick={handleSave} variant="outline" className="rounded-xl" disabled={saving} data-testid="paye-save-btn">
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Calculation'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="rounded-2xl border-border/40 shadow-sm border-dashed">
                  <CardContent className="p-12 text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your salary details and click Calculate to see your take-home pay</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
