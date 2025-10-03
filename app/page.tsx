"use client";

import { SignUpButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  LineChart,
  Target,
  Upload,
  Share2,
  FileText,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AnimatedBackground from "@/components/AnimatedBackground";
import AnimatedSection from "@/components/AnimatedSection";
import PageTransition from "@/components/PageTransition";
import { useGSAPStagger } from "@/hooks/useGSAPAnimation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const router = useRouter();
  const featuresRef = useGSAPStagger();
  const stepsRef = useGSAPStagger();
  const { data: session, isLoaded } = useSession();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-redirect to dashboard if signed in
  useEffect(() => {
    if (isLoaded && session?.user) {
      router.push("/dashboard");
    }
  }, [isLoaded, session, router]);

  // Show nothing while checking auth or redirecting
  if (!isLoaded || session?.user) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen gradient-mesh flex flex-col">
        <AnimatedBackground />
      {/* Hero */}
        <header className="container mx-auto px-4 sm:px-6 py-4 md:py-6 lg:py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-base sm:text-lg md:text-xl font-bold tracking-tight">SperMaxxing</div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                className="glass h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] md:h-[1.2rem] md:w-[1.2rem]" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] md:h-[1.2rem] md:w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              className="glass text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 hidden sm:flex"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
            <SignUpButton>
              <Button size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 md:px-4">Get started</Button>
            </SignUpButton>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 flex-1 flex flex-col items-center text-center">
          <AnimatedSection className="max-w-3xl mt-6 sm:mt-8 md:mt-10 lg:mt-14 px-4">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full glass text-xs sm:text-xs text-primary">
              <span className="size-1.5 rounded-full bg-primary" /> New: PDF export and shareable links
            </div>
            <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Understand and improve
              </span>{" "}
              your fertility health
            </h1>
            <p className="mt-4 sm:mt-5 md:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground">
              Upload sperm analysis reports, log lifestyle habits, and get clear, personalized recommendations powered by AI.
            </p>
            <div className="mt-6 sm:mt-7 md:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
              <SignUpButton>
                <Button className="font-semibold flex items-center gap-2 w-full sm:w-auto">
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
              <Button
                variant="outline"
                className="glass font-semibold w-full sm:w-auto"
                onClick={() => router.push("/dashboard")}
              >
                View demo
              </Button>
            </div>
          </AnimatedSection>

          {/* Trust bar */}
          <AnimatedSection className="mt-8 sm:mt-10 md:mt-12 w-full max-w-5xl px-4">
            <div className="glass-card rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2"><ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Privacy-first</div>
              <div className="flex items-center gap-1.5 sm:gap-2"><FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" /> PDF exports</div>
              <div className="flex items-center gap-1.5 sm:gap-2"><Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Secure sharing</div>
              <div className="flex items-center gap-1.5 sm:gap-2"><LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" /> Evidence-based</div>
            </div>
          </AnimatedSection>

          {/* Feature grid */}
          <section ref={featuresRef as any} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-8 sm:mt-10 md:mt-12 w-full max-w-6xl px-4">
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Upload className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Upload reports</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Support for common semen analysis metrics like concentration, motility, morphology, and volume.</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <LineChart className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-blue-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">AI insights</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Get an easy-to-understand score with personalized, actionable recommendations backed by research.</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <Activity className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Lifestyle tracking</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Log sleep, exercise, nutrition, and more to see how your routine correlates with your score.</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-purple-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Goal-focused plans</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Set targets and track progress with weekly guidance designed to improve key metrics.</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-amber-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">One-click export</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Generate a professional PDF summary you can share with your clinician or partner.</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-teal-500/10 flex items-center justify-center mb-3 sm:mb-4">
                <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-teal-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Private & secure</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Powered by Clerk authentication with full control over data and private sharing links.</p>
            </div>
          </section>

          {/* How it works */}
          <AnimatedSection className="mt-10 sm:mt-12 md:mt-14 w-full max-w-5xl text-left px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">How it works</h2>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2">Go from data to decisions in minutes.</p>
            <div ref={stepsRef as any} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-7 md:mt-8">
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-sm sm:text-base font-semibold">Upload your report</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Import semen analysis results and we'll compute a clear score across key metrics.</p>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-sm sm:text-base font-semibold">Log lifestyle habits</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Track sleep, exercise, and nutrition to understand correlations and trends.</p>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="text-sm sm:text-base font-semibold">Get tailored guidance</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Receive evidence-backed, prioritized recommendations to move the needle.</p>
              </div>
              <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                  <div className="size-6 sm:size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">4</div>
                  <h3 className="text-sm sm:text-base font-semibold">Export & share</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Generate a polished PDF summary or create a private link when you're ready.</p>
              </div>
            </div>
          </AnimatedSection>

          {/* CTA band */}
          <section className="mt-10 sm:mt-12 md:mt-16 w-full max-w-5xl px-4">
            <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 md:gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Ready to improve your fertility health?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">Join free and start tracking in minutes.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <SignUpButton>
                  <Button className="font-semibold w-full sm:w-auto">Get started</Button>
                </SignUpButton>
                <Button 
                  variant="outline" 
                  className="glass font-semibold w-full sm:w-auto"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          © {new Date().getFullYear()} SperMaxxing 
        </footer>
      </div>
    </PageTransition>
  );
}