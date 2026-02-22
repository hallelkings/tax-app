import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  LayoutDashboard, Calculator, Wallet, Briefcase, Trash2,
  Plus, CalendarIcon, Bell, Loader2, Clock
} from 'lucide-react';
import { formatNaira } from '@/lib/taxUtils';
import api from '@/lib/api';

const calcTypeConfig = {
  pit: { label: 'Income Tax', icon: Calculator, color: 'bg-primary/10 text-primary' },
  paye: { label: 'PAYE', icon: Wallet, color: 'bg-accent/10 text-accent' },
  business: { label: 'Business Tax', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600' },
};

const categoryColors = {
  filing: 'bg-blue-50 text-blue-700',
  payment: 'bg-amber-50 text-amber-700',
  other: 'bg-slate-100 text-slate-600',
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loadingCalcs, setLoadingCalcs] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminderForm, setReminderForm] = useState({ title: '', description: '', due_date: null, category: 'filing' });
  const [savingReminder, setSavingReminder] = useState(false);

  const fetchCalcs = useCallback(async () => {
    try {
      const { data } = await api.get('/calculations');
      setCalculations(data);
    } catch {
      // silent fail
    } finally {
      setLoadingCalcs(false);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const { data } = await api.get('/reminders');
      setReminders(data);
    } catch {
      // silent fail
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchCalcs();
      fetchReminders();
    }
  }, [user, authLoading, navigate, fetchCalcs, fetchReminders]);

  const deleteCalc = async (id) => {
    try {
      await api.delete(`/calculations/${id}`);
      setCalculations((prev) => prev.filter((c) => c.id !== id));
      toast.success('Calculation deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddReminder = async () => {
    if (!reminderForm.title || !reminderForm.due_date) {
      toast.error('Please fill in title and due date');
      return;
    }
    setSavingReminder(true);
    try {
      const { data } = await api.post('/reminders', {
        title: reminderForm.title,
        description: reminderForm.description,
        due_date: format(reminderForm.due_date, 'yyyy-MM-dd'),
        category: reminderForm.category,
      });
      setReminders((prev) => [...prev, data]);
      setShowAddReminder(false);
      setReminderForm({ title: '', description: '', due_date: null, category: 'filing' });
      toast.success('Reminder added!');
    } catch {
      toast.error('Failed to add reminder');
    } finally {
      setSavingReminder(false);
    }
  };

  const toggleReminder = async (reminder) => {
    try {
      const { data } = await api.put(`/reminders/${reminder.id}`, { completed: !reminder.completed });
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? data : r)));
    } catch {
      toast.error('Failed to update reminder');
    }
  };

  const deleteReminder = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reminder deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getCalcSummary = (calc) => {
    if (calc.calc_type === 'pit') return `Tax: ${formatNaira(calc.results.finalTax)}`;
    if (calc.calc_type === 'paye') return `Net: ${formatNaira(calc.results.netMonthlySalary)}/mo`;
    if (calc.calc_type === 'business') return `Tax: ${formatNaira(calc.results.totalTax)}`;
    return '';
  };

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold" data-testid="dashboard-title">
                Welcome, {user.name}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">Manage your saved calculations and tax reminders</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calculations */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="dashboard-calculations">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-heading text-lg">Saved Calculations</CardTitle>
                  <Badge variant="secondary" className="rounded-lg">{calculations.length}</Badge>
                </CardHeader>
                <CardContent>
                  {loadingCalcs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : calculations.length === 0 ? (
                    <div className="text-center py-8">
                      <Calculator className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No saved calculations yet. Use a calculator and click Save!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calculations.map((calc) => {
                        const cfg = calcTypeConfig[calc.calc_type] || calcTypeConfig.pit;
                        const Icon = cfg.icon;
                        return (
                          <div key={calc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors group" data-testid={`calc-item-${calc.id}`}>
                            <div className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${cfg.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{cfg.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(calc.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{getCalcSummary(calc)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={() => deleteCalc(calc.id)}
                              data-testid={`delete-calc-${calc.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reminders */}
            <div>
              <Card className="rounded-2xl border-border/40 shadow-sm" data-testid="dashboard-reminders">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Reminders
                  </CardTitle>
                  <Button size="sm" className="rounded-xl h-8" onClick={() => setShowAddReminder(true)} data-testid="add-reminder-btn">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingReminders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : reminders.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No reminders yet. Add your tax deadlines!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reminders.map((reminder) => (
                        <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 group" data-testid={`reminder-item-${reminder.id}`}>
                          <Checkbox
                            checked={reminder.completed}
                            onCheckedChange={() => toggleReminder(reminder)}
                            className="mt-0.5"
                            data-testid={`reminder-check-${reminder.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {reminder.title}
                            </p>
                            {reminder.description && (
                              <p className="text-xs text-muted-foreground truncate">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {reminder.due_date}
                              </span>
                              <Badge variant="secondary" className={`text-xs rounded-md px-1.5 py-0 ${categoryColors[reminder.category] || ''}`}>
                                {reminder.category}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 flex-shrink-0"
                            onClick={() => deleteReminder(reminder.id)}
                            data-testid={`delete-reminder-${reminder.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent className="sm:max-w-md rounded-2xl" data-testid="add-reminder-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Tax Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">Title</Label>
              <Input
                id="reminder-title"
                placeholder="e.g. File annual returns"
                value={reminderForm.title}
                onChange={(e) => setReminderForm((f) => ({ ...f, title: e.target.value }))}
                className="h-11 rounded-lg"
                data-testid="reminder-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-desc">Description (optional)</Label>
              <Input
                id="reminder-desc"
                placeholder="Notes about this deadline"
                value={reminderForm.description}
                onChange={(e) => setReminderForm((f) => ({ ...f, description: e.target.value }))}
                className="h-11 rounded-lg"
                data-testid="reminder-description-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left h-11 rounded-lg font-normal" data-testid="reminder-date-trigger">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {reminderForm.due_date ? format(reminderForm.due_date, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reminderForm.due_date}
                    onSelect={(day) => setReminderForm((f) => ({ ...f, due_date: day }))}
                    data-testid="reminder-calendar"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={reminderForm.category} onValueChange={(val) => setReminderForm((f) => ({ ...f, category: val }))}>
                <SelectTrigger className="h-11 rounded-lg" data-testid="reminder-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filing">Filing Deadline</SelectItem>
                  <SelectItem value="payment">Payment Due</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddReminder(false)} className="rounded-xl" data-testid="reminder-cancel-btn">Cancel</Button>
            <Button onClick={handleAddReminder} className="rounded-xl" disabled={savingReminder} data-testid="reminder-save-btn">
              {savingReminder ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
