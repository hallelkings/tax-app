import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Briefcase, Save, Info } from 'lucide-react';
import { calculateBusinessTax, formatNaira } from '@/lib/taxUtils';
import api from '@/lib/api';

export default function BusinessCalculator() {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCalculate = () => {
    const rev = parseFloat(revenue) || 0;
    const exp = parseFloat(expenses) || 0;
    if (rev <= 0) {
      toast.error('Please enter a valid annual revenue');
      return;
    }
    setResults(calculateBusinessTax(rev, exp));
  };

  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    try {
      await api.post('/calculations', {
        calc_type: 'business',
        inputs: { annualRevenue: parseFloat(revenue), annualExpenses: parseFloat(expenses) || 0 },
        results: { totalTax: results.totalTax, netProfit: results.netProfit, category: results.category },
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
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-emerald-600" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold" data-testid="biz-title">Small Business Tax</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">Estimate your Company Income Tax (CIT) based on 2024/2025 rates</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="biz-input-card">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Annual Revenue (Turnover)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₦</span>
                      <Input
                        id="revenue"
                        type="number"
                        placeholder="e.g. 15,000,000"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className="h-12 rounded-lg pl-7"
                        data-testid="biz-revenue-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenses">Annual Expenses</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₦</span>
                      <Input
                        id="expenses"
                        type="number"
                        placeholder="e.g. 8,000,000"
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                        className="h-12 rounded-lg pl-7"
                        data-testid="biz-expenses-input"
                      />
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                    <p className="flex items-start gap-1"><Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" /> <strong>CIT Rate Tiers:</strong></p>
                    <p className="ml-5">Small (up to ₦25M): <strong>0% CIT</strong></p>
                    <p className="ml-5">Medium (₦25M - ₦100M): <strong>20% CIT</strong></p>
                    <p className="ml-5">Large (above ₦100M): <strong>30% CIT</strong></p>
                  </div>
                  <Button onClick={handleCalculate} className="w-full h-12 rounded-xl font-medium" data-testid="biz-calculate-btn">
                    Calculate Business Tax
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {results ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="biz-results-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-heading text-lg">Tax Summary</CardTitle>
                      <Badge variant={results.citRate === 0 ? 'secondary' : 'default'} className="rounded-lg" data-testid="biz-result-category">
                        {results.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Key figures */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-accent/10 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Total Tax</p>
                          <p className="font-heading font-bold text-xl text-accent" data-testid="biz-result-total-tax">{formatNaira(results.totalTax)}</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
                          <p className="font-heading font-bold text-xl text-primary" data-testid="biz-result-net-profit">{formatNaira(results.netProfit)}</p>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Revenue</span>
                          <span className="font-medium">{formatNaira(results.annualRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Expenses</span>
                          <span className="font-medium text-accent">-{formatNaira(results.annualExpenses)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Taxable Profit</span>
                          <span data-testid="biz-result-taxable-profit">{formatNaira(results.taxableProfit)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CIT ({results.citRate}%)</span>
                          <span className="font-medium">{formatNaira(results.citTax)}</span>
                        </div>
                        {results.educationTax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tertiary Education Tax (2.5%)</span>
                            <span className="font-medium">{formatNaira(results.educationTax)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Effective Tax Rate</span>
                          <span data-testid="biz-result-effective-rate">{results.effectiveRate.toFixed(1)}%</span>
                        </div>
                      </div>

                      {results.citRate === 0 && (
                        <div className="bg-primary/10 text-primary text-sm px-4 py-3 rounded-xl">
                          Your business qualifies as a <strong>Small Company</strong> (turnover under ₦25M) and is exempt from Company Income Tax.
                        </div>
                      )}

                      {user && (
                        <Button onClick={handleSave} variant="outline" className="rounded-xl" disabled={saving} data-testid="biz-save-btn">
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
                    <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your business details and click Calculate to see your tax estimate</p>
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
