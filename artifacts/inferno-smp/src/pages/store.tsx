import { motion } from "framer-motion";
import { Check, Shield, Zap, Key, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetStore, useGetMe, getGetStoreQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useLocation } from "wouter";
import { Link } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};

const CRATE_KEYS = [
  { id: "beast-key",     name: "Beast Key",     price: 699, description: "Top-tier crate key",  color: "#00E5FF", tag: "TOP TIER" },
  { id: "inferno-key",   name: "Inferno Key",   price: 499, description: "High-tier crate key", color: "#FF2200", tag: null },
  { id: "legendary-key", name: "Legendary Key", price: 299, description: "Mid-tier crate key",  color: "#FF8C00", tag: null },
];

export default function Store() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem, items } = useCart();

  const { data: ranks, isLoading: isLoadingRanks } = useGetStore({ query: { queryKey: getGetStoreQueryKey() } });
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });

  const inCart = (id: string) => items.some(i => i.id === id);

  const handleAddToCart = (item: { id: string; name: string; price: number; color: string; type: "rank" | "key" }) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to add items to your cart.", variant: "destructive" });
      setLocation("/login");
      return;
    }
    if (inCart(item.id)) {
      toast({ title: "Already in Cart", description: `${item.name} is already in your cart.` });
      return;
    }
    addItem(item);
    toast({
      title: "Added to Cart!",
      description: (
        <span>
          <span className="font-bold" style={{ color: item.color }}>{item.name}</span> has been added.{" "}
          <Link href="/cart" className="underline text-primary font-semibold">View Cart →</Link>
        </span>
      ) as any,
    });
  };

  return (
    <div className="min-h-[100dvh] pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-6xl">

        {/* ── RANKS ── */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/80 mb-3">Inferno SMP Store</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">Choose Your Rank</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">Support the server and unlock exclusive perks, kits, and privileges.</p>
        </div>

        {isLoadingRanks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-2xl bg-card border border-border/50 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ranks?.map((rank, idx) => {
              const added = inCart(rank.id);
              return (
                <motion.div key={rank.id} variants={fadeUp} initial="hidden" animate="show" custom={idx}
                  className="group relative rounded-2xl bg-card border border-border/60 p-7 flex flex-col overflow-hidden"
                  style={{ boxShadow: rank.tag ? `0 0 0 1px ${rank.color}30, 0 8px 32px -8px ${rank.color}25` : undefined }}
                  whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 80% 0%, ${rank.color}10, transparent 70%)` }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-2xl"
                    style={{ boxShadow: `inset 0 0 0 1px ${rank.color}30` }} />
                  {rank.tag && (
                    <div className="absolute top-0 right-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-xl rounded-tr-xl"
                      style={{ background: rank.color, color: "#fff" }}>{rank.tag}</div>
                  )}
                  <div className="relative z-10 flex flex-col flex-1">
                    <h3 className="text-2xl font-black mb-1" style={{ color: rank.color }}>{rank.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-black text-white">₹{rank.price.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm font-medium">one-time</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                          <Check className="h-3 w-3" style={{ color: rank.color }} /></span>
                        <span className="text-muted-foreground">{rank.homes} Sethomes</span>
                      </li>
                      {rank.rtpCooldown != null && (
                        <li className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                            <Zap className="h-3 w-3" style={{ color: rank.color }} /></span>
                          <span className="text-muted-foreground">{rank.rtpCooldown} min RTP Cooldown</span>
                        </li>
                      )}
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                          <Shield className="h-3 w-3" style={{ color: rank.color }} /></span>
                        <span className="text-muted-foreground">Exclusive {rank.name} Kit</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                          <Check className="h-3 w-3" style={{ color: rank.color }} /></span>
                        <span className="text-muted-foreground">Colored Chat &amp; Tab Prefix</span>
                      </li>
                    </ul>
                    <button
                      onClick={() => handleAddToCart({ id: rank.id, name: rank.name, price: rank.price, color: rank.color, type: "rank" })}
                      className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        background: added ? "rgba(34,197,94,0.15)" : rank.color,
                        boxShadow: added ? "0 0 0 1px rgba(34,197,94,0.4)" : `0 4px 16px -4px ${rank.color}60`,
                        color: added ? "#4ade80" : "#fff",
                      }}
                    >
                      {added
                        ? <><CheckCircle2 className="h-4 w-4" /> In Cart</>
                        : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                      }
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── CRATE KEYS ── */}
        <div className="mt-24">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/80 mb-3">Crate Keys</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">Open the Crates</h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">Unlock powerful rewards from exclusive crates. Each key opens a treasure trove of rare loot.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {CRATE_KEYS.map((key, idx) => {
              const added = inCart(key.id);
              return (
                <motion.div key={key.id} variants={fadeUp} initial="hidden" animate="show" custom={idx}
                  className="group relative rounded-2xl bg-card border border-border/60 p-7 flex flex-col overflow-hidden"
                  style={{ boxShadow: `0 0 0 1px ${key.color}15` }}
                  whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${key.color}14, transparent 65%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${key.color}, transparent)` }} />
                  {key.tag && (
                    <div className="absolute top-0 right-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-xl rounded-tr-xl"
                      style={{ background: key.color, color: "#000" }}>{key.tag}</div>
                  )}
                  <div className="relative z-10 flex flex-col flex-1 items-center text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `${key.color}15`, border: `1px solid ${key.color}30`, boxShadow: `0 0 20px ${key.color}20` }}>
                      <Key className="h-6 w-6" style={{ color: key.color }} />
                    </div>
                    <h3 className="text-xl font-black mb-1" style={{ color: key.color }}>{key.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{key.description}</p>
                    <div className="flex items-baseline gap-1 mb-7">
                      <span className="text-3xl font-black text-white">₹{key.price.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm">per key</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart({ id: key.id, name: key.name, price: key.price, color: key.color, type: "key" })}
                      className="w-full h-11 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        color: added ? "#4ade80" : key.color,
                        background: added ? "rgba(34,197,94,0.12)" : `${key.color}15`,
                        border: `1px solid ${added ? "rgba(34,197,94,0.4)" : `${key.color}40`}`,
                      }}
                    >
                      {added
                        ? <><CheckCircle2 className="h-4 w-4" /> In Cart</>
                        : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                      }
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
