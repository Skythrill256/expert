"use client";

import { Plus, X, Activity, Upload, Lightbulb } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Activity, label: "Log Lifestyle", href: "/lifestyle", color: "from-primary to-chart-2" },
    { icon: Upload, label: "Upload Report", href: "/upload", color: "from-chart-2 to-chart-3" },
    { icon: Lightbulb, label: "View Insights", href: "/recommendations", color: "from-chart-3 to-chart-4" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="flex items-center gap-3 glass-card px-4 py-3 rounded-full hover-lift group"
                  onClick={() => setIsOpen(false)}
                >
                  <span className={`text-sm font-medium whitespace-nowrap smooth-transition ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-muted-foreground dark:text-white`}> 
                    {action.label}
                  </span>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:shadow-2xl smooth-transition"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Plus className="w-6 h-6 text-white dark:text-black" />
        </motion.div>
      </motion.button>
    </div>
  );
}