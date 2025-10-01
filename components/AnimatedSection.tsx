"use client";

import { useGSAPAnimation } from "@/hooks/useGSAPAnimation";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedSection({ children, className = "" }: AnimatedSectionProps) {
  const ref = useGSAPAnimation();

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}