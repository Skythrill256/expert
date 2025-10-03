"use client";

import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <main
      className={cn(
        // Responsive padding and margin for sidebar
        "transition-all duration-300",
        // Mobile: extra top padding for hamburger menu button
        "px-3 pt-16 pb-3 sm:px-4 sm:pt-4 sm:pb-4 md:px-6 md:py-6 lg:px-8 lg:py-8",
        // Desktop: margin for permanently collapsed sidebar
        "ml-0 lg:ml-[5rem]",
        className
      )}
    >
      {children}
    </main>
  );
}