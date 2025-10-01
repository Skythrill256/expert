"use client";

import { Home, Activity, Upload, TrendingUp, Settings, Menu, X, LogOut, Share2, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/SidebarContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Lifestyle Tracking", href: "/lifestyle", icon: Activity },
  { name: "Upload Report", href: "/upload", icon: Upload },
  { name: "Recommendations", href: "/recommendations", icon: TrendingUp },
  { name: "Share with Doctor", href: "/share", icon: Share2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { data: session, isPending } = useSession();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          "fixed left-0 top-0 h-screen glass-card p-6 z-40 transition-all duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with Toggle */}
          <div className="mb-8 flex items-center justify-between">
            <div className={cn("transition-opacity duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent whitespace-nowrap">
                SperMaxxing
              </h1>
              <p className="text-sm text-muted-foreground mt-1 whitespace-nowrap">Tracker & Optimizer</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex shrink-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl smooth-transition group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed ? "justify-center px-0 py-3 w-12 mx-auto" : "px-4 py-3"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={cn("font-medium transition-opacity duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
                    {item.name}
                  </span>
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & User info */}
          <div className="pt-6 border-t border-border/50 space-y-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="w-full aspect-square"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {isPending ? (
              <div className={cn("flex items-center gap-3 p-3 rounded-xl glass animate-pulse", isCollapsed && "justify-center")}>
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className={cn("flex-1 space-y-2 transition-opacity duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-32" />
                </div>
              </div>
            ) : session?.user ? (
              <>
                <div className={cn("flex items-center gap-3 p-3 rounded-xl glass", isCollapsed && "justify-center")}>
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white font-semibold text-sm">
                      {getInitials(session.user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("flex-1 min-w-0 transition-opacity duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size={isCollapsed ? "icon" : "sm"}
                  className={cn("w-full", isCollapsed && "aspect-square")}
                  onClick={handleSignOut}
                  title={isCollapsed ? "Sign Out" : undefined}
                >
                  <LogOut className="w-4 h-4" />
                  <span className={cn("ml-2 transition-opacity duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
                    Sign Out
                  </span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size={isCollapsed ? "icon" : "sm"}
                className={cn("w-full", isCollapsed && "aspect-square")}
                onClick={() => router.push("/login")}
                title={isCollapsed ? "Sign In" : undefined}
              >
                <LogOut className="w-4 h-4" />
                <span className={cn("ml-2 transition-opacity duration-300", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
                  Sign In
                </span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}