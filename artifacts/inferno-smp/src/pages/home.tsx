import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, Check, ChevronRight, Shield, Swords, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGetStore, getGetStoreQueryKey } from "@workspace/api-client-react";

const SERVER_IP = "play.infernosmp.fun";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Use suspense or loading state
  const { data: ranks } = useGetStore({ query: { queryKey: getGetStoreQueryKey() } });

  const handleCopyIp = () => {
    navigator.clipboard.writeText(SERVER_IP);
    setCopied(true);
    toast({
      title: "IP Copied!",
      description: `${SERVER_IP} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { icon: Swords, title: "Lifesteal PvP", desc: "Kill players to steal their hearts. Lose all hearts and get banned." },
    { icon: Shield, title: "Custom Enchants", desc: "Unique enchantments to give you the edge in intense combat." },
    { icon: Zap, title: "Daily Events", desc: "Participate in King of the Hill, boss fights, and envoy events." },
    { icon: Trophy, title: "Competitive", desc: "Climb the leaderboards and prove you are the strongest." },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] pt-16">
      {/* Hero Section */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden min-h-[80vh]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Inferno SMP Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-noise" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Season 5 is LIVE
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 glow-text text-white">
              INFERNO SMP
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The most ruthless Lifesteal Minecraft Server. Forge your legacy in blood and fire.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 glow-button font-bold"
                onClick={handleCopyIp}
              >
                {copied ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
                {SERVER_IP}
              </Button>
              <Link href="/store" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-14 px-8 text-lg border-primary/50 hover:bg-primary/20 font-bold"
                >
                  Visit Store <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Inferno?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Experience Minecraft survival like never before.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-colors card-glow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ranks Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Support the Server</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Get exclusive perks and support the development.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {ranks?.slice(0, 3).map((rank, idx) => (
              <motion.div
                key={rank.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all"
                style={{
                  boxShadow: `0 0 20px -10px ${rank.color}`
                }}
              >
                <div 
                  className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
                  style={{ background: `radial-gradient(circle at top right, ${rank.color}, transparent)` }}
                />
                
                <h3 className="text-2xl font-black mb-2" style={{ color: rank.color }}>{rank.name}</h3>
                <div className="text-3xl font-bold mb-6">₹{rank.price}</div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mr-2 text-primary" /> {rank.homes} Sethomes
                  </li>
                  {rank.rtpCooldown && (
                    <li className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 mr-2 text-primary" /> {rank.rtpCooldown}s RTP Cooldown
                    </li>
                  )}
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mr-2 text-primary" /> Exclusive Kits
                  </li>
                </ul>
                
                <Link href="/store" className="block">
                  <Button className="w-full bg-primary/20 hover:bg-primary/40 text-white border border-primary/50">
                    View in Store
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
