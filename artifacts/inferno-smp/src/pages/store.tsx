import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Zap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetStore,
  useGetMe,
  useBuyRank,
  getGetStoreQueryKey,
  getGetMeQueryKey,
  getGetOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Store() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ranks, isLoading: isLoadingRanks } = useGetStore({ query: { queryKey: getGetStoreQueryKey() } });
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });

  const [selectedRankId, setSelectedRankId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const buyRankMutation = useBuyRank();

  const activeRank = ranks?.find((r) => r.id === selectedRankId);

  const handleBuyClick = (rankId: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to purchase ranks.", variant: "destructive" });
      setLocation("/login");
      return;
    }
    setSelectedRankId(rankId);
    setTransactionId("");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRankId || !transactionId.trim()) return;
    buyRankMutation.mutate({ data: { rank: selectedRankId, transactionId: transactionId.trim() } }, {
      onSuccess: () => {
        toast({ title: "Order Submitted!", description: "Your order is pending approval. Check your dashboard." });
        queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        setSelectedRankId(null);
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ title: "Order Failed", description: err.error || "Failed to submit order.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-[100dvh] pt-24 pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/80 mb-3">Inferno SMP Store</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">Choose Your Rank</h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Support the server and unlock exclusive perks, kits, and privileges.
          </p>
        </div>

        {/* Rank grid */}
        {isLoadingRanks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ranks?.map((rank, idx) => (
              <motion.div
                key={rank.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={idx}
                className="group relative rounded-2xl bg-card border border-border/60 p-7 flex flex-col overflow-hidden card-glow"
                style={{
                  boxShadow: rank.tag ? `0 0 0 1px ${rank.color}30, 0 8px 32px -8px ${rank.color}25` : undefined,
                }}
              >
                {/* Rank color ambient glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 80% 0%, ${rank.color}10, transparent 70%)` }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-2xl"
                  style={{ boxShadow: `inset 0 0 0 1px ${rank.color}30` }}
                />

                {/* Tag */}
                {rank.tag && (
                  <div
                    className="absolute top-0 right-0 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-xl rounded-tr-xl"
                    style={{ background: rank.color, color: "#fff" }}
                  >
                    {rank.tag}
                  </div>
                )}

                <div className="relative z-10 flex flex-col flex-1">
                  {/* Rank name & price */}
                  <h3 className="text-2xl font-black mb-1" style={{ color: rank.color }}>
                    {rank.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">₹{rank.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm font-medium">one-time</span>
                  </div>

                  {/* Perks */}
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                        <Check className="h-3 w-3" style={{ color: rank.color }} />
                      </span>
                      <span className="text-muted-foreground">{rank.homes} Sethomes</span>
                    </li>
                    {rank.rtpCooldown != null && (
                      <li className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                          <Zap className="h-3 w-3" style={{ color: rank.color }} />
                        </span>
                        <span className="text-muted-foreground">{rank.rtpCooldown} min RTP Cooldown</span>
                      </li>
                    )}
                    <li className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                        <Shield className="h-3 w-3" style={{ color: rank.color }} />
                      </span>
                      <span className="text-muted-foreground">Exclusive {rank.name} Kit</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${rank.color}18` }}>
                        <Check className="h-3 w-3" style={{ color: rank.color }} />
                      </span>
                      <span className="text-muted-foreground">Colored Chat &amp; Tab Prefix</span>
                    </li>
                  </ul>

                  {/* Buy button */}
                  <button
                    onClick={() => handleBuyClick(rank.id)}
                    className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                      background: rank.color,
                      boxShadow: `0 4px 16px -4px ${rank.color}60`,
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px -4px ${rank.color}80`)}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px -4px ${rank.color}60`)}
                  >
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── CHECKOUT MODAL ── */}
      <AnimatePresence>
        {selectedRankId && activeRank && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedRankId(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="relative w-full max-w-md bg-card border border-border/70 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
                style={{ boxShadow: `0 0 0 1px ${activeRank.color}20, 0 24px 64px -12px rgba(0,0,0,0.9)` }}
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: activeRank.color }} />

                {/* Close button */}
                <button
                  onClick={() => setSelectedRankId(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="p-7 pt-8">
                  {/* Header */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Checkout</p>
                    <h2 className="text-2xl font-black text-white">
                      <span style={{ color: activeRank.color }}>{activeRank.name}</span> Rank
                    </h2>
                    <p className="text-3xl font-black text-white mt-1">₹{activeRank.price.toLocaleString()}</p>
                  </div>

                  {/* Step 1: Payment details */}
                  <div className="rounded-xl bg-background/60 border border-border/60 p-4 mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Step 1 — Send Payment
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send exactly <span className="text-white font-bold">₹{activeRank.price.toLocaleString()}</span> to:
                    </p>
                    <div className="bg-background border border-border rounded-lg px-4 py-2.5 font-mono text-base text-center select-all" style={{ color: activeRank.color }}>
                      infernosmp@upi
                    </div>
                  </div>

                  {/* Step 2: Transaction ID */}
                  <form onSubmit={handleCheckoutSubmit}>
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Step 2 — Verify Payment
                      </p>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        UPI Transaction ID (UTR)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 312456789012"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        The 12-digit reference number from your UPI app.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={!transactionId.trim() || buyRankMutation.isPending}
                      className="w-full h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                      style={{
                        background: activeRank.color,
                        boxShadow: `0 4px 20px -4px ${activeRank.color}70`,
                      }}
                    >
                      {buyRankMutation.isPending ? "Submitting..." : "Confirm Payment"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
