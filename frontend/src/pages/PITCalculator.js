import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Calculator, Save, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculatePersonalIncomeTax, formatNaira } from '@/lib/taxUtils';
import api from '@/lib/api';

export default function PITCalculator() {
  const { user } = useAuth();
  const [annualIncome, setAnnualIncome] = useState('');
  const [rentRelief, setRentRelief] = useState('');
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCalculate = () => {
    const income = parseFloat(annualIncome) || 0;
    const rent = parseFloat(rentRelief) || 0;
    if (income <= 0) {
      toast.error('Please enter a valid annual income');
      return;
    }
    const res = calculatePersonalIncomeTax(income, rent);
    setResults(res);
  };

  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    try {
      await api.post('/calculations', {
        calc_type: 'pit',
        inputs: { annualIncome: parseFloat(annualIncome), rentRelief: parseFloat(rentRelief) || 0 },
        results: { finalTax: results.finalTax, monthlyTax: results.monthlyTax, effectiveRate: results.effectiveRate },
      });
      toast.success('Calculation saved!');
    } catch {
      toast.error('Failed to save. Please log in first.');
    } finally {
      setSaving(false);
    }
  };

  const chartData = results ? [
    { name: 'Tax', value: results.finalTax, color: '#C2410C' },
    { name: 'Take Home', value: results.grossIncome - results.finalTax, color: '#064E3B' },
  ] : [];

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold" data-testid="pit-title">Personal Income Tax</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">Calculate your annual income tax using 2024/2025 Nigerian PIT rates (7% - 24%)</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="pit-input-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Enter Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="annual-income">Annual Gross Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₦</span>
                      <Input
                        id="annual-income"
                        type="number"
                        placeholder="e.g. 5,000,000"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(e.target.value)}
                        className="h-12 rounded-lg pl-7"
                        data-testid="pit-income-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rent-relief">Annual Rent Paid (Optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₦</span>
                      <Input
                        id="rent-relief"
                        type="number"
                        placeholder="e.g. 500,000"
                        value={rentRelief}
                        onChange={(e) => setRentRelief(e.target.value)}
                        className="h-12 rounded-lg pl-7"
                        data-testid="pit-rent-input"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      Rent paid is deductible from your taxable income
                    </p>
                  </div>
                  <Button onClick={handleCalculate} className="w-full h-12 rounded-xl font-medium" data-testid="pit-calculate-btn">
                    Calculate Tax
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {results ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="pit-results-card">
                    <CardHeader>
                      <CardTitle className="font-heading text-lg">Tax Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Key figures */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-accent/10 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Annual Tax</p>
                          <p className="font-heading font-bold text-lg text-accent" data-testid="pit-result-annual-tax">{formatNaira(results.finalTax)}</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Monthly Tax</p>
                          <p className="font-heading font-bold text-lg text-primary" data-testid="pit-result-monthly-tax">{formatNaira(results.monthlyTax)}</p>
                        </div>
                        <div className="bg-secondary rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Effective Rate</p>
                          <p className="font-heading font-bold text-lg text-secondary-foreground" data-testid="pit-result-effective-rate">{results.effectiveRate.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Chart + Details side by side */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                                {chartData.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(val) => formatNaira(val)} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex justify-center gap-4 text-xs">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Tax</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Take Home</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Gross Income</span>
                            <span className="font-medium">{formatNaira(results.grossIncome)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">CRA Relief</span>
                            <span className="font-medium text-primary">-{formatNaira(results.cra)}</span>
                          </div>
                          {results.rentRelief > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rent Relief</span>
                              <span className="font-medium text-primary">-{formatNaira(results.rentRelief)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Taxable Income</span>
                            <span className="font-medium">{formatNaira(results.taxableIncome)}</span>
                          </div>
                          {results.isMinimumTax && (
                            <div className="bg-accent/10 text-accent text-xs px-3 py-2 rounded-lg">
                              Minimum tax (1% of gross income) applies as it exceeds calculated tax
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Band breakdown */}
                      {results.breakdown.length > 0 && (
                        <div>
                          <h4 className="font-heading font-semibold text-sm mb-3">Tax Band Breakdown</h4>
                          <div className="rounded-xl border border-border/40 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Band</th>
                                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Rate</th>
                                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Taxable</th>
                                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Tax</th>
                                </tr>
                              </thead>
                              <tbody>
                                {results.breakdown.map((b, i) => (
                                  <tr key={i} className="border-t border-border/40">
                                    <td className="px-4 py-2 text-muted-foreground">{b.label}</td>
                                    <td className="text-right px-4 py-2">{b.rate}%</td>
                                    <td className="text-right px-4 py-2">{formatNaira(b.taxable)}</td>
                                    <td className="text-right px-4 py-2 font-medium">{formatNaira(b.tax)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {user && (
                        <Button onClick={handleSave} variant="outline" className="rounded-xl" disabled={saving} data-testid="pit-save-btn">
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
                    <Calculator className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your income details and click Calculate to see your tax breakdown</p>
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
