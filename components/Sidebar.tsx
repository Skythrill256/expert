"use client";

import { Home, Upload, TrendingUp, Settings, Menu, X, LogOut, Share2, Moon, Sun } from "lucide-react";
import Link from "next/link";
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-xl shadow-lg"
        aria-label="Toggle menu"
      >
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
          "sidebar-pill glass-card border",
          // Mobile: full width overlay sidebar
          "lg:translate-x-0",
          isOpen ? "translate-x-0 z-50 w-64" : "-translate-x-full z-50 w-64",
          // Desktop: fixed sidebar with collapse
          "lg:z-40",
          isCollapsed ? "lg:w-[4.5rem] lg:px-2.5 lg:py-5" : "lg:w-64 lg:px-5 lg:py-5",
          // Mobile always expanded style
          "px-5 py-5 lg:px-5 lg:py-5"
        )}
        aria-label="Primary"
      >
        <div className="flex flex-col h-full">
          {/* Header - Always collapsed on desktop */}
          <div className="mb-8 flex items-center justify-center transition-all duration-300">
            {/* No header content in collapsed state */}
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 flex flex-col",
            isCollapsed ? "space-y-3" : "space-y-2"
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
                    "flex items-center rounded-full smooth-transition group relative overflow-hidden focus-ring",
                    isActive
                      ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground",
                    isCollapsed 
                      ? "justify-center h-11 w-full" 
                      : "px-5 py-3 gap-3"
                  )}
                >
                  <Icon className={cn(
                    "shrink-0",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5"
                  )} />
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
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
            "pt-4 border-t border-border/50 flex flex-col",
            isCollapsed ? "space-y-3" : "space-y-3"
          )}>
            {/* Theme Toggle */}
            <div className="relative group">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-full h-11 hover:bg-accent/60 border-border/50 rounded-full",
                  !isCollapsed && "aspect-auto"
                )}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && (
                  theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )
                )}
              </Button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <span className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
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
                  isCollapsed ? "justify-center p-2" : "gap-3 p-2.5 pl-2.5 pr-3"
                )}>
                  <Avatar className={cn(
                    "shrink-0 ring-2 ring-border/50",
                    isCollapsed ? "w-10 h-10" : "w-10 h-10"
                  )}>
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white font-semibold text-sm">
                      {getInitials(session.user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-border pointer-events-none min-w-[200px]">
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{session.user.email}</p>
                      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                    </span>
                  )}
                </div>
                
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "w-full h-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 border-border/50 smooth-transition rounded-full",
                      !isCollapsed && "aspect-auto justify-start px-4"
                    )}
                    onClick={handleSignOut}
                  >
                    <LogOut className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5")} />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">Sign Out</span>
                    )}
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
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
                  size="icon"
                  className={cn(
                    "w-full h-11 hover:bg-accent/50 border-border/50 rounded-full",
                    !isCollapsed && "aspect-auto justify-start px-4"
                  )}
                  onClick={() => router.push("/login")}
                >
                  <LogOut className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-5 h-5")} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">Sign In</span>
                  )}
                </Button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-border pointer-events-none">
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