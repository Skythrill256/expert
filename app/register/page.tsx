"use client";

import { SignUp } from '@clerk/nextjs';
import { Activity, Shield, Moon, Sun } from "lucide-react";
import { useTheme } from 'next-themes';
import { dark } from '@clerk/themes';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Top Right */}
      {mounted && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <Button
            variant="outline"
            size="icon"
            className="glass"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start tracking your health journey today</p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              baseTheme: isDark ? dark : undefined,
              elements: {
                rootBox: "w-full",
                card: "glass-card rounded-2xl shadow-xl",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                formFieldInput: "bg-background border-border text-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-muted-foreground hover:text-foreground",
              },
            }}
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
          />
        </div>

        {/* Info Card */}
        <div className="mt-6 glass-card rounded-xl p-4 text-center text-sm text-muted-foreground animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: "0.2s" }}>
          <Shield className="w-4 h-4" /> Your data is encrypted and secure
        </div>
      </div>
    </div>
  );
}