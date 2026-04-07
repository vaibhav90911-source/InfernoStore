import { Flame } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-background">
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-white" fill="white" />
            </div>
            <span className="font-black text-sm tracking-tight text-white">INFERNO SMP</span>
            <span className="text-xs text-muted-foreground ml-1">&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/store" className="hover:text-foreground transition-colors">Store</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>

          <p className="text-xs text-muted-foreground/50">
            play.infernosmp.fun &middot; Not affiliated with Mojang
          </p>
        </div>
      </div>
    </footer>
  );
}
