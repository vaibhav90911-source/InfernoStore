import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Zap, X, Key, Tag, CheckCircle2, AlertCircle } from "lucide-react";
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

const CRATE_KEYS = [
  { id: "beast-key",     name: "Beast Key",     price: 699, description: "Top-tier crate key",  color: "#00E5FF", tag: "TOP TIER" },
  { id: "inferno-key",   name: "Inferno Key",   price: 499, description: "High-tier crate key", color: "#FF2200", tag: null },
  { id: "legendary-key", name: "Legendary Key", price: 299, description: "Mid-tier crate key",  color: "#FF8C00", tag: null },
];

type CheckoutItem = { id: string; name: string; price: number; color: string; type: "rank" | "key" };
type ReferralState = "idle" | "checking" | "valid" | "invalid";

function useReferralValidation(code: string, enabled: boolean) {
  const [state, setState] = useState<ReferralState>("idle");
  const [referralData, setReferralData] = useState<{ creator: string; discount: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || code.trim() === "") {
      setState("idle");
      setReferralData(null);
      return;
    }
    setState("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/referrals/validate/${encodeURIComponent(code.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setState("valid");
          setReferralData({ creator: data.creator, discount: data.discount });
        } else {
          setState("invalid");
          setReferralData(null);
        }
      } catch {
        setState("invalid");
        setReferralData(null);
      }
    }, 600);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [code, enabled]);

  return { state, referralData };
}

export default function Store() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ranks, isLoading: isLoadingRanks } = useGetStore({ query: { queryKey: getGetStoreQueryKey() } });
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });

  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const buyMutation = useBuyRank();

  const { state: referralState, referralData } = useReferralValidation(referralCode, !!checkoutItem);

  const discountedPrice = checkoutItem
    ? referralState === "valid" && referralData
      ? Math.floor(checkoutItem.price * (1 - referralData.discount / 100))
      : checkoutItem.price
    : 0;

  const handleBuyClick = (item: CheckoutItem) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to make a purchase.", variant: "destructive" });
      setLocation("/login");
      return;
    }
    setCheckoutItem(item);
    setTransactionId("");
    setReferralCode("");
  };

  const handleClose = () => { setCheckoutItem(null); setTransactionId(""); setReferralCode(""); };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItem || !transactionId.trim()) return;
    if (referralCode.trim() !== "" && referralState === "invalid") {
      toast({ title: "Invalid Referral Code", description: "Please remove the invalid referral code.", variant: "destructive" });
      return;
    }
    if (referralCode.trim() !== "" && referralState === "checking") return;

    buyMutation.mutate(
      { data: { rank: checkoutItem.id, transactionId: transactionId.trim(), referral: referralCode.trim() || undefined } as any },
      {
        onSuccess: () => {
          toast({ title: "Order Submitted!", description: "Your order is pending approval. Check your dashboard." });
          queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
          handleClose();
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({ title: "Order Failed", description: err.error || "Failed to submit order.", variant: "destructive" });
        },
      }
    );
  };

  const color = checkoutItem?.color ?? "#FF5500";

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
            {ranks?.map((rank, idx) => (
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
                  <button onClick={() => handleBuyClick({ id: rank.id, name: rank.name, price: rank.price, color: rank.color, type: "rank" })}
                    className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all duration-200"
                    style={{ background: rank.color, boxShadow: `0 4px 16px -4px ${rank.color}60` }}>
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
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
            {CRATE_KEYS.map((key, idx) => (
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
                  <button onClick={() => handleBuyClick({ id: key.id, name: key.name, price: key.price, color: key.color, type: "key" })}
                    className="w-full h-11 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{ color: key.color, background: `${key.color}15`, border: `1px solid ${key.color}40` }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${key.color}25`; b.style.borderColor = `${key.color}70`; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${key.color}15`; b.style.borderColor = `${key.color}40`; }}>
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHECKOUT MODAL ── */}
      <AnimatePresence>
        {checkoutItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="relative w-full max-w-md bg-card border border-border/70 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
                style={{ boxShadow: `0 0 0 1px ${color}20, 0 24px 64px -12px rgba(0,0,0,0.9)` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
                <button onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="p-7 pt-8">
                  {/* Header */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Checkout — {checkoutItem.type === "key" ? "Crate Key" : "Rank"}
                    </p>
                    <h2 className="text-2xl font-black text-white">
                      <span style={{ color }}>{checkoutItem.name}</span>
                    </h2>
                    <div className="flex items-baseline gap-2 mt-1">
                      {referralState === "valid" && referralData ? (
                        <>
                          <span className="text-3xl font-black text-white">₹{discountedPrice.toLocaleString()}</span>
                          <span className="text-lg text-muted-foreground line-through">₹{checkoutItem.price.toLocaleString()}</span>
                          <span className="text-sm font-bold text-green-400">-{referralData.discount}%</span>
                        </>
                      ) : (
                        <span className="text-3xl font-black text-white">₹{checkoutItem.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Step 1 */}
                  <div className="rounded-xl bg-background/60 border border-border/60 p-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Step 1 — Send Payment</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send exactly <span className="text-white font-bold">₹{discountedPrice.toLocaleString()}</span> to:
                    </p>
                    <div className="bg-background border border-border rounded-lg px-4 py-2.5 font-mono text-base text-center select-all" style={{ color }}>
                      infernosmp@upi
                    </div>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    {/* Step 2 */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Step 2 — Verify Payment</p>
                      <label className="block text-sm font-medium text-foreground mb-2">UPI Transaction ID (UTR)</label>
                      <input type="text" placeholder="e.g. 312456789012" value={transactionId}
                        onChange={e => setTransactionId(e.target.value)} required
                        className="w-full h-11 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all" />
                      <p className="text-xs text-muted-foreground mt-1.5">The 12-digit reference number from your UPI app.</p>
                    </div>

                    {/* Referral code */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-primary" /> Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <input type="text" placeholder="Enter creator code" value={referralCode}
                          onChange={e => setReferralCode(e.target.value)}
                          className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                            referralState === "valid"   ? "border-green-500/60 focus:ring-green-500/30"  :
                            referralState === "invalid" ? "border-red-500/60 focus:ring-red-500/30"    :
                            "border-input focus:ring-primary/50 focus:border-primary/50"
                          }`} />
                        {referralState === "checking" && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                        )}
                        {referralState === "valid" && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
                        )}
                        {referralState === "invalid" && referralCode.trim() !== "" && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                        )}
                      </div>
                      {referralState === "valid" && referralData && (
                        <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Code by <span className="font-bold">{referralData.creator}</span> — {referralData.discount}% discount applied!
                        </p>
                      )}
                      {referralState === "invalid" && referralCode.trim() !== "" && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Invalid referral code
                        </p>
                      )}
                    </div>

                    <button type="submit"
                      disabled={!transactionId.trim() || buyMutation.isPending || referralState === "invalid" || referralState === "checking"}
                      className="w-full h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                      style={{ background: color, boxShadow: `0 4px 20px -4px ${color}70` }}>
                      {buyMutation.isPending ? "Submitting..." : "Confirm Payment"}
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
