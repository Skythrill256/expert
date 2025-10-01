"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const blobs = containerRef.current.querySelectorAll(".blob");

    blobs.forEach((blob, index) => {
      gsap.to(blob, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        duration: `random(15, 25)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 2,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="blob absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
      <div className="blob absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-chart-2/20 to-transparent blur-3xl" />
      <div className="blob absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-chart-3/20 to-transparent blur-3xl" />
      <div className="blob absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-chart-4/15 to-transparent blur-3xl" />
    </div>
  );
}