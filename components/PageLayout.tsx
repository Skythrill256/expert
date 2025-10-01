"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "p-4 lg:p-8 transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-72",
        className
      )}
    >
      {children}
    </main>
  );
}