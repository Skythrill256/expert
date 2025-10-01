"use client";

import { SignUp } from '@clerk/nextjs';
import { Activity, Shield } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
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
              elements: {
                rootBox: "w-full",
                card: "glass-card rounded-2xl shadow-xl",
              }
            }}
            routing="path"
            path="/register"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
          />
        </div>

        {/* Info Card */}
        <div className="mt-6 glass-card rounded-xl p-4 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Shield className="w-4 h-4" /> Your data is encrypted and secure
        </div>
      </div>
    </div>
  );
}