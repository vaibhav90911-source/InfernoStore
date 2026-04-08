import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, Tag, Key, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useGetMe, getGetMeQueryKey, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items, total, clearCart } = useCart();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });

  const [mcUsername, setMcUsername] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [errors, setErrors] = useState<{ mcUsername?: string; transactionId?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-6" style={{ paddingTop: "64px" }}>
        <p className="text-muted-foreground text-sm">Please log in to checkout.</p>
        <Link href="/login">
          <button className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold glow-button">Login</button>
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-6" style={{ paddingTop: "64px" }}>
        <p className="text-muted-foreground text-sm">Your cart is empty.</p>
        <Link href="/store">
          <button className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold glow-button">Go to Store</button>
        </Link>
      </div>
    );
  }

  const validate = () => {
    const errs: typeof errors = {};
    if (!mcUsername.trim()) errs.mcUsername = "Minecraft username is required";
    if (!transactionId.trim()) errs.transactionId = "Transaction ID is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cart-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          minecraftUsername: mcUsername.trim(),
          transactionId: transactionId.trim(),
          referral: referralCode.trim() || undefined,
        }),
      });
      if (res.ok) {
        clearCart();
        queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        setSuccess(true);
        toast({ title: "Order Submitted!", description: "We'll review your payment and activate your purchase." });
        setTimeout(() => setLocation("/dashboard"), 2000);
      } else {
        const d = await res.json();
        toast({ title: "Checkout Failed", description: d.error || "Something went wrong.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-5 px-6" style={{ paddingTop: "64px" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/12 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Order Submitted!</h2>
          <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-2xl">

        {/* Header */}
        <div className="mb-10">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-white">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and confirm your purchase.</p>
        </div>

        <div className="space-y-6">
          {/* Order summary */}
          <div className="rounded-2xl bg-card border border-border/70 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Order Summary</h2>
              <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-5 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                      {item.type === "key"
                        ? <Key className="h-3.5 w-3.5" style={{ color: item.color }} />
                        : <Shield className="h-3.5 w-3.5" style={{ color: item.color }} />
                      }
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: item.color }}>₹{item.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Total</span>
                <span className="text-xl font-black text-white">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* UPI Payment Instructions */}
          <div className="rounded-2xl bg-card border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Step 1 — Send Payment
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Send exactly <span className="font-bold text-white">₹{total.toLocaleString()}</span> via UPI to:
            </p>
            <div className="bg-background border border-border rounded-xl px-4 py-3 text-base font-mono text-center text-primary select-all">
              infernosmp@upi
            </div>
          </div>

          {/* Checkout form */}
          <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border/70 p-5 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 2 — Fill Your Details
            </p>

            {/* Minecraft username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minecraft Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="YourMinecraftIGN"
                value={mcUsername}
                onChange={e => { setMcUsername(e.target.value); setErrors(p => ({ ...p, mcUsername: undefined })); }}
                className={`w-full h-11 px-3.5 rounded-xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                  errors.mcUsername ? "border-red-500/60 focus:ring-red-500/30" : "border-input focus:ring-primary/40 focus:border-primary/50"
                }`}
              />
              {errors.mcUsername && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.mcUsername}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">Your exact in-game name on play.infernosmp.fun</p>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                UPI Transaction ID (UTR) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 312456789012"
                value={transactionId}
                onChange={e => { setTransactionId(e.target.value); setErrors(p => ({ ...p, transactionId: undefined })); }}
                className={`w-full h-11 px-3.5 rounded-xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                  errors.transactionId ? "border-red-500/60 focus:ring-red-500/30" : "border-input focus:ring-primary/40 focus:border-primary/50"
                }`}
              />
              {errors.transactionId && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.transactionId}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">12-digit reference number from your UPI app</p>
            </div>

            {/* Referral code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter creator code"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-13 rounded-xl text-base font-black text-white bg-primary glow-button disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting Order..." : `Confirm Order · ₹${total.toLocaleString()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
