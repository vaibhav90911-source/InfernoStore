import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        window.location.href = "/";
      }
    });
  };

  const NavLinks = () => (
    <>
      <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>Home</Link>
      <Link href="/store" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/store" ? "text-primary" : "text-muted-foreground"}`}>Store</Link>
      {user && (
        <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>Dashboard</Link>
      )}
      {user?.role === "admin" && (
        <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/admin" ? "text-primary" : "text-muted-foreground"}`}>Admin</Link>
      )}
    </>
  );

  const AuthSection = () => (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10">
              <User className="h-4 w-4" />
              {user.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            {user.role === "admin" && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin">Admin Panel</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Login</Link>
          <Link href="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-button">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-destructive flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(255,90,0,0.5)]">
              I
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block glow-text text-white">INFERNO</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>
        </div>

        <div className="hidden md:flex items-center">
          <AuthSection />
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-border flex flex-col gap-6 pt-12">
              <div className="flex flex-col gap-4">
                <NavLinks />
              </div>
              <div className="flex flex-col gap-4 mt-auto mb-8 border-t border-border pt-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium">
                      <User className="h-4 w-4" />
                      {user.username}
                    </div>
                    <Button variant="destructive" onClick={handleLogout} className="justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="w-full justify-start">Login</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full justify-start bg-primary text-white glow-button">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
