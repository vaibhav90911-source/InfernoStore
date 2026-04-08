import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, ChevronRight, Key, Shield, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, removeItem, total } = useCart();

  return (
    <div className="min-h-[100dvh] pb-20" style={{ paddingTop: "calc(64px + 3rem)" }}>
      <div className="container mx-auto px-6 max-w-2xl">

        {/* Header */}
        <div className="mb-10">
          <Link href="/store" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Your Cart</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-border/50 flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-7">Add some ranks or crate keys to get started.</p>
            <Link href="/store">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold glow-button">
                Browse Store <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items list */}
            <AnimatePresence initial={false}>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-center justify-between p-5 rounded-2xl bg-card border border-border/60 overflow-hidden group"
                  style={{ boxShadow: `0 0 0 1px ${item.color}12` }}
                >
                  {/* Left color accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: item.color }} />

                  <div className="flex items-center gap-4 pl-3">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                    >
                      {item.type === "key"
                        ? <Key className="h-5 w-5" style={{ color: item.color }} />
                        : <Shield className="h-5 w-5" style={{ color: item.color }} />
                      }
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{item.name}</h3>
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded-full capitalize"
                          style={{ color: item.color, background: `${item.color}15`, border: `1px solid ${item.color}25` }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-lg font-black mt-0.5" style={{ color: item.color }}>
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-px opacity-60 hover:opacity-100"
                    style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Total + CTA */}
            <div className="rounded-2xl bg-card border border-border/70 p-6 mt-2"
              style={{ boxShadow: "0 4px 24px -8px rgba(0,0,0,0.7)" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-muted-foreground">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">₹{total.toLocaleString()}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">+ referral discount at checkout</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-5 space-y-3">
                <Link href="/checkout">
                  <button className="w-full h-12 rounded-xl text-sm font-bold text-white bg-primary glow-button flex items-center justify-center gap-2">
                    Proceed to Checkout <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </Link>
                <Link href="/store">
                  <button className="w-full h-10 rounded-xl text-sm font-medium text-muted-foreground border border-border/50 hover:bg-white/4 hover:text-foreground transition-all">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
