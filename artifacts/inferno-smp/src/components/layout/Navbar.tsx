import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { LogOut, User, Menu, Flame } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        window.location.href = "/";
      },
    });
  };

  const isActive = (href: string) => location === href;

  const navLinkClass = (href: string) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive(href)
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      <nav className="fixed top-0 w-full z-40 border-b border-white/6 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(255,85,0,0.5)]">
              <Flame className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <span className="font-black text-lg tracking-tight text-white">INFERNO</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            <Link href="/" className={navLinkClass("/")}>Home</Link>
            <Link href="/store" className={navLinkClass("/store")}>Store</Link>
            {user && <Link href="/dashboard" className={navLinkClass("/dashboard")}>Dashboard</Link>}
            {user?.role === "admin" && (
              <Link href="/admin" className={navLinkClass("/admin")}>Admin</Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm font-medium text-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {user.username}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150 border border-transparent hover:border-white/8"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150">
                  Login
                </Link>
                <Link href="/register">
                  <button className="px-4 py-1.5 h-9 text-sm font-bold rounded-lg bg-primary text-white glow-button">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/6 bg-background/95 backdrop-blur-xl px-6 py-5 flex flex-col gap-4">
            <Link href="/" onClick={() => setMobileOpen(false)} className={navLinkClass("/")}>Home</Link>
            <Link href="/store" onClick={() => setMobileOpen(false)} className={navLinkClass("/store")}>Store</Link>
            {user && <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={navLinkClass("/dashboard")}>Dashboard</Link>}
            {user?.role === "admin" && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className={navLinkClass("/admin")}>Admin</Link>
            )}
            <div className="pt-3 border-t border-white/6">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{user.username}</span>
                  <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                    <button className="w-full h-10 rounded-lg border border-white/10 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">Login</button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                    <button className="w-full h-10 rounded-lg bg-primary text-white text-sm font-bold glow-button">Sign Up</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
