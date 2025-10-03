"use client";

import { Home, Upload, TrendingUp, Settings, Menu, X, LogOut, Share2, Moon, Sun } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/SidebarContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Upload Report", href: "/upload", icon: Upload },
  { name: "Recommendations", href: "/recommendations", icon: TrendingUp },
  { name: "Share with Doctor", href: "/share", icon: Share2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isCollapsed } = useSidebar();
  const { data: session, isPending } = useSession();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
  className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 glass-card border rounded-full shadow-lg flex items-center justify-center"
      >
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 transition-all duration-300 ease-in-out",
          "sidebar-pill glass-card border-r border-t-0 border-b-0 border-l-0 lg:border",
          // Mobile: full width overlay sidebar
          "lg:translate-x-0",
          isOpen ? "translate-x-0 z-50 w-72" : "-translate-x-full z-50 w-72",
          // Desktop: fixed sidebar with collapse
          "lg:z-40",
          isCollapsed ? "lg:w-[4.5rem] lg:px-2.5 lg:py-3" : "lg:w-64 lg:px-5 lg:py-3",
          // Mobile: better spacing
          "px-6 py-6 lg:px-5 lg:py-3"
        )}
        aria-label="Primary"
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="mb-8 lg:mb-4 flex items-center justify-center transition-all duration-300">
            <Link href="/dashboard" className="flex items-center group">
              <div className={cn(
                "relative transition-all duration-300 hover:scale-110",
                isCollapsed ? "w-16 h-16 lg:w-16 lg:h-16" : "w-32 h-32 lg:w-20 lg:h-20"
              )}>
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 flex flex-col justify-center",
            isCollapsed ? "lg:space-y-2" : "space-y-4 lg:space-y-1.5"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    // Rounded/pill nav items similar to reference
                    "flex items-center smooth-transition group relative overflow-hidden focus-ring",
                    isActive
                      ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
                    // Mobile: much larger touch targets
                    "px-7 py-5 gap-5 rounded-full text-lg font-medium",
                    // Desktop: conditional styling based on collapse state
                    isCollapsed 
                      ? "lg:justify-center lg:h-10 lg:w-10 lg:rounded-full lg:px-0 lg:gap-0 lg:mx-auto lg:text-sm lg:font-medium" 
                      : "lg:px-5 lg:py-2.5 lg:gap-3 lg:rounded-full lg:text-sm lg:font-medium"
                  )}
                >
                  <Icon className="w-7 h-7 lg:w-5 lg:h-5 shrink-0" />
                  {/* Always show text on mobile, conditionally on desktop */}
                  <span className={cn(
                    "whitespace-nowrap",
                    isCollapsed && "lg:hidden"
                  )}>
                    {item.name}
                  </span>
                  
                  {/* Tooltip for collapsed state on desktop only */}
                  {isCollapsed && (
                    <span className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
                      {item.name}
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & User info */}
          <div className={cn(
            "pt-6 lg:pt-3 border-t border-border/50 flex flex-col",
            isCollapsed ? "space-y-2" : "space-y-4 lg:space-y-2"
          )}>
            {/* Theme Toggle */}
            <div className="relative group">
              <Button
                variant="outline"
                className={cn(
                  "w-full hover:bg-accent/60 border-border/50 rounded-full",
                  // Mobile: much larger touch target
                  "h-16 px-7 gap-5 text-lg font-medium lg:h-10 lg:px-4 lg:gap-3 lg:text-sm lg:font-medium",
                  // Mobile: always show text with proper layout
                  "flex items-center justify-start",
                  // Desktop: conditional styling based on collapse state
                  isCollapsed && "lg:justify-center lg:px-0 lg:gap-0"
                )}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && (
                  theme === "dark" ? (
                    <Sun className="w-7 h-7 lg:w-5 lg:h-5 shrink-0" />
                  ) : (
                    <Moon className="w-7 h-7 lg:w-5 lg:h-5 shrink-0" />
                  )
                )}
                {/* Always show text on mobile, conditionally on desktop */}
                <span className={cn(
                  isCollapsed && "lg:hidden"
                )}>
                  {mounted && (theme === "dark" ? "Light Mode" : "Dark Mode")}
                </span>
              </Button>
              
              {/* Tooltip for collapsed state on desktop only */}
              {isCollapsed && (
                <span className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
                  {mounted && (theme === "dark" ? "Light mode" : "Dark mode")}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                </span>
              )}
            </div>

            {isPending ? (
              <div className={cn(
                "flex items-center rounded-xl glass p-3 animate-pulse",
                isCollapsed ? "justify-center" : "gap-3"
              )}>
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                )}
              </div>
            ) : session?.user ? (
              <>
                <div className={cn(
                  "relative group flex items-center rounded-full glass hover:bg-accent/30 smooth-transition cursor-pointer",
                  // Mobile: much larger spacing
                  "gap-4 p-4 pl-4 pr-5 lg:gap-2.5 lg:p-2 lg:pl-2 lg:pr-2.5",
                  // Desktop: conditional styling based on collapse state
                  isCollapsed && "lg:justify-center lg:p-1.5 lg:gap-0"
                )}>
                  <Avatar className="w-14 h-14 lg:w-9 lg:h-9 shrink-0 ring-2 ring-border/50">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white font-semibold text-lg lg:text-sm">
                      {getInitials(session.user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  {/* Always show on mobile, conditionally on desktop */}
                  <div className={cn(
                    "flex-1 min-w-0",
                    isCollapsed && "lg:hidden"
                  )}>
                    <p className="text-lg lg:text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-base lg:text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  
                  {/* Tooltip for collapsed state on desktop only */}
                  {isCollapsed && (
                    <span className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-border pointer-events-none min-w-[200px]">
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{session.user.email}</p>
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                    </span>
                  )}
                </div>
                
                <div className="relative group">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 border-border/50 smooth-transition rounded-full",
                      // Mobile: much larger touch target
                      "h-16 px-7 gap-5 text-lg font-medium lg:h-10 lg:px-4 lg:gap-3 lg:text-sm lg:font-medium",
                      // Mobile: always show text with proper layout
                      "flex items-center justify-start",
                      // Desktop: conditional styling based on collapse state
                      isCollapsed && "lg:justify-center lg:px-0 lg:gap-0"
                    )}
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-7 h-7 lg:w-5 lg:h-5 shrink-0" />
                    {/* Always show text on mobile, conditionally on desktop */}
                    <span className={cn(
                      isCollapsed && "lg:hidden"
                    )}>
                      Sign Out
                    </span>
                  </Button>
                  
                  {/* Tooltip for collapsed state on desktop only */}
                  {isCollapsed && (
                    <span className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
                      Sign Out
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="relative group">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full hover:bg-accent/50 border-border/50 rounded-full",
                    // Mobile: much larger touch target
                    "h-16 px-7 gap-5 text-lg font-medium lg:h-10 lg:px-4 lg:gap-3 lg:text-sm lg:font-medium",
                    // Mobile: always show text with proper layout
                    "flex items-center justify-start",
                    // Desktop: conditional styling based on collapse state
                    isCollapsed && "lg:justify-center lg:px-0 lg:gap-0"
                  )}
                  onClick={() => router.push("/login")}
                >
                  <LogOut className="w-7 h-7 lg:w-5 lg:h-5 shrink-0" />
                  {/* Always show text on mobile, conditionally on desktop */}
                  <span className={cn(
                    isCollapsed && "lg:hidden"
                  )}>
                    Sign In
                  </span>
                </Button>
                
                {/* Tooltip for collapsed state on desktop only */}
                {isCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
                    Sign In
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}