import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Briefcase, Wallet, GraduationCap, ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const tools = [
  {
    title: "Personal Income Tax",
    description: "Calculate your annual income tax with CRA relief and see monthly breakdowns",
    icon: Calculator,
    href: "/calculator/pit",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Salary PAYE",
    description: "Estimate your take-home pay after pension, NHF, and PAYE deductions",
    icon: Wallet,
    href: "/calculator/paye",
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Business Tax",
    description: "Estimate your company income tax based on turnover and profit",
    icon: Briefcase,
    href: "/calculator/business",
    color: "bg-chart-3/10 text-emerald-600",
  },
];

const benefits = [
  { icon: Shield, title: "Accurate Rates", desc: "Uses official 2024/2025 Nigerian tax brackets" },
  { icon: Clock, title: "Deadline Reminders", desc: "Never miss a filing or payment deadline" },
  { icon: TrendingUp, title: "Save & Compare", desc: "Save calculations and track changes over time" },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-16 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
                <Calculator className="h-3.5 w-3.5" />
                Free Nigerian Tax Calculator
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]" data-testid="hero-title">
                Nigerian Tax
                <span className="block text-primary">Made Simple</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                Understand your tax obligations in minutes. Calculate personal income tax, PAYE, and business tax with our easy-to-use tools built for everyday Nigerians.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="rounded-xl h-12 px-8 font-medium" data-testid="hero-dashboard-btn">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button size="lg" className="rounded-xl h-12 px-8 font-medium" data-testid="hero-get-started-btn">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link to="/calculator/pit">
                  <Button variant="outline" size="lg" className="rounded-xl h-12 px-8 font-medium border-2" data-testid="hero-try-calculator-btn">
                    Try Calculator
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1544813813-2c73bec209ca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxuaWdlcmlhbiUyMHByb2Zlc3Npb25hbCUyMGhhcHB5JTIwbGFwdG9wJTIwb2ZmaWNlfGVufDB8fHx8MTc3MTc1NzY1Nnww&ixlib=rb-4.1.0&q=85"
                  alt="Professional using laptop"
                  className="relative rounded-3xl object-cover w-full h-[400px] shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 md:py-24" data-testid="tools-section">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">Tax Tools That Make Sense</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              No jargon, no confusion. Pick a tool and get your answers in seconds.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={tool.href} data-testid={`tool-card-${tool.href.split('/').pop()}`}>
                    <Card className="group rounded-2xl border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full hover:-translate-y-1">
                      <CardContent className="p-6 md:p-8 space-y-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${tool.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-heading text-xl font-semibold">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                        <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          Calculate now <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learn CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <GraduationCap className="h-10 w-10 text-primary mx-auto" />
            <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">New to Nigerian Tax?</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Our plain-English guide breaks down everything you need to know about taxes in Nigeria.
            </p>
            <Link to="/education">
              <Button variant="outline" size="lg" className="rounded-xl h-12 px-8 font-medium border-2 mt-4" data-testid="hero-learn-btn">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">
            NairaTax &mdash; Built for Nigerians, by Nigerians. Tax rates based on 2024/2025 FIRS guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
