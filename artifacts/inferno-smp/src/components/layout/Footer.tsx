import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8 mt-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-destructive flex items-center justify-center font-bold text-white text-xs opacity-80">
            I
          </div>
          <span className="font-semibold text-muted-foreground">Inferno SMP &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/store" className="hover:text-primary transition-colors">Store</Link>
          <a href="#" className="hover:text-primary transition-colors">Discord</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}