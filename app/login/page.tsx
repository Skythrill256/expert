"use client";

import { SignIn } from '@clerk/nextjs';
import { Activity, Shield } from "lucide-react";
import { useTheme } from 'next-themes';
import { dark } from '@clerk/themes';

export default function LoginPage() {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue tracking your health</p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
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
            routing="path"
            path="/login"
            signUpUrl="/register"
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