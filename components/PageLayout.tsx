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
        "px-4 py-4 sm:px-6 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8",
        // Mobile: no margin (sidebar is overlay)
        // Desktop: margin for permanently collapsed sidebar
        "ml-0 lg:ml-[5rem]",
        className
      )}
    >
      {children}
    </main>
  );
}